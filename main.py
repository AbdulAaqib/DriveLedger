import os
import time
import json
import joblib
import numpy as np
import requests
import tensorflow as tf
import subprocess
import hashlib
import random

from datetime import datetime
from simulate_obd import stream_readings
from colorama import init, Fore, Style
from dotenv import load_dotenv
from supabase import create_client, Client

# ─── Environment & Init ─────────────────────────────────────────────────────
load_dotenv()
init(autoreset=True)

# Pinata API credentials
PINATA_API_KEY        = os.getenv("PINATA_API_KEY")
PINATA_SECRET_API_KEY = os.getenv("PINATA_SECRET_API_KEY")

# Supabase credentials
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Configuration
SCALER_PATH       = "logs/fit/run_1/scaler.pkl"
TFLITE_PATH       = "logs/fit/run_1/model.tflite"
CODES_PATH        = "logs/fit/run_1/fault_codes.pkl"

# Where to write the IPFS URL + token ID
CURRENT_DATA_PATH = "./driverledger-deploy/scripts/current_data.json"
# Path to local JSON of already-used token IDs
USED_IDS_PATH     = "./driverledger-deploy/scripts/used_ids.json"

# ─── Load Model Artifacts ───────────────────────────────────────────────────
scaler       = joblib.load(SCALER_PATH)
fault_codes  = joblib.load(CODES_PATH)

interpreter = tf.lite.Interpreter(model_path=TFLITE_PATH)
interpreter.allocate_tensors()
input_details  = interpreter.get_input_details()
output_details = interpreter.get_output_details()

FEATURE_NAMES = [
    "engine_load", "coolant_temp", "fuel_pressure", "intake_manifold_p",
    "rpm", "speed", "timing_advance", "intake_air_temp", "air_flow_rate",
    "throttle_pos", "engine_run_time", "fuel_level", "warmups_since_clear",
    "barometric_p", "ambient_air_temp", "cmd_throttle_act",
    "time_with_mil_on", "time_since_codes", "hybrid_batt_life", "fuel_rate"
]

# ─── Helpers ────────────────────────────────────────────────────────────────
def load_used_ids():
    """Load the set of used token IDs from JSON file (or create it)."""
    if not os.path.exists(USED_IDS_PATH):
        with open(USED_IDS_PATH, "w") as f:
            json.dump([], f)
        return set()
    with open(USED_IDS_PATH, "r") as f:
        try:
            data = json.load(f)
            return set(data)
        except json.JSONDecodeError:
            return set()

def save_used_id(nonce: int):
    """Append a newly used token ID into the JSON file."""
    used = load_used_ids()
    used.add(nonce)
    with open(USED_IDS_PATH, "w") as f:
        json.dump(sorted(used), f, indent=4)

def generate_token_id() -> int:
    """Generate a random token ID not already used locally or in Supabase."""
    used_ids = load_used_ids()

    # Also fetch existing IDs from Supabase to prevent collisions there
    result = supabase.table("car_nfts").select("nfts").execute()
    if result.data:
        for row in result.data:
            if row["nfts"]:
                for tid in row["nfts"].split(","):
                    try:
                        used_ids.add(int(tid))
                    except ValueError:
                        pass

    while True:
        nonce = random.randint(0, 50_000)
        if nonce not in used_ids:
            save_used_id(nonce)
            return nonce

def preprocess(reading):
    arr = np.array([reading[n] for n in FEATURE_NAMES], dtype=np.float32)
    return scaler.transform(arr.reshape(1, -1))

def predict_fault(x_scaled):
    interpreter.set_tensor(input_details[0]["index"], x_scaled)
    interpreter.invoke()
    probs = interpreter.get_tensor(output_details[0]["index"])[0]
    idx   = int(np.argmax(probs))
    return fault_codes[idx], float(probs[idx])

def format_opensea_metadata(timestamp, fault, confidence, sensor_data):
    attrs = [
        {"trait_type": k, "value": round(v, 3) if isinstance(v, float) else v}
        for k, v in sensor_data.items()
    ]
    attrs.append({"trait_type": "Predicted Fault", "value": fault})
    attrs.append({
        "display_type": "boost_percentage",
        "trait_type": "Confidence",
        "value": round(confidence * 100, 2)
    })

    return {
        "name": "BMW X5 Competition 2025",
        "description": "Security NFT for DriveLedger",
        "external_url": "https://yourprojectwebsite.example.com",
        "image": "https://lime-capable-hookworm-182.mypinata.cloud/ipfs/bafkreicyqfbd25ej2oqeeomz2xziromaxicacw64homxidce7hparv2lc4",
        "attributes": attrs
    }

def upload_to_pinata(json_data, filename):
    url = "https://api.pinata.cloud/pinning/pinJSONToIPFS"
    hdr = {
        "Content-Type":            "application/json",
        "pinata_api_key":          PINATA_API_KEY,
        "pinata_secret_api_key":   PINATA_SECRET_API_KEY
    }
    payload = {
        "pinataOptions":  {"cidVersion": 1},
        "pinataMetadata": {"name": filename},
        "pinataContent":  json_data
    }
    resp = requests.post(url, data=json.dumps(payload), headers=hdr)
    if resp.status_code == 200:
        cid      = resp.json()["IpfsHash"]
        ipfs_url = f"https://gateway.pinata.cloud/ipfs/{cid}"
        print(f"✅ Uploaded to IPFS: {ipfs_url}")
        return ipfs_url
    else:
        print(f"❌ Pinata upload failed: {resp.status_code} {resp.text}")
        return None

def save_current_data(ipfs_url, unique_id):
    os.makedirs(os.path.dirname(CURRENT_DATA_PATH), exist_ok=True)
    payload = {
        "ipfs_url":  ipfs_url,
        "unique_id": unique_id
    }
    with open(CURRENT_DATA_PATH, "w") as f:
        json.dump(payload, f, indent=4)
    print(f"✅ Saved current data to {CURRENT_DATA_PATH}")

def update_car_nfts_table(vin: str, token_id: int):
    result = supabase.table("car_nfts").select("nfts").eq("vin", vin).execute()
    if result.data:
        current_nfts = result.data[0]["nfts"] or ""
        new_nfts = f"{current_nfts},{token_id}" if current_nfts else str(token_id)
        supabase.table("car_nfts").update({"nfts": new_nfts}).eq("vin", vin).execute()
    else:
        supabase.table("car_nfts").insert({"vin": vin, "nfts": str(token_id)}).execute()
    print(f"✅ Supabase updated for VIN {vin} with token ID {token_id}")
def insert_car_data_row(timestamp: str, fault: str, confidence: float, sensor_data: dict, unique_id: str):
    """Insert a row into the `car_data` table."""
    result = supabase.table("car_data").insert({
        "timestamp": timestamp,
        "fault": fault,
        "confidence": confidence,
        "sensor_data": sensor_data,
        "unique_id": unique_id
    }).execute()
    print(f"✅ Inserted row into `car_data` for ID {unique_id}")

def mint_via_hardhat():
    cmd = ["npx", "hardhat", "run", "scripts/mint.js", "--network", "mumbai"]
    print(f"🚀 Running in ./driverledger-deploy: {' '.join(cmd)}")
    subprocess.run(cmd, cwd="./driverledger-deploy", check=True)
    print("✅ Hardhat mint script finished.")

# ─── Main Loop ─────────────────────────────────────────────────────────────
def main():
    print(Fore.CYAN + "🚗 Starting DriveLedger inference...\n" + Style.RESET_ALL)

    try:
        for reading in stream_readings(interval_s=15.0):
            x_scaled     = preprocess(reading)
            fault, conf  = predict_fault(x_scaled)
            ts           = datetime.fromisoformat(reading["timestamp"]).strftime("%Y-%m-%d %H:%M:%S")
            vin          = reading.get("vin", "UNKNOWN_VIN")

            print(Fore.YELLOW + "───────────────────────────────")
            print(f"{Fore.GREEN}Timestamp:{Style.RESET_ALL} {ts}")
            print(f"{Fore.GREEN}Predicted Fault:{Style.RESET_ALL} {Fore.RED}{fault}")
            print(f"{Fore.GREEN}Confidence:{Style.RESET_ALL} {conf:.2%}")
            print(Fore.GREEN + "\nSensor Readings:" + Style.RESET_ALL)
            for n in FEATURE_NAMES:
                print(f"  {n:20}: {reading[n]}")
            print()

            metadata  = format_opensea_metadata(ts, fault, conf,
                                                {k: reading[k] for k in FEATURE_NAMES})
            token_id  = generate_token_id()
            filename  = f"driveledger_{ts.replace(' ', '_').replace(':','-')}.json"
            ipfs_url  = upload_to_pinata(metadata, filename)

            if ipfs_url:
                save_current_data(ipfs_url, token_id)
                update_car_nfts_table(vin, token_id)

                insert_car_data_row(
                    timestamp=ts,
                    fault=fault,
                    confidence=conf,
                    sensor_data={k: reading[k] for k in FEATURE_NAMES},
                    unique_id=str(token_id)
                )

                mint_via_hardhat()


    except KeyboardInterrupt:
        print(Fore.MAGENTA + "\n🛑 Inference stopped by user." + Style.RESET_ALL)

if __name__ == "__main__":
    main()
