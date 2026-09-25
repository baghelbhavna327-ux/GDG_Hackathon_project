"""
HealthChain AI - Federated Model Definition & Local Training Interface

Provides:
1. FederatedDemandModel: Lightweight parameter-based regression model for medicine demand.
2. Functional API for federated clients and server:
   - create_model()
   - train_model(model, data)
   - get_parameters(model)
   - set_parameters(model, parameters)
   - evaluate_model(model, data)

Privacy Guarantee: All data processing and training occurs locally on the client node.
Only numeric parameter weights (W, b) are extracted and shared with the server.
"""

import os
import joblib
import numpy as np
from typing import List, Dict, Any, Tuple, Union
from common.utils import compute_metrics, get_feature_names

class FederatedDemandModel:
    """
    Lightweight, parameterized medicine demand forecasting model.
    Predicts daily consumption using linear/polynomial feature representations.
    Supports seamless parameter extraction and FedAvg aggregation.
    """
    def __init__(self, n_features: int = 21, lr: float = 0.01, l2_reg: float = 0.001):
        self.n_features = n_features
        self.lr = lr
        self.l2_reg = l2_reg
        self.weights = np.zeros(n_features, dtype=np.float32)
        self.bias = np.float32(0.0)

    def get_weights(self) -> List[np.ndarray]:
        """Extracts parameters as a list of NumPy arrays [weights, [bias]]."""
        return [self.weights.copy(), np.array([self.bias], dtype=np.float32)]

    def set_weights(self, parameters: List[np.ndarray]) -> None:
        """Updates internal parameters from aggregated weights."""
        if len(parameters) >= 2:
            self.weights = np.array(parameters[0], dtype=np.float32).ravel()
            self.bias = float(np.array(parameters[1], dtype=np.float32).ravel()[0])
        elif len(parameters) == 1:
            self.weights = np.array(parameters[0], dtype=np.float32).ravel()

    def fit(self, X: np.ndarray, y: np.ndarray, epochs: int = 20, batch_size: int = 32, lr: float = None) -> Dict[str, float]:
        """
        Trains model weights locally on the client's private partition.
        Uses standardized pre-conditioning to ensure rapid and stable convergence.
        """
        X = np.asarray(X, dtype=np.float32)
        y = np.asarray(y, dtype=np.float32).ravel()
        n_samples, n_features = X.shape

        # Standardize for numerical stability
        mu = np.mean(X, axis=0)
        std = np.std(X, axis=0)
        std[std == 0] = 1.0
        X_scaled = (X - mu) / std

        # Augment with bias column: [X_scaled, 1]
        X_aug = np.hstack([X_scaled, np.ones((n_samples, 1), dtype=np.float32)])
        
        reg_matrix = self.l2_reg * np.eye(n_features + 1, dtype=np.float32)
        reg_matrix[-1, -1] = 0.0  # Do not regularize bias

        try:
            theta = np.linalg.solve(X_aug.T @ X_aug + reg_matrix, X_aug.T @ y)
        except np.linalg.LinAlgError:
            theta = np.linalg.pinv(X_aug.T @ X_aug + reg_matrix) @ (X_aug.T @ y)

        theta_w = theta[:n_features].astype(np.float32)
        theta_b = float(theta[-1])

        # Map back to direct input feature space: y = X * w + b
        self.weights = (theta_w / std).astype(np.float32)
        self.bias = float(theta_b - np.sum(mu * theta_w / std))

        y_pred = self.predict(X)
        return compute_metrics(y, y_pred)

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Predicts daily medicine consumption in units."""
        X = np.asarray(X, dtype=np.float32)
        preds = np.dot(X, self.weights) + self.bias
        return np.maximum(1.0, np.round(preds, 1))

    def evaluate(self, X: np.ndarray, y: np.ndarray) -> Tuple[float, Dict[str, float]]:
        """
        Evaluates the model on local test data.
        Returns loss (MSE) and evaluation metrics dictionary (MAE, RMSE, R2).
        """
        y = np.asarray(y, dtype=np.float32).ravel()
        y_pred = self.predict(X)
        metrics = compute_metrics(y, y_pred)
        mse_loss = float(np.mean((y - y_pred) ** 2))
        return mse_loss, metrics

    def save(self, file_path: str, metadata: Dict[str, Any] = None) -> None:
        """Serializes the model to disk."""
        os.makedirs(os.path.dirname(os.path.abspath(file_path)), exist_ok=True)
        payload = {
            "model": self,
            "weights": self.weights,
            "bias": self.bias,
            "feature_names": get_feature_names(),
            "metadata": metadata or {}
        }
        joblib.dump(payload, file_path)
        print(f"[Federated Model] Saved artifact to: {file_path}")

    @classmethod
    def load(cls, file_path: str):
        """Loads serialized model artifact from disk."""
        payload = joblib.load(file_path)
        return payload["model"], payload.get("metadata", {})


# =====================================================================
# Top-Level Functional API for Clients and Aggregator
# =====================================================================

def create_model(n_features: int = 21, lr: float = 0.01, l2_reg: float = 0.001) -> FederatedDemandModel:
    """
    Creates a new instance of the federated medicine demand model.
    """
    return FederatedDemandModel(n_features=n_features, lr=lr, l2_reg=l2_reg)

def train_model(
    model: FederatedDemandModel,
    data: Union[Tuple[np.ndarray, np.ndarray], Dict[str, np.ndarray]],
    epochs: int = 20,
    batch_size: int = 32,
    lr: float = None
) -> Dict[str, float]:
    """
    Trains the local model on private client data.
    Accepts data as (X_train, y_train) tuple or dict.
    Returns local training evaluation metrics.
    """
    if isinstance(data, (tuple, list)):
        X_train, y_train = data[0], data[1]
    elif isinstance(data, dict):
        X_train = data.get("X_train", data.get("X"))
        y_train = data.get("y_train", data.get("y"))
    else:
        raise ValueError("Data must be a (X, y) tuple or dictionary with 'X_train' and 'y_train'.")

    return model.fit(X_train, y_train, epochs=epochs, batch_size=batch_size, lr=lr)

def get_parameters(model: FederatedDemandModel) -> List[np.ndarray]:
    """
    Extracts model parameter weights as a list of NumPy arrays.
    These parameters are sent to the central server during Federated Learning.
    """
    return model.get_weights()

def set_parameters(model: FederatedDemandModel, parameters: List[np.ndarray]) -> None:
    """
    Updates the local model with aggregated global weights received from the central server.
    """
    model.set_weights(parameters)

def evaluate_model(
    model: FederatedDemandModel,
    data: Union[Tuple[np.ndarray, np.ndarray], Dict[str, np.ndarray]]
) -> Tuple[float, Dict[str, float]]:
    """
    Evaluates the model on test data.
    Returns (loss, metrics_dict) where metrics_dict contains MAE, RMSE, and R2.
    """
    if isinstance(data, (tuple, list)):
        X_test, y_test = data[0], data[1]
    elif isinstance(data, dict):
        X_test = data.get("X_test", data.get("X"))
        y_test = data.get("y_test", data.get("y"))
    else:
        raise ValueError("Data must be a (X, y) tuple or dictionary with 'X_test' and 'y_test'.")

    return model.evaluate(X_test, y_test)

def load_global_model(model_path: str = None) -> FederatedDemandModel:
    """
    Loads the trained federated global model for future inference and integration.
    
    Parameters:
        model_path (str, optional): Custom path to the global model artifact.
                                    If None, automatically resolves from 'models/global_model',
                                    'models/global_model.pkl', or 'models/federated_global_model.pkl'.
                                    
    Returns:
        FederatedDemandModel: The trained global model instance.
    """
    if model_path is None:
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        candidates = [
            os.path.join(base_dir, "models", "global_model"),
            os.path.join(base_dir, "models", "global_model.pkl"),
            os.path.join(base_dir, "models", "global_model.joblib"),
            os.path.join(base_dir, "models", "federated_global_model.pkl"),
        ]
        for candidate in candidates:
            if os.path.exists(candidate) and os.path.isfile(candidate):
                model_path = candidate
                break

    if model_path is None or not os.path.exists(model_path):
        raise FileNotFoundError(f"Trained global model artifact not found. Please run federated training first. (Looked in {model_path})")

    model, metadata = FederatedDemandModel.load(model_path)
    model.metadata = metadata
    return model

