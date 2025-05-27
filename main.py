import os
import time
import json
import joblib
import numpy as np
import tensorflow as tf
from datetime import datetime
from simulate_obd import stream_readings
from supabase_client import upload_single
from colorama import init, Fore, Style
from dotenv import load_dotenv

# Load .env vars
load_dotenv()
init(autoreset=True)

# ─── Configuration ─────────────────────────────────────────────────────────
SCALER_PATH = "logs/fit/run_1/scaler.pkl"
TFLITE_PATH = "logs/fit/run_1/model.tflite"
CODES_PATH  = "logs/fit/run_1/fault_codes.pkl"

# ─── Load artifacts ─────────────────────────────────────────────────────────
scaler = joblib.load(SCALER_PATH)
fault_codes = joblib.load(CODES_PATH)

interpreter = tf.lite.Interpreter(model_path=TFLITE_PATH)
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

FEATURE_NAMES = [
    "engine_load", "coolant_temp", "fuel_pressure", "intake_manifold_p",
    "rpm", "speed", "timing_advance", "intake_air_temp", "air_flow_rate",
    "throttle_pos", "engine_run_time", "fuel_level", "warmups_since_clear",
    "barometric_p", "ambient_air_temp", "cmd_throttle_act",
    "time_with_mil_on", "time_since_codes", "hybrid_batt_life", "fuel_rate"
]

def preprocess(reading):
    x = np.array([reading[name] for name in FEATURE_NAMES], dtype=np.float32)
    return scaler.transform(x.reshape(1, -1))

def predict_fault(x_scaled):
    interpreter.set_tensor(input_details[0]["index"], x_scaled)
    interpreter.invoke()
    probs = interpreter.get_tensor(output_details[0]["index"])[0]
    idx = int(np.argmax(probs))
    return fault_codes[idx], float(probs[idx])

def main():
    print(Fore.CYAN + "🚗 Starting DriveLedger inference...\n" + Style.RESET_ALL)

    top_result = None
    last_upload_time = time.time()

    try:
        for reading in stream_readings(interval_s=15.0):  # ← inference every 15s
            x_scaled = preprocess(reading)
            fault, confidence = predict_fault(x_scaled)
            timestamp = datetime.fromisoformat(reading["timestamp"]).strftime("%Y-%m-%d %H:%M:%S")

            print(Fore.YELLOW + "───────────────────────────────")
            print(f"{Fore.GREEN}Timestamp:{Style.RESET_ALL} {timestamp}")
            print(f"{Fore.GREEN}Predicted Fault:{Style.RESET_ALL} {Fore.RED}{fault}")
            print(f"{Fore.GREEN}Confidence:{Style.RESET_ALL} {confidence:.2%}")
            print(Fore.GREEN + "\nSensor Readings:" + Style.RESET_ALL)
            for name in FEATURE_NAMES:
                print(f"  {name:20}: {reading[name]}")
            print()

            result = {
                "timestamp": timestamp,
                "fault": fault,
                "confidence": confidence,
                "sensor_data": {k: reading[k] for k in FEATURE_NAMES}
            }

            # Keep highest confidence result within the minute
            if top_result is None or confidence > top_result["confidence"]:
                top_result = result

            # Upload once every 60 seconds
            if time.time() - last_upload_time >= 10:
                print(Fore.CYAN + f"\n📤 Uploading top result at {timestamp}...\n")
                upload_single(top_result)
                last_upload_time = time.time()
                top_result = None

    except KeyboardInterrupt:
        print(Fore.MAGENTA + "\n🛑 Inference stopped by user." + Style.RESET_ALL)

if __name__ == "__main__":
    main()
