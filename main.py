# main.py

import os
import json
import joblib
import numpy as np
import tensorflow as tf
from simulate_obd import stream_readings
from datetime import datetime
from colorama import init, Fore, Style

# Initialize colorama
init(autoreset=True)

# ─── Configuration ─────────────────────────────────────────────────────────
RUN_DIR      = os.getenv("DRIVELEDGER_RUN_DIR", "logs/fit/run_1")  # or set via env
SCALER_PATH  = "logs/fit/run_1/scaler.pkl"
TFLITE_PATH  = "logs/fit/run_1/model.tflite"
CODES_PATH   = "logs/fit/run_1/fault_codes.pkl"

# ─── Load artifacts ─────────────────────────────────────────────────────────
scaler      = joblib.load(SCALER_PATH)
fault_codes = joblib.load(CODES_PATH)  # list of strings in model order

# Instantiate TFLite interpreter via TensorFlow API to avoid numpy mismatch
interpreter = tf.lite.Interpreter(model_path=TFLITE_PATH)
interpreter.allocate_tensors()
input_details  = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# ─── Feature order ───────────────────────────────────────────────────────────
FEATURE_NAMES = [
    "engine_load", "coolant_temp", "fuel_pressure", "intake_manifold_p",
    "rpm", "speed", "timing_advance", "intake_air_temp", "air_flow_rate",
    "throttle_pos", "engine_run_time", "fuel_level", "warmups_since_clear",
    "barometric_p", "ambient_air_temp", "cmd_throttle_act",
    "time_with_mil_on", "time_since_codes", "hybrid_batt_life", "fuel_rate"
]

# ─── Preprocessing & Inference ───────────────────────────────────────────────
def preprocess(reading):
    x = np.array([reading[name] for name in FEATURE_NAMES], dtype=np.float32)
    return scaler.transform(x.reshape(1, -1))


def predict_fault(x_scaled):
    interpreter.set_tensor(input_details[0]["index"], x_scaled)
    interpreter.invoke()
    probs = interpreter.get_tensor(output_details[0]["index"])[0]
    idx   = np.argmax(probs)
    return fault_codes[idx], float(probs[idx])

# ─── Main loop ───────────────────────────────────────────────────────────────
def main():
    print(Fore.CYAN + "🚗 DriveLedger starting inference... Press Ctrl-C to stop.\n" + Style.RESET_ALL)
    try:
        for reading in stream_readings(interval_s=2.0):
            x_scaled = preprocess(reading)
            code, conf = predict_fault(x_scaled)

            # Format timestamp nicely
            ts = datetime.fromisoformat(reading["timestamp"]).strftime("%Y-%m-%d %H:%M:%S")

            print(Fore.YELLOW + "───────────────────────────────" + Style.RESET_ALL)
            print(f"{Fore.GREEN}Timestamp:{Style.RESET_ALL} {ts}")
            print(f"{Fore.GREEN}Predicted Fault:{Style.RESET_ALL} {Fore.RED}{code}{Style.RESET_ALL}")
            print(f"{Fore.GREEN}Confidence:{Style.RESET_ALL} {conf:.2%}")
            print(Fore.GREEN + "\nSensor Readings:" + Style.RESET_ALL)
            for name in FEATURE_NAMES:
                print(f"  {name:20}: {reading[name]}")

            print()  # blank line for spacing
    except KeyboardInterrupt:
        print(Fore.MAGENTA + "\n🛑 Inference stopped by user." + Style.RESET_ALL)


if __name__ == "__main__":
    main()
