import os
import io
import itertools
import datetime

import numpy as np
import pandas as pd
import tensorflow as tf
import matplotlib.pyplot as plt

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.utils import class_weight
from sklearn.metrics import confusion_matrix

# ─── 1. Numbered run directory ────────────────────────────────────────────────
BASE_LOG_DIR = "logs/fit"
os.makedirs(BASE_LOG_DIR, exist_ok=True)
existing = [
    d for d in os.listdir(BASE_LOG_DIR)
    if os.path.isdir(os.path.join(BASE_LOG_DIR, d)) and d.startswith("run_")
]
run_number = len(existing) + 1
run_name = f"run_{run_number}"
log_dir = os.path.join(BASE_LOG_DIR, run_name)
os.makedirs(log_dir, exist_ok=True)
print(f"📝 Logging to {log_dir}")

# ─── 2. Data loading & prep for multi-class ─────────────────────────────────
df = pd.read_csv("training_data.csv")
# Drop non-feature columns
X = df.drop(columns=["timestamp", "verdict", "fault_code"], errors="ignore").values

# Capture and save the list of fault codes
fault_codes = sorted(df["fault_code"].unique())
num_classes = len(fault_codes)
code_to_idx = {code: idx for idx, code in enumerate(fault_codes)}
y_idx = df["fault_code"].map(code_to_idx).values
y = tf.keras.utils.to_categorical(y_idx, num_classes=num_classes)

# Standardize features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Stratified train/test split
X_train, X_test, y_train, y_test, y_train_idx, y_test_idx = train_test_split(
    X_scaled, y, y_idx,
    test_size=0.2,
    random_state=42,
    stratify=y_idx
)

# Compute class weights for imbalanced classes
weights = class_weight.compute_class_weight(
    class_weight="balanced",
    classes=np.arange(num_classes),
    y=y_train_idx
)
class_weights = {i: w for i, w in enumerate(weights)}
print("Class weights:", class_weights)

# ─── 3. Focal Loss definition ─────────────────────────────────────────────────
def focal_loss(gamma=2.0, alpha=0.25):
    def loss_fn(y_true, y_pred):
        y_true = tf.cast(y_true, tf.float32)
        ce = tf.keras.backend.categorical_crossentropy(y_true, y_pred)
        p_t = tf.reduce_sum(y_true * y_pred, axis=-1)
        alpha_factor = tf.reduce_sum(y_true * alpha, axis=-1)
        modulating = tf.pow(1.0 - p_t, gamma)
        return tf.reduce_mean(alpha_factor * modulating * ce)
    return loss_fn

# ─── 4. Build & compile a deeper multi-class model ──────────────────────────
model = tf.keras.Sequential([
    tf.keras.layers.InputLayer(input_shape=(X_train.shape[1],)),
    tf.keras.layers.GaussianNoise(0.1),

    tf.keras.layers.Dense(128, activation="relu"),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.5),

    tf.keras.layers.Dense(64, activation="relu"),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.4),

    tf.keras.layers.Dense(32, activation="relu"),
    tf.keras.layers.BatchNormalization(),
    tf.keras.layers.Dropout(0.3),

    tf.keras.layers.Dense(num_classes, activation="softmax"),
])
model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
    loss=focal_loss(gamma=2.0, alpha=0.25),
    metrics=[tf.keras.metrics.CategoricalAccuracy(name="accuracy")]
)
model.summary()

# ─── 5. Callbacks ─────────────────────────────────────────────────────────────
tb_cb = tf.keras.callbacks.TensorBoard(
    log_dir=log_dir, histogram_freq=1, write_graph=True, write_images=True
)
reduce_lr_cb = tf.keras.callbacks.ReduceLROnPlateau(
    monitor="val_accuracy", factor=0.5, patience=3, min_lr=1e-6, verbose=1
)
es_cb = tf.keras.callbacks.EarlyStopping(
    monitor="val_accuracy", patience=7, restore_best_weights=True, verbose=1
)
print_cb = tf.keras.callbacks.LambdaCallback(
    on_epoch_end=lambda ep, logs: print(
        f"Epoch {ep+1:02d} — loss: {logs['loss']:.4f}, acc: {logs['accuracy']:.4f}, "
        f"val_loss: {logs['val_loss']:.4f}, val_acc: {logs['val_accuracy']:.4f}"
    )
)

def plot_confusion_matrix(cm, labels, title="Confusion Matrix"):
    fig, ax = plt.subplots(figsize=(8, 8))
    im = ax.imshow(cm, interpolation="nearest", cmap=plt.cm.Blues)
    ax.set_title(f"{title} ({run_name})")
    fig.colorbar(im, ax=ax)

    ax.set_xticks(np.arange(len(labels)))
    ax.set_xticklabels(labels, rotation=45, ha="right")
    ax.set_yticks(np.arange(len(labels)))
    ax.set_yticklabels(labels)

    ax.set_xlabel("Predicted label")
    ax.set_ylabel("True label")

    thresh = cm.max() / 2.0
    for i, j in itertools.product(range(cm.shape[0]), range(cm.shape[1])):
        ax.text(j, i, f"{cm[i, j]:d}",
                ha="center", va="center",
                color="white" if cm[i, j] > thresh else "black")
    fig.tight_layout()
    return fig

class ConfusionMatrixLogger(tf.keras.callbacks.Callback):
    def __init__(self, X_test, y_test_idx, log_dir):
        super().__init__()
        self.X_test, self.y_test_idx = X_test, y_test_idx
        self.writer = tf.summary.create_file_writer(os.path.join(log_dir, "cm"))

    def on_epoch_end(self, epoch, logs=None):
        preds = self.model.predict(self.X_test, verbose=0)
        pred_idx = preds.argmax(axis=1)
        cm = confusion_matrix(self.y_test_idx, pred_idx)
        print("Confusion Matrix:\n", cm)
        fig = plot_confusion_matrix(cm, fault_codes)
        buf = io.BytesIO()
        plt.savefig(buf, format="png"); plt.close(fig); buf.seek(0)
        img = tf.image.decode_png(buf.getvalue(), channels=4)
        img = tf.expand_dims(img, 0)
        with self.writer.as_default():
            tf.summary.image("Confusion Matrix", img, step=epoch)

conf_cb = ConfusionMatrixLogger(X_test, y_test_idx, log_dir)

# ─── 6. Train ────────────────────────────────────────────────────────────────
history = model.fit(
    X_train, y_train,
    validation_split=0.2,
    epochs=100,
    batch_size=32,
    verbose=0,
    class_weight=class_weights,
    callbacks=[tb_cb, reduce_lr_cb, es_cb, print_cb, conf_cb]
)

# ─── 7. Save artifacts ───────────────────────────────────────────────────────
import joblib
# Save scaler
joblib.dump(scaler, os.path.join(log_dir, "scaler.pkl"))
# Save fault_codes list for inference mapping
joblib.dump(fault_codes, os.path.join(log_dir, "fault_codes.pkl"))

# 1) Native Keras format
keras_path = os.path.join(log_dir, "model.keras")
model.save(keras_path)
print(f"✅ Saved Keras model to {keras_path}")

# 2) TFLite flatbuffer
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()
tflite_path = os.path.join(log_dir, "model.tflite")
with open(tflite_path, "wb") as f:
    f.write(tflite_model)
print(f"✅ Saved TFLite model to {tflite_path}")

print("All artifacts saved under", log_dir)
