import random
import csv
import argparse
from datetime import datetime
from typing import Optional, Dict, Any

# ─── Define the 10 fault types ────────────────────────────────────────────────
FAULT_TYPES = [
    "coolant_overheat",   # coolant_temp too high
    "fuel_low",           # fuel_level too low
    "rpm_spike",          # rpm too high
    "speed_high",         # speed above normal
    "throttle_stuck",     # throttle_pos stuck high or low
    "intake_temp_high",   # intake_air_temp too high
    "air_flow_low",       # air_flow_rate too low
    "barometric_low",     # barometric_p too low
    "ambient_high",       # ambient_air_temp too high
    "fuel_rate_high"      # fuel_rate unusually high
]

def generate_fake_obd_data(force_fault: Optional[str] = None) -> Dict[str, Any]:
    # ─── Base normal readings ───────────────────────────────────────────────────
    rpm             = random.gauss(2500, 800)
    speed           = rpm / 40 + random.uniform(-5, 5)
    throttle_pos    = min(100.0, max(0.0, speed * 0.5 + random.uniform(-10, 10)))
    fuel_level      = random.uniform(5.0, 100.0)
    coolant_temp    = random.gauss(95.0, 10.0)

    data = {
        "timestamp":            datetime.utcnow().isoformat(),
        "engine_load":          round(random.uniform(20.0, 90.0), 2),
        "coolant_temp":         round(coolant_temp, 2),
        "fuel_pressure":        round(random.uniform(30.0, 70.0), 2),
        "intake_manifold_p":    round(random.uniform(30.0, 90.0), 2),
        "rpm":                  int(rpm),
        "speed":                round(speed, 2),
        "timing_advance":       round(random.uniform(-5.0, 25.0), 2),
        "intake_air_temp":      round(random.uniform(15.0, 50.0), 2),
        "air_flow_rate":        round(random.uniform(10.0, 200.0), 2),
        "throttle_pos":         round(throttle_pos, 2),
        "engine_run_time":      random.randint(0, 36000),
        "fuel_level":           round(fuel_level, 2),
        "warmups_since_clear":  random.randint(0, 50),
        "barometric_p":         round(random.uniform(85.0, 105.0), 2),
        "ambient_air_temp":     round(random.uniform(-5.0, 35.0), 2),
        "cmd_throttle_act":     round(throttle_pos + random.uniform(-5, 5), 2),
        "time_with_mil_on":     random.randint(0, 3600 * 2),
        "time_since_codes":     random.randint(0, 3600 * 24 * 7),
        "hybrid_batt_life":     round(random.uniform(50.0, 100.0), 2),
        "fuel_rate":            round(random.uniform(1.0, 20.0), 2)
    }

    # ─── Decide fault_code ─────────────────────────────────────────────────────
    if force_fault in FAULT_TYPES:
        fault_code = force_fault
    elif force_fault == "random":
        fault_code = random.choice(FAULT_TYPES)
    else:
        # natural fault conditions
        if data["coolant_temp"] > 115:
            fault_code = "coolant_overheat"
        elif data["fuel_level"] < 5:
            fault_code = "fuel_low"
        elif data["rpm"] > 5500:
            fault_code = "rpm_spike"
        elif data["speed"] > 120:
            fault_code = "speed_high"
        elif data["throttle_pos"] < 5 or data["throttle_pos"] > 95:
            fault_code = "throttle_stuck"
        elif data["intake_air_temp"] > 45:
            fault_code = "intake_temp_high"
        elif data["air_flow_rate"] < 20:
            fault_code = "air_flow_low"
        elif data["barometric_p"] < 88:
            fault_code = "barometric_low"
        elif data["ambient_air_temp"] > 30:
            fault_code = "ambient_high"
        elif data["fuel_rate"] > 18:
            fault_code = "fuel_rate_high"
        else:
            fault_code = "none"

    # ─── Apply fault effects ────────────────────────────────────────────────────
    if fault_code == "coolant_overheat":
        data["coolant_temp"] = round(random.uniform(120.0, 140.0), 2)
    elif fault_code == "fuel_low":
        data["fuel_level"] = round(random.uniform(0.0, 4.0), 2)
    elif fault_code == "rpm_spike":
        data["rpm"] = random.randint(5600, 7000)
    elif fault_code == "speed_high":
        data["speed"] = round(random.uniform(125.0, 180.0), 2)
    elif fault_code == "throttle_stuck":
        data["throttle_pos"] = random.choice([0.0, 100.0])
        data["cmd_throttle_act"] = data["throttle_pos"]
    elif fault_code == "intake_temp_high":
        data["intake_air_temp"] = round(random.uniform(50.0, 70.0), 2)
    elif fault_code == "air_flow_low":
        data["air_flow_rate"] = round(random.uniform(0.0, 10.0), 2)
    elif fault_code == "barometric_low":
        data["barometric_p"] = round(random.uniform(60.0, 87.0), 2)
    elif fault_code == "ambient_high":
        data["ambient_air_temp"] = round(random.uniform(35.0, 50.0), 2)
    elif fault_code == "fuel_rate_high":
        data["fuel_rate"] = round(random.uniform(20.0, 50.0), 2)

    # ─── Final labels ───────────────────────────────────────────────────────────
    data["fault_code"] = fault_code
    data["verdict"]    = "fault" if fault_code != "none" else "OK"
    return data


def save_fake_data_csv(
    filename: str = "training_data.csv",
    n: int = 1000,
    balance_labels: bool = True,
    seed: Optional[int] = None
):
    if seed is not None:
        random.seed(seed)

    rows, counts = [], {"OK": 0, "fault": 0}
    half = n // 2

    while len(rows) < n:
        if balance_labels:
            want_fault = len(rows) < half
            row = generate_fake_obd_data("random" if want_fault else None)
            # enforce exact balance
            if want_fault and row["verdict"] == "OK":
                continue
            if not want_fault and row["verdict"] == "fault":
                continue
        else:
            row = generate_fake_obd_data()

        rows.append(row)
        counts[row["verdict"]] += 1

    # ─── Write CSV ───────────────────────────────────────────────────────────────
    with open(filename, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)

    print(f"✅ Saved {n} rows to {filename} (OK: {counts['OK']}, fault: {counts['fault']})")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Generate fake OBD-II data (20 features) with 10 fault types"
    )
    parser.add_argument("--n",        type=int, default=2000,
                        help="Total rows to generate")
    parser.add_argument("--filename", type=str, default="training_data.csv",
                        help="Output CSV filename")
    parser.add_argument("--balance",  action="store_true",
                        help="Generate half fault, half OK rows")
    parser.add_argument("--seed",     type=int, default=None,
                        help="Random seed for reproducibility")
    args = parser.parse_args()

    save_fake_data_csv(
        filename=args.filename,
        n=args.n,
        balance_labels=args.balance,
        seed=args.seed
    )
