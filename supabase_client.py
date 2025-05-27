import os
import json
import hashlib
import random
from supabase import create_client, Client
from dotenv import load_dotenv

# Load .env file
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def generate_token_id(timestamp: str, fault: str) -> int:
    """
    Generate a unique 256-bit unsigned integer token ID by hashing
    the timestamp, fault, and a random nonce.
    """
    nonce = random.randint(0, 1_000_000)
    token_source = f"{timestamp}|{fault}|{nonce}"
    hash_hex = hashlib.sha256(token_source.encode()).hexdigest()
    # Convert hex string to integer
    token_id = int(hash_hex, 16)
    return token_id

def upload_batch(results: list):
    if not results:
        return

    to_upload = []
    for r in results:
        unique_id = generate_token_id(r["timestamp"], r["fault"])

        payload = {
            "timestamp": r["timestamp"],
            "fault": r["fault"],
            "confidence": r["confidence"],
            "sensor_data": r["sensor_data"],
            "unique_id": unique_id,  # uint256 as int
        }
        to_upload.append(payload)

    response = supabase.table("car_data").insert(to_upload).execute()

    if hasattr(response, "data"):
        print(f"✅ Uploaded {len(to_upload)} records.")
    else:
        print("❌ Upload failed:", response)

def upload_single(record: dict):
    unique_id = generate_token_id(record["timestamp"], record["fault"])

    payload = {
        "timestamp": record["timestamp"],
        "fault": record["fault"],
        "confidence": record["confidence"],
        "sensor_data": record["sensor_data"],
        "unique_id": unique_id,  # uint256 as int
    }

    response = supabase.table("car_data").insert(payload).execute()

    if hasattr(response, "data"):
        print(f"✅ Uploaded single record: {payload['timestamp']}")
    else:
        print("❌ Upload failed:", response)
