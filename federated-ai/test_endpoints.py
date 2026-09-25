import urllib.request
import json

endpoints = [
    'http://localhost:8000/federated/status',
    'http://localhost:8000/federated/metadata',
    'http://localhost:5000/api/federated/status',
    'http://localhost:5000/api/federated/metadata'
]

print("=== VERIFYING FEDERATED API ENDPOINTS ===")
for url in endpoints:
    try:
        res = urllib.request.urlopen(url)
        data = json.loads(res.read().decode())
        print(f"[PASS {res.status}] {url} -> success: {data.get('success')}")
    except Exception as e:
        print(f"[FAIL] {url} -> {e}")

print("=== FEDERATED ENDPOINTS VERIFIED ===")
