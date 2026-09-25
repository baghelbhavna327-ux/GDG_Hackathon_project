"""
HealthChain AI - Madhya Pradesh Federated Client Node

Client Implementation for Madhya Pradesh State Healthcare Department:
1. Loads ONLY its local dataset: data/madhya_pradesh.csv
2. Creates local medicine demand forecasting model.
3. Receives global model parameters from central server.
4. Sets global parameters in local model.
5. Trains locally on private MP healthcare records.
6. Evaluates locally on MP test partition.
7. Returns updated model parameters, sample count, and training/evaluation metrics.

Privacy Guarantee: Zero raw data rows are transmitted to the server.
"""

import os
import sys

# Ensure parent directory is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from common.client import start_state_client

STATE_NAME = "Madhya Pradesh"
DATA_PATH = os.path.join(BASE_DIR, "data", "madhya_pradesh.csv")

def main():
    server_address = sys.argv[1] if len(sys.argv) > 1 else "127.0.0.1:8080"
    start_state_client(state_name=STATE_NAME, data_path=DATA_PATH, server_address=server_address)

if __name__ == "__main__":
    main()
