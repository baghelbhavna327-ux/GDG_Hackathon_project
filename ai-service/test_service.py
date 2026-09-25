"""
HealthChain AI - Comprehensive FastAPI Test Suite
"""

import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://localhost:8000"

def test_health():
    print("\n--- 1. Testing GET /health ---")
    res = urllib.request.urlopen(f"{BASE_URL}/health")
    data = json.loads(res.read().decode())
    print(f"Status Code: {res.status}")
    print("Response:", json.dumps(data, indent=2))
    assert res.status == 200
    assert data.get("status") == "success"
    assert data.get("model_loaded") is True
    print(">> Health check PASSED")

def test_predict():
    print("\n--- 2. Testing POST /predict ---")
    payload = {
        "phc": "Guna PHC-04",
        "state": "Madhya Pradesh",
        "district": "Guna",
        "medicine": "Paracetamol",
        "current_stock": 120,
        "patient_count": 180,
        "previous_consumption": 30,
        "day_of_week": 3,
        "month": 9,
        "emergency_flag": 0
    }
    req = urllib.request.Request(
        f"{BASE_URL}/predict",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode())
    print(f"Status Code: {res.status}")
    print("Response:", json.dumps(data, indent=2))
    assert res.status == 200
    assert data.get("success") is True
    pred_data = data.get("data")
    assert isinstance(pred_data["predicted_daily_demand"], (int, float))
    assert isinstance(pred_data["predicted_7_day_demand"], (int, float))
    assert isinstance(pred_data["shortage_quantity"], (int, float))
    assert pred_data["stock_out_risk"] in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    assert pred_data["predicted_7_day_demand"] == round(pred_data["predicted_daily_demand"] * 7, 1)
    print(">> Standard prediction test PASSED")
    return pred_data

def test_high_risk():
    print("\n--- 3. Testing GET /predictions/high-risk ---")
    res = urllib.request.urlopen(f"{BASE_URL}/predictions/high-risk")
    data = json.loads(res.read().decode())
    print(f"Status Code: {res.status}")
    print(f"High-Risk Records Count: {data.get('count')}")
    sample = data.get("data")[0] if data.get("data") else {}
    print("Sample Item:", json.dumps(sample, indent=2))
    assert res.status == 200
    assert data.get("success") is True
    assert data.get("count") > 0
    for item in data.get("data")[:5]:
        assert item["stock_out_risk"] in ["CRITICAL", "HIGH"]
        assert isinstance(item["shortage_quantity"], (int, float))
    print(">> High-risk endpoint test PASSED")

def test_emergency():
    print("\n--- 4. Testing POST /predict/emergency ---")
    payload = {
        "phc": "Guna PHC-04",
        "state": "Madhya Pradesh",
        "district": "Guna",
        "medicine": "Paracetamol",
        "current_stock": 120,
        "patient_count": 250,
        "previous_consumption": 35
    }
    req = urllib.request.Request(
        f"{BASE_URL}/predict/emergency",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode())
    print(f"Status Code: {res.status}")
    print("Response:", json.dumps(data, indent=2))
    assert res.status == 200
    assert data.get("success") is True
    sim = data.get("data")
    normal_demand = sim["normal"]["predicted_daily_demand"]
    emergency_demand = sim["emergency"]["predicted_daily_demand"]
    assert emergency_demand > normal_demand, "Emergency demand must exceed normal demand"
    assert sim["demand_increase_percentage"] > 0
    assert sim["stock_out_risk"] in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    print(">> Emergency simulation test PASSED")

def test_validation_errors():
    print("\n--- 5. Testing Invalid Inputs / Validation Errors ---")
    payload = {
        "phc": "Guna PHC-04",
        "current_stock": -50  # Negative stock violates ge=0
    }
    req = urllib.request.Request(
        f"{BASE_URL}/predict",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    try:
        urllib.request.urlopen(req)
        assert False, "Negative stock should have triggered 422"
    except urllib.error.HTTPError as e:
        print(f"Expected HTTP Error Code: {e.code}")
        err_body = json.loads(e.read().decode())
        print("Validation Error Response:", json.dumps(err_body, indent=2))
        assert e.code == 422
        print(">> Validation error handling PASSED")

def test_dynamic_model_behavior():
    print("\n--- 6. Testing Dynamic Model Behavior (Non-hardcoded Verification) ---")
    tests = [
        ("Paracetamol", 50),
        ("Paracetamol", 300),
        ("ORS", 50),
        ("ORS", 300),
        ("Amoxicillin", 150)
    ]
    results = []
    for med, footfall in tests:
        payload = {
            "phc": "Guna PHC-04",
            "medicine": med,
            "current_stock": 500,
            "patient_count": footfall,
            "previous_consumption": footfall * 0.2
        }
        req = urllib.request.Request(
            f"{BASE_URL}/predict",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        res = urllib.request.urlopen(req)
        d = json.loads(res.read().decode())["data"]
        results.append((med, footfall, d["predicted_daily_demand"]))
        print(f"  - Medicine: {med:<12} | Footfall: {footfall:<3} -> Daily Demand: {d['predicted_daily_demand']:5.1f} units")

    # Verify demand responsiveness
    assert results[1][2] > results[0][2], "Higher footfall must yield higher daily demand"
    assert results[3][2] > results[2][2], "Higher footfall must yield higher daily demand"
    print(">> Dynamic model behavior verification PASSED")

if __name__ == "__main__":
    test_health()
    test_predict()
    test_high_risk()
    test_emergency()
    test_validation_errors()
    test_dynamic_model_behavior()
    print("\n" + "=" * 50)
    print("ALL 6 FASTAPI SERVICE TEST SUITES PASSED SUCCESSFULLY")
    print("=" * 50 + "\n")
