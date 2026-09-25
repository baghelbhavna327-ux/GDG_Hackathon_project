"""
HealthChain AI - XGBoost Demand Forecasting Pipeline & Model Trainer

1. Loads data/healthcare_data.csv (3,000 synthetic rows)
2. Validates data quality (missing values, duplicates)
3. Preprocesses categorical and numerical features
4. Performs leak-free 80/20 train/test split
5. Trains an XGBoost Regressor (xgb.train / XGBoost Booster)
6. Evaluates using MAE, RMSE, and R-squared (R2)
7. Displays 5 sample predictions vs actual consumption
8. Serializes the complete preprocessing + model pipeline to models/demand_model.pkl
9. Validates that the artifact can be reloaded and queried
"""

import os
import joblib
import numpy as np
import pandas as pd
from pipeline import XGBoostDemandPipeline

# Directory Setup
BASE_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE_DIR, 'data', 'healthcare_data.csv')
MODEL_DIR = os.path.join(BASE_DIR, 'models')
os.makedirs(MODEL_DIR, exist_ok=True)
MODEL_PATH = os.path.join(MODEL_DIR, 'demand_model.pkl')

def load_data():
    """Loads and validates the dataset."""
    if not os.path.exists(DATA_PATH):
        print(f"[Pipeline] Dataset not found at {DATA_PATH}. Generating synthetic data...")
        from generate_data import generate_healthcare_data
        generate_healthcare_data(num_days=30)

    print("\n======================================================")
    print("HealthChain AI - Training Pipeline")
    print("======================================================")
    df = pd.read_csv(DATA_PATH)
    print(f"[1/7] Loaded dataset: {DATA_PATH} ({len(df):,} rows)")

    # Data Quality Validation
    missing_count = df.isnull().sum().sum()
    duplicate_count = df.duplicated().sum()
    print(f"[2/7] Quality check: {missing_count} missing cells, {duplicate_count} duplicates.")

    if missing_count > 0:
        df = df.dropna()
    if duplicate_count > 0:
        df = df.drop_duplicates()

    # Feature type parsing
    df['date'] = pd.to_datetime(df['date'])
    df['day_of_week'] = df['date'].dt.dayofweek
    df['month'] = df['date'].dt.month

    for col in ['patient_count', 'previous_consumption', 'current_stock', 'emergency_flag', 'consumption']:
        df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

    for col in ['state', 'district', 'phc', 'medicine']:
        df[col] = df[col].astype(str).str.strip()

    return df

def train_and_evaluate():
    """Builds pipeline, trains XGBoost, evaluates, and saves artifact."""
    df = load_data()

    # Features & Target
    categorical_features = ['medicine', 'state', 'district', 'phc']
    numerical_features = [
        'patient_count',
        'previous_consumption',
        'current_stock',
        'day_of_week',
        'month',
        'emergency_flag'
    ]
    target_column = 'consumption'

    X = df[categorical_features + numerical_features]
    y = df[target_column]

    print("\n--- Feature Specifications ---")
    print(f"* Categorical Features ({len(categorical_features)}): {categorical_features}")
    print(f"* Numerical Features ({len(numerical_features)}): {numerical_features}")
    print(f"* Target Column: '{target_column}'")

    # 80/20 Train/Test Split (deterministic)
    np.random.seed(42)
    indices = np.arange(len(df))
    np.random.shuffle(indices)
    split_idx = int(len(df) * 0.8)
    train_indices, test_indices = indices[:split_idx], indices[split_idx:]

    X_train, y_train = X.iloc[train_indices].reset_index(drop=True), y.iloc[train_indices].reset_index(drop=True)
    X_test, y_test = X.iloc[test_indices].reset_index(drop=True), y.iloc[test_indices].reset_index(drop=True)

    print(f"\n[3/7] Train/Test Split:")
    print(f"      - Total: {len(df):,} samples")
    print(f"      - Train: {len(X_train):,} samples (80.0%)")
    print(f"      - Test:  {len(X_test):,} samples (20.0%)")

    # Assemble and train pipeline
    print(f"\n[4/7] Initializing XGBoost Regression Pipeline...")
    pipeline = XGBoostDemandPipeline(
        categorical_features=categorical_features,
        numerical_features=numerical_features,
        max_depth=4,
        learning_rate=0.08,
        n_estimators=100
    )

    print(f"[5/7] Training model on {len(X_train):,} training records...")
    pipeline.fit(X_train, y_train)

    # Evaluate on Test Set
    print("[6/7] Evaluating model on unseen test partition...")
    y_pred = pipeline.predict(X_test)
    y_test_arr = y_test.values

    mae = float(np.mean(np.abs(y_test_arr - y_pred)))
    rmse = float(np.sqrt(np.mean((y_test_arr - y_pred) ** 2)))
    ss_res = np.sum((y_test_arr - y_pred) ** 2)
    ss_tot = np.sum((y_test_arr - np.mean(y_test_arr)) ** 2)
    r2 = float(1 - (ss_res / ss_tot)) if ss_tot > 0 else 0.0

    print("\n======================================================")
    print("Model Evaluation Metrics (Test Set)")
    print("======================================================")
    print(f"[OK] Algorithm:                  XGBoost Regressor (XGBRegressor)")
    print(f"[OK] Mean Absolute Error (MAE):  {mae:.2f} units")
    print(f"[OK] Root Mean Sq Error (RMSE):  {rmse:.2f} units")
    print(f"[OK] R-Squared (R2 Score):       {r2:.4f} ({r2*100:.2f}% variance explained)")
    print("======================================================")

    # 5 Sample Predictions Comparison Table
    print("\n--- 5 Sample Predictions vs Actuals ---")
    print(f"{'PHC Name':<24} | {'Medicine':<14} | {'Actual':<8} | {'Predicted':<10} | {'Diff':<6}")
    print("-" * 72)
    for idx in range(5):
        row = X_test.iloc[idx]
        actual_val = y_test.iloc[idx]
        pred_val = round(float(y_pred[idx]), 1)
        diff_val = round(pred_val - actual_val, 1)
        print(f"{row['phc']:<24} | {row['medicine']:<14} | {actual_val:<8} | {pred_val:<10.1f} | {diff_val:+<6.1f}")
    print("-" * 72)

    # Save Pipeline to Joblib
    metadata = {
        'model_name': 'XGBoost Regressor (XGBRegressor)',
        'categorical_features': categorical_features,
        'numerical_features': numerical_features,
        'all_features': categorical_features + numerical_features,
        'target_column': target_column,
        'mae': round(mae, 3),
        'rmse': round(rmse, 3),
        'r2_score': round(r2, 4),
        'total_dataset_rows': len(df),
        'train_rows': len(X_train),
        'test_rows': len(X_test),
        'trained_at': pd.Timestamp.now().isoformat()
    }

    payload = {
        'pipeline': pipeline,
        'metadata': metadata
    }

    joblib.dump(payload, MODEL_PATH)
    print(f"\n[7/7] Complete pipeline artifact saved to: {MODEL_PATH}")

    # Verify reload
    print("\n--- Verifying Model Serialization ---")
    if os.path.exists(MODEL_PATH):
        reloaded = joblib.load(MODEL_PATH)
        assert 'pipeline' in reloaded, "Missing 'pipeline' key in serialized payload"
        assert 'metadata' in reloaded, "Missing 'metadata' key in serialized payload"
        
        # Test inference on single sample
        test_df = X_test.iloc[[0]]
        test_out = reloaded['pipeline'].predict(test_df)
        print(f"[OK] Model file exists at: {MODEL_PATH} ({os.path.getsize(MODEL_PATH)/1024:.1f} KB)")
        print(f"[OK] Successfully reloaded model artifact from disk.")
        print(f"[OK] Test inference on reloaded pipeline: {test_out[0]:.2f} units.")
    else:
        print(f"[ERROR] Model file {MODEL_PATH} was not found.")

    return pipeline, metadata

if __name__ == "__main__":
    train_and_evaluate()
