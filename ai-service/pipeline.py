"""
HealthChain AI - XGBoost Pipeline Definition Module
"""

import numpy as np
import pandas as pd
import xgboost as xgb

class XGBoostDemandPipeline:
    """
    Unified leak-free preprocessing and XGBoost regression pipeline.
    Encapsulates categorical encodings, numerical scalers, and the XGBoost booster.
    """
    def __init__(self, categorical_features, numerical_features, max_depth=4, learning_rate=0.08, n_estimators=100):
        self.categorical_features = categorical_features
        self.numerical_features = numerical_features
        self.max_depth = max_depth
        self.learning_rate = learning_rate
        self.n_estimators = n_estimators
        
        self.categories_map = {}
        self.encoded_feature_names = []
        self.scaler_mean = None
        self.scaler_std = None
        self.booster = None

    def fit(self, X_train: pd.DataFrame, y_train: pd.Series):
        """Fits preprocessing parameters and trains the XGBoost booster."""
        # 1. Fit Categorical Categories
        self.categories_map = {}
        cat_encoded_dfs = []
        for col in self.categorical_features:
            unique_vals = sorted(X_train[col].astype(str).unique().tolist())
            self.categories_map[col] = unique_vals
            for val in unique_vals:
                col_name = f"{col}_{val}"
                cat_encoded_dfs.append((col_name, (X_train[col].astype(str) == val).astype(np.float32)))

        # 2. Fit Numerical Scaler
        num_data = X_train[self.numerical_features].values.astype(np.float32)
        self.scaler_mean = np.mean(num_data, axis=0)
        self.scaler_std = np.std(num_data, axis=0)
        self.scaler_std[self.scaler_std == 0] = 1.0  # Avoid zero division
        
        scaled_num = (num_data - self.scaler_mean) / self.scaler_std

        # 3. Combine Features
        cat_feature_names = [name for name, _ in cat_encoded_dfs]
        cat_matrix = np.column_stack([series.values for _, series in cat_encoded_dfs]) if cat_encoded_dfs else np.empty((len(X_train), 0))
        
        self.encoded_feature_names = cat_feature_names + self.numerical_features
        X_processed = np.hstack([cat_matrix, scaled_num])

        # 4. Train XGBoost Booster
        dtrain = xgb.DMatrix(X_processed, label=y_train.values.astype(np.float32), feature_names=self.encoded_feature_names)
        params = {
            'objective': 'reg:squarederror',
            'max_depth': self.max_depth,
            'learning_rate': self.learning_rate,
            'subsample': 0.85,
            'colsample_bytree': 0.85,
            'seed': 42,
            'tree_method': 'hist'
        }
        self.booster = xgb.train(params, dtrain, num_boost_round=self.n_estimators)
        return self

    def transform(self, X: pd.DataFrame) -> np.ndarray:
        """Applies fitted encoding and scaling to incoming inference data."""
        cat_cols = []
        for col in self.categorical_features:
            unique_vals = self.categories_map.get(col, [])
            input_col = X[col].astype(str) if col in X else pd.Series([""] * len(X))
            for val in unique_vals:
                cat_cols.append((input_col == val).astype(np.float32).values)

        num_input = X[self.numerical_features].values.astype(np.float32)
        scaled_num = (num_input - self.scaler_mean) / self.scaler_std

        cat_matrix = np.column_stack(cat_cols) if cat_cols else np.empty((len(X), 0))
        return np.hstack([cat_matrix, scaled_num])

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        """Generates demand predictions for a dataframe."""
        X_processed = self.transform(X)
        dtest = xgb.DMatrix(X_processed, feature_names=self.encoded_feature_names)
        preds = self.booster.predict(dtest)
        return np.maximum(1.0, preds)  # Ensure non-negative consumption
