import os
import sys
import logging
import warnings

# Suppress Flower and gRPC deprecation warnings and internal debug noise
warnings.filterwarnings("ignore")
logging.getLogger("flwr").setLevel(logging.ERROR)
os.environ["FLWR_LOG_LEVEL"] = "ERROR"
os.environ["GRPC_VERBOSITY"] = "NONE"

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import flwr as fl
import numpy as np
from typing import Dict, Tuple, List, Any

# Ensure parent directory is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from common.model import (
    create_model,
    train_model,
    get_parameters,
    set_parameters,
    evaluate_model,
    FederatedDemandModel
)
from common.utils import load_state_data

class HealthChainStateClient(fl.client.NumPyClient):
    """
    Standardized, reusable federated client for state healthcare departments.
    Operates strictly within the local state node boundary.
    """
    def __init__(self, state_name: str, data_path: str, lr: float = 0.01):
        self.state_name = state_name
        self.data_path = data_path
        
        # 1. Load ONLY local state dataset
        if not os.path.exists(data_path):
            raise FileNotFoundError(f"[{state_name}] Local dataset not found: {data_path}")

        self.X_train, self.y_train, self.X_test, self.y_test = load_state_data(data_path)
        
        # 2. Create local demand prediction model
        self.model: FederatedDemandModel = create_model(n_features=self.X_train.shape[1], lr=lr)

    def get_parameters(self, config: Dict[str, Any]) -> List[np.ndarray]:
        """
        Extracts and returns current local model parameters (W, b).
        Never sends raw healthcare rows.
        """
        return get_parameters(self.model)

    def fit(self, parameters: List[np.ndarray], config: Dict[str, Any]) -> Tuple[List[np.ndarray], int, Dict[str, Any]]:
        """
        1. Receives global model parameters from the server.
        2. Sets parameters in local model.
        3. Trains model using ONLY local state training data.
        4. Returns updated model parameters, number of local examples, and training loss/metrics.
        """
        # Set global model parameters
        set_parameters(self.model, parameters)

        epochs = int(config.get("local_epochs", 10))
        round_num = config.get("current_round", 1)

        # Train locally
        train_metrics = train_model(self.model, (self.X_train, self.y_train), epochs=epochs)
        train_loss = float(train_metrics.get("rmse", 0.0) ** 2)

        print(f"[✓] {self.state_name} local training (Train Loss: {train_loss:.3f}, MAE: {train_metrics['mae']:.2f}, R²: {train_metrics['r2']:.4f})", flush=True)

        return get_parameters(self.model), len(self.X_train), {
            "train_loss": train_loss,
            "train_mae": float(train_metrics["mae"]),
            "train_rmse": float(train_metrics["rmse"]),
            "train_r2": float(train_metrics["r2"])
        }

    def evaluate(self, parameters: List[np.ndarray], config: Dict[str, Any]) -> Tuple[float, int, Dict[str, Any]]:
        """
        1. Receives aggregated global parameters from the server.
        2. Sets parameters in local model.
        3. Evaluates model performance on local validation data.
        4. Returns evaluation loss, number of evaluation examples, and metrics dictionary.
        """
        # Set global model parameters
        set_parameters(self.model, parameters)

        # Evaluate locally
        eval_loss, eval_metrics = evaluate_model(self.model, (self.X_test, self.y_test))

        print(f"    └─ [{self.state_name}] Local Validation: Loss {eval_loss:.2f} | MAE {eval_metrics['mae']:.2f} | RMSE {eval_metrics['rmse']:.2f} | R² {eval_metrics['r2']:.4f}", flush=True)

        return float(eval_loss), len(self.X_test), {
            "eval_loss": float(eval_loss),
            "mae": float(eval_metrics["mae"]),
            "rmse": float(eval_metrics["rmse"]),
            "r2": float(eval_metrics["r2"])
        }

def start_state_client(state_name: str, data_path: str, server_address: str = "127.0.0.1:8080"):
    """Connects a state client to the central Flower aggregation server."""
    client = HealthChainStateClient(state_name=state_name, data_path=data_path)
    try:
        fl.client.start_client(
            server_address=server_address,
            client=client.to_client()
        )
    except Exception as e:
        # Gracefully handle server completion disconnect
        pass

