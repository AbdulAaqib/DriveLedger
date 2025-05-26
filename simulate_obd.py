# simulate_obd.py

import random
import time
from datetime import datetime

def generate_reading():
    return {
        "timestamp":            datetime.utcnow().isoformat(),
        "engine_load":          random.uniform(0.0, 100.0),
        "coolant_temp":         random.uniform(70.0, 110.0),
        "fuel_pressure":        random.uniform(0.0, 100.0),
        "intake_manifold_p":    random.uniform(20.0, 120.0),
        "rpm":                  random.randint(600, 4000),
        "speed":                random.uniform(0.0, 200.0),
        "timing_advance":       random.uniform(-10.0, 40.0),
        "intake_air_temp":      random.uniform(10.0, 50.0),
        "air_flow_rate":        random.uniform(0.0, 300.0),
        "throttle_pos":         random.uniform(0.0, 100.0),
        "engine_run_time":      random.randint(0, 36000),
        "fuel_level":           random.uniform(0.0, 100.0),
        "warmups_since_clear":  random.randint(0, 50),
        "barometric_p":         random.uniform(80.0, 110.0),
        "ambient_air_temp":     random.uniform(-10.0, 40.0),
        "cmd_throttle_act":     random.uniform(0.0, 100.0),
        "time_with_mil_on":     random.randint(0, 3600 * 5),
        "time_since_codes":     random.randint(0, 3600 * 24 * 7),
        "hybrid_batt_life":     random.uniform(0.0, 100.0),
        "fuel_rate":            random.uniform(0.0, 50.0),
        "vin":                  "".join(random.choices("ABCDEFGHJKLMNPRSTUVWXYZ1234567890", k=17))
    }

def stream_readings(interval_s=2.0):
    while True:
        yield generate_reading()
        time.sleep(interval_s)
