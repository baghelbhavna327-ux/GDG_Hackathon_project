"""
HealthChain AI - Federated Learning Simulation Runner

Automates the complete Federated Learning simulation:
1. Starts the Central FedAvg Aggregation Server
2. Connects 3 State Clients (Madhya Pradesh, Rajasthan, Gujarat)
3. Coordinates multi-round collaborative training
4. Validates the serialized global model artifact
"""

import os
import sys
import time
import subprocess
import threading

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVER_SCRIPT = os.path.join(BASE_DIR, "server", "server.py")
CLIENT_SCRIPTS = [
    ("Madhya Pradesh", os.path.join(BASE_DIR, "clients", "madhya_pradesh.py")),
    ("Rajasthan", os.path.join(BASE_DIR, "clients", "rajasthan.py")),
    ("Gujarat", os.path.join(BASE_DIR, "clients", "gujarat.py")),
]

IGNORE_PATTERNS = [
    "DEPRECATED FEATURE",
    "flower-superlink",
    "flower-supernode",
    "Using `start_server()`",
    "Using `start_client()`",
    "This is a deprecated feature",
    "entirely in future versions",
    "Received: ",
    "Sent reply",
    "Disconnect and shut down",
    "INFO :",
    "WARNING :",
    "History (",
    "round 1:",
    "round 2:",
    "round 3:",
    "{'mae':",
    "Run finished",
    "add_port.cc",
    "grpc_server",
    "No address added"
]

def should_print_line(line: str) -> bool:
    stripped = line.strip()
    if not stripped:
        return False
    if any(pat in line for pat in IGNORE_PATTERNS):
        return False
    return True

def run_script(name: str, path: str, logs: list):
    try:
        proc = subprocess.Popen(
            [sys.executable, "-u", path],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            encoding="utf-8",
            errors="replace",
            bufsize=1
        )
        for line in iter(proc.stdout.readline, ''):
            if should_print_line(line):
                cleaned = line.strip()
                print(cleaned, flush=True)
                logs.append(cleaned)
        proc.wait()
    except Exception as e:
        print(f"[{name} ERROR] {e}", flush=True)

def run_simulation(num_rounds: int = 3):
    logs = []
    
    # 1. Start Server Process in Background
    server_proc = subprocess.Popen(
        [sys.executable, "-u", SERVER_SCRIPT, "8080", str(num_rounds)],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        encoding="utf-8",
        errors="replace",
        bufsize=1
    )

    def monitor_server():
        for line in iter(server_proc.stdout.readline, ''):
            if should_print_line(line):
                cleaned = line.strip()
                print(cleaned, flush=True)
                logs.append(cleaned)

    server_thread = threading.Thread(target=monitor_server, daemon=True)
    server_thread.start()

    # Wait for server to bind port 8080
    time.sleep(3)

    # 2. Launch 3 State Clients Concurrently
    client_threads = []
    for name, script_path in CLIENT_SCRIPTS:
        t = threading.Thread(target=run_script, args=(name, script_path, logs))
        t.start()
        client_threads.append(t)
        time.sleep(0.3)

    # 3. Wait for all clients to finish
    for t in client_threads:
        t.join()

    # 4. Wait for server to finish
    server_proc.wait(timeout=10)

if __name__ == "__main__":
    rounds = int(sys.argv[1]) if len(sys.argv) > 1 else 3
    run_simulation(num_rounds=rounds)
