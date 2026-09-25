"""
HealthChain AI - Federated Learning Common Utilities

Provides data loading, feature preprocessing, train/test splitting,
and model evaluation functions for local state clients and server.
"""

import os
import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any, List

MEDICINE_LIST = ["Paracetamol", "Amoxicillin", "Azithromycin", "Ibuprofen", "ORS"]
NUMERICAL_FEATURES = ["patient_count", "previous_consumption", "current_stock", "day_of_week", "month", "emergency_flag"]
TARGET_COLUMN = "consumption"

def get_feature_names() -> List[str]:
    """Returns the ordered list of all feature names after encoding."""
    med_cols = [f"med_{m}" for m in MEDICINE_LIST]
    inter_cols = [f"patient_x_{m}" for m in MEDICINE_LIST]
    emerg_cols = [f"emerg_x_{m}" for m in MEDICINE_LIST]
    return NUMERICAL_FEATURES + med_cols + inter_cols + emerg_cols

def preprocess_dataframe(df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
    """
    Transforms raw state dataframe into normalized feature matrix X and target vector y.
    Includes medicine-specific footfall and emergency interaction terms for accurate regression.
    Strictly preserves privacy by processing data locally inside the client.
    """
    X_num = df[NUMERICAL_FEATURES].values.astype(np.float32)
    patient_count = df["patient_count"].values.astype(np.float32)
    emergency_flag = df["emergency_flag"].values.astype(np.float32)

    # One-hot encoding and interaction terms for medicines
    med_encoded = []
    med_patient_inter = []
    med_emerg_inter = []

    for med in MEDICINE_LIST:
        is_med = (df["medicine"].astype(str) == med).astype(np.float32).values
        med_encoded.append(is_med)
        med_patient_inter.append(is_med * patient_count)
        med_emerg_inter.append(is_med * emergency_flag * patient_count)

    X_med = np.column_stack(med_encoded)
    X_inter = np.column_stack(med_patient_inter)
    X_emerg = np.column_stack(med_emerg_inter)

    X = np.hstack([X_num, X_med, X_inter, X_emerg]).astype(np.float32)
    y = df[TARGET_COLUMN].values.astype(np.float32)

    return X, y


def load_state_data(state_file: str, test_ratio: float = 0.2, seed: int = 42) -> Tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    Loads local state CSV data, applies preprocessing, and performs train/test split.
    """
    if not os.path.exists(state_file):
        raise FileNotFoundError(f"State dataset not found: {state_file}")

    df = pd.read_csv(state_file)
    X, y = preprocess_dataframe(df)

    np.random.seed(seed)
    indices = np.arange(len(X))
    np.random.shuffle(indices)

    test_size = int(len(X) * test_ratio)
    test_idx = indices[:test_size]
    train_idx = indices[test_size:]

    X_train, y_train = X[train_idx], y[train_idx]
    X_test, y_test = X[test_idx], y[test_idx]

    return X_train, y_train, X_test, y_test

def compute_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """Calculates MAE, RMSE, and R2 evaluation metrics."""
    y_true = np.asarray(y_true, dtype=np.float32).ravel()
    y_pred = np.asarray(y_pred, dtype=np.float32).ravel()

    mae = float(np.mean(np.abs(y_true - y_pred)))
    mse = float(np.mean((y_true - y_pred) ** 2))
    rmse = float(np.sqrt(mse))

    ss_tot = float(np.sum((y_true - np.mean(y_true)) ** 2))
    ss_res = float(np.sum((y_true - y_pred) ** 2))
    r2 = 1.0 - (ss_res / ss_tot) if ss_tot > 0 else 0.0

    return {
        "mae": round(mae, 3),
        "rmse": round(rmse, 3),
        "r2": round(r2, 4)
    }
