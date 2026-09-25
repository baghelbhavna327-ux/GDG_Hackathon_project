"""
HealthChain AI - 20-Point QA Final Inspection Suite
"""

import os
import sys
import json
import urllib.request
import urllib.error
import pandas as pd
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "healthcare_data.csv")
MODEL_PATH = os.path.join(BASE_DIR, "models", "demand_model.pkl")
BASE_URL = "http://localhost:8000"

results = {}

def run_qa():
    print("==================================================")
    print("   HEALTHCHAIN AI - 20-POINT QA VERIFICATION      ")
    print("==================================================")

    # 1. Dataset generation
    try:
        from generate_data import generate_healthcare_data
        df_gen = generate_healthcare_data(num_days=30)
        results["1_dataset_generation"] = ("PASSED", f"Generated dataframe in-memory and on disk: {len(df_gen)} rows")
    except Exception as e:
        results["1_dataset_generation"] = ("FAILED", str(e))

    # 2. Dataset row count (~3,000 records)
    try:
        df = pd.read_csv(DATA_PATH)
        count = len(df)
        assert 2900 <= count <= 3100, f"Expected ~3,000 rows, found {count}"
        results["2_dataset_count"] = ("PASSED", f"Exact row count: {count} rows")
    except Exception as e:
        results["2_dataset_count"] = ("FAILED", str(e))

    # 3. No PII exists
    try:
        df = pd.read_csv(DATA_PATH)
        pii_keywords = ["name", "patient_name", "phone", "aadhaar", "email", "address", "ssn", "dob"]
        found_pii = [col for col in df.columns if any(k in col.lower() for k in pii_keywords)]
        assert len(found_pii) == 0, f"Found potential PII columns: {found_pii}"
        results["3_no_pii"] = ("PASSED", f"Columns: {list(df.columns)} (0 PII columns)")
    except Exception as e:
        results["3_no_pii"] = ("FAILED", str(e))

    # 4. Model training works
    try:
        from train import train_and_evaluate
        pipeline, metrics = train_and_evaluate()
        results["4_model_training"] = ("PASSED", f"Training completed successfully. R2: {metrics['r2_score']:.4f}")
    except Exception as e:
        results["4_model_training"] = ("FAILED", str(e))

    # 5. Model file is created
    try:
        assert os.path.exists(MODEL_PATH), "Model file not found"
        size_kb = os.path.getsize(MODEL_PATH) / 1024
        assert size_kb > 10, f"Model file suspiciously small: {size_kb:.1f} KB"
        results["5_model_file_created"] = ("PASSED", f"Path: models/demand_model.pkl ({size_kb:.1f} KB)")
    except Exception as e:
        results["5_model_file_created"] = ("FAILED", str(e))

    # 6. Model can be loaded
    try:
        payload = joblib.load(MODEL_PATH)
        pipeline = payload.get("pipeline")
        meta = payload.get("metadata")
        assert pipeline is not None, "Pipeline object is None"
        assert pipeline.booster is not None, "Booster object is None"
        results["6_model_loadable"] = ("PASSED", f"Pipeline loaded successfully. Categorical: {len(pipeline.categorical_features)}, Numerical: {len(pipeline.numerical_features)}")
    except Exception as e:
        results["6_model_loadable"] = ("FAILED", str(e))



    # 7. Test metrics displayed
    try:
        mae = meta.get("mae")
        rmse = meta.get("rmse")
        r2 = meta.get("r2_score")
        assert all(v is not None for v in [mae, rmse, r2]), "Metrics missing in metadata"
        results["7_test_metrics"] = ("PASSED", f"MAE: {mae:.2f}, RMSE: {rmse:.2f}, R2: {r2:.4f}")
    except Exception as e:
        results["7_test_metrics"] = ("FAILED", str(e))

    # 8. /health works
    try:
        res = urllib.request.urlopen(f"{BASE_URL}/health")
        h_data = json.loads(res.read().decode())
        assert res.status == 200 and h_data.get("status") == "success" and h_data.get("model_loaded") is True
        results["8_health_endpoint"] = ("PASSED", f"Status 200 OK: {h_data}")
    except Exception as e:
        results["8_health_endpoint"] = ("FAILED", str(e))

    # 9. /predict works
    try:
        req_data = {
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
            data=json.dumps(req_data).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        res = urllib.request.urlopen(req)
        p_data = json.loads(res.read().decode())
        assert res.status == 200 and p_data.get("success") is True
        daily_d = p_data["data"]["predicted_daily_demand"]
        results["9_predict_endpoint"] = ("PASSED", f"Status 200 OK. Predicted daily demand: {daily_d}")
    except Exception as e:
        results["9_predict_endpoint"] = ("FAILED", str(e))

    # 10. /predict/emergency works
    try:
        em_data = {
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
            data=json.dumps(em_data).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        res = urllib.request.urlopen(req)
        e_data = json.loads(res.read().decode())
        assert res.status == 200 and e_data.get("success") is True
        norm_d = e_data["data"]["normal"]["predicted_daily_demand"]
        emerg_d = e_data["data"]["emergency"]["predicted_daily_demand"]
        pct = e_data["data"]["demand_increase_percentage"]
        assert emerg_d > norm_d
        results["10_emergency_endpoint"] = ("PASSED", f"Status 200 OK. Normal: {norm_d}, Emergency: {emerg_d} (+{pct}%)")
    except Exception as e:
        results["10_emergency_endpoint"] = ("FAILED", str(e))

    # 11. /predictions/high-risk works
    try:
        res = urllib.request.urlopen(f"{BASE_URL}/predictions/high-risk")
        hr_data = json.loads(res.read().decode())
        assert res.status == 200 and hr_data.get("success") is True
        count = hr_data.get("count", 0)
        assert count > 0
        results["11_high_risk_endpoint"] = ("PASSED", f"Status 200 OK. Found {count} high/critical risk items")
    except Exception as e:
        results["11_high_risk_endpoint"] = ("FAILED", str(e))

    # 12. Stock-out risk calculation works
    try:
        from app.prediction import predict_demand
        low_risk = predict_demand({"current_stock": 1000, "patient_count": 50})
        crit_risk = predict_demand({"current_stock": 10, "patient_count": 200})
        assert low_risk["stock_out_risk"] in ["LOW", "MEDIUM"]
        assert crit_risk["stock_out_risk"] == "CRITICAL"
        results["12_risk_calculation"] = ("PASSED", f"Low stock -> {crit_risk['stock_out_risk']}; High stock -> {low_risk['stock_out_risk']}")
    except Exception as e:
        results["12_risk_calculation"] = ("FAILED", str(e))

    # 13. Shortage calculation works
    try:
        shortage_test = predict_demand({"current_stock": 50, "patient_count": 200})
        expected_shortage = max(round(shortage_test["predicted_7_day_demand"] - 50.0, 1), 0.0)
        assert shortage_test["shortage_quantity"] == expected_shortage
        results["13_shortage_calculation"] = ("PASSED", f"Computed shortage: {shortage_test['shortage_quantity']} units")
    except Exception as e:
        results["13_shortage_calculation"] = ("FAILED", str(e))

    # 14. Explainable reason is generated
    try:
        reason_str = p_data["data"].get("reason", "")
        assert len(reason_str) > 20 and "stock" in reason_str.lower()
        results["14_explainable_reason"] = ("PASSED", f"Reason: '{reason_str[:60]}...'")
    except Exception as e:
        results["14_explainable_reason"] = ("FAILED", str(e))

    # 15. Invalid input is handled (HTTP 422)
    try:
        bad_req = urllib.request.Request(
            f"{BASE_URL}/predict",
            data=json.dumps({"phc": "Test", "current_stock": -100}).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        urllib.request.urlopen(bad_req)
        results["15_invalid_input_handling"] = ("FAILED", "Did not return HTTP 422 on negative stock")
    except urllib.error.HTTPError as e:
        if e.code == 422:
            results["15_invalid_input_handling"] = ("PASSED", "Returned HTTP 422 Unprocessable Content with validation detail")
        else:
            results["15_invalid_input_handling"] = ("FAILED", f"Returned unexpected HTTP status: {e.code}")
    except Exception as e:
        results["15_invalid_input_handling"] = ("FAILED", str(e))

    # 16. CORS works
    try:
        cors_req = urllib.request.Request(
            f"{BASE_URL}/health",
            headers={"Origin": "http://localhost:5000"}
        )
        cors_res = urllib.request.urlopen(cors_req)
        allow_origin = cors_res.headers.get("Access-Control-Allow-Origin")
        assert allow_origin in ["*", "http://localhost:5000"], f"Unexpected CORS origin header: {allow_origin}"
        results["16_cors_configuration"] = ("PASSED", f"Access-Control-Allow-Origin: {allow_origin}")
    except Exception as e:
        results["16_cors_configuration"] = ("FAILED", str(e))

    # 17. No hard-coded prediction response is used
    try:
        p1 = predict_demand({"medicine": "Paracetamol", "patient_count": 50, "current_stock": 200})["predicted_daily_demand"]
        p2 = predict_demand({"medicine": "Paracetamol", "patient_count": 300, "current_stock": 200})["predicted_daily_demand"]
        assert p2 > p1 * 2, f"Predictions do not respond dynamically to footfall (p1: {p1}, p2: {p2})"
        results["17_dynamic_predictions"] = ("PASSED", f"Footfall 50 -> {p1} units; Footfall 300 -> {p2} units")
    except Exception as e:
        results["17_dynamic_predictions"] = ("FAILED", str(e))

    # 18. FastAPI starts successfully on port 8000
    try:
        res = urllib.request.urlopen(f"{BASE_URL}/")
        r_data = json.loads(res.read().decode())
        assert res.status == 200 and r_data.get("status") == "active"
        results["18_fastapi_running"] = ("PASSED", f"Running on http://localhost:8000 (status: active)")
    except Exception as e:
        results["18_fastapi_running"] = ("FAILED", str(e))

    # 19. requirements.txt is complete
    try:
        with open(os.path.join(BASE_DIR, "requirements.txt"), "r") as f:
            reqs = f.read()
        for pkg in ["fastapi", "uvicorn", "pydantic", "pandas", "numpy", "xgboost", "joblib"]:
            assert pkg in reqs.lower(), f"Missing {pkg} in requirements.txt"
        results["19_requirements_txt"] = ("PASSED", "All core dependencies present in requirements.txt")
    except Exception as e:
        results["19_requirements_txt"] = ("FAILED", str(e))

    # 20. README contains setup and API documentation
    try:
        with open(os.path.join(BASE_DIR, "README.md"), "r", encoding="utf-8") as f:
            readme = f.read()
        for sec in ["/health", "/predict", "/predict/emergency", "/predictions/high-risk", "uvicorn", "requirements.txt"]:
            assert sec in readme, f"Missing {sec} in README.md"
        results["20_readme_documentation"] = ("PASSED", "README contains complete setup and all 4 endpoint docs")
    except Exception as e:
        results["20_readme_documentation"] = ("FAILED", str(e))


    # Print summary table
    print("\n--- FINAL QA SUMMARY ---")
    all_passed = True
    for key, (status, detail) in results.items():
        print(f"[{status}] Check {key.replace('_', ' ').upper()}: {detail}")
        if status != "PASSED":
            all_passed = False

    print("\n==================================================")
    print(f"OVERALL RESULT: {'ALL 20 CHECKS PASSED' if all_passed else 'SOME CHECKS FAILED'}")
    print("==================================================")
    return all_passed

if __name__ == "__main__":
    success = run_qa()
    sys.exit(0 if success else 1)
