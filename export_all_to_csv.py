#!/usr/bin/env python3
import os
import csv
import pickle
import numpy as np
import tensorflow as tf

# CHANGE THIS to the full path if needed
BASE_DIR = os.path.expanduser("/Users/abdulaaqib/Developer/Github/DriveLedger/logs/fit/run_1")

def dump_model_keras(model_path):
    model = tf.keras.models.load_model(model_path, compile=False)
    for layer in model.layers:
        weights = layer.get_weights()
        if not weights:
            continue
        flattened = []
        for arr in weights:
            flattened.append(arr.flatten())
        combined = np.concatenate(flattened)[..., np.newaxis]
        csv_path = os.path.join(BASE_DIR, f"weights_{layer.name}.csv")
        np.savetxt(csv_path, combined, delimiter=",", header=f"{layer.name} weights", comments='')
        print("Wrote", csv_path)

def dump_tflite(model_path):
    interpreter = tf.lite.Interpreter(model_path=model_path)
    interpreter.allocate_tensors()
    rows = []
    for tensor in interpreter.get_tensor_details():
        rows.append([
            tensor["name"],
            str(tensor["shape"].tolist()),
            str(tensor["dtype"])
        ])
    out_path = os.path.join(BASE_DIR, "tflite_tensors.csv")
    with open(out_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["name", "shape", "dtype"])
        writer.writerows(rows)
    print("Wrote tflite_tensors.csv")

def dump_scaler(pkl_path):
    with open(pkl_path, "rb") as f:
        scaler = pickle.load(f)
    rows = []
    for attr in ("mean_", "scale_", "var_", "data_min_", "data_max_"):
        if hasattr(scaler, attr):
            val = getattr(scaler, attr)
            rows.append([attr, *val.tolist()])
    out_path = os.path.join(BASE_DIR, "scaler_params.csv")
    with open(out_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["parameter", *[f"f{i}" for i in range(len(rows[0])-1)]])
        writer.writerows(rows)
    print("Wrote scaler_params.csv")

def dump_fault_codes(pkl_path):
    with open(pkl_path, "rb") as f:
        codes = pickle.load(f)
    if isinstance(codes, dict):
        rows = [[k, v] for k, v in codes.items()]
        header = ["code", "description"]
    else:
        rows = [[c] for c in codes]
        header = ["code"]
    out_path = os.path.join(BASE_DIR, "fault_codes.csv")
    with open(out_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(rows)
    print("Wrote fault_codes.csv")

def summarize_image_dirs():
    rows = []
    for split in ("train", "validation"):
        split_dir = os.path.join(BASE_DIR, split)
        if not os.path.isdir(split_dir):
            continue
        for cls in os.listdir(split_dir):
            cls_path = os.path.join(split_dir, cls)
            if os.path.isdir(cls_path):
                count = len(os.listdir(cls_path))
                rows.append([split, cls, count])
    out_path = os.path.join(BASE_DIR, "dataset_summary.csv")
    with open(out_path, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["split", "class", "count"])
        writer.writerows(rows)
    print("Wrote dataset_summary.csv")

def dump_confusion_matrices():
    cm_dir = os.path.join(BASE_DIR, "cm")
    if not os.path.isdir(cm_dir):
        return
    for fname in os.listdir(cm_dir):
        if fname.endswith(".npy"):
            cm = np.load(os.path.join(cm_dir, fname))
            out_path = os.path.join(BASE_DIR, f"{os.path.splitext(fname)[0]}.csv")
            np.savetxt(out_path, cm, delimiter=",", header=f"{fname} matrix", comments='')
            print("Wrote", out_path)

if __name__ == "__main__":
    dump_model_keras(os.path.join(BASE_DIR, "model.keras"))
    dump_tflite(os.path.join(BASE_DIR, "model.tflite"))
    dump_scaler(os.path.join(BASE_DIR, "scaler.pkl"))
    dump_fault_codes(os.path.join(BASE_DIR, "fault_codes.pkl"))
    summarize_image_dirs()
    dump_confusion_matrices()
    print("✅ All CSV exports complete.")
