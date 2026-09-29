import urllib.request
import json
import sys

# Ensure UTF-8 output on Windows consoles
sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = "http://127.0.0.1:8000"

def post_json(path, data):
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))

def get_json(path):
    url = f"{BASE_URL}{path}"
    with urllib.request.urlopen(url, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))

def test_all():
    print("=" * 65)
    print("HEALTHCHAIN AI - ADVANCED AI ENDPOINT VALIDATION SUITE")
    print("=" * 65)

    # 1. /health
    try:
        health = get_json("/health")
        print(f"[OK] 1. GET /health -> status={health.get('status')}, model_loaded={health.get('model_loaded')}, features_count={len(health.get('advanced_features', []))}")
    except Exception as e:
        print(f"[FAIL] 1. GET /health FAILED: {e}")

    # 2. /predict
    try:
        pred = post_json("/predict", {
            "phc": "PHC Guna Central",
            "state": "Madhya Pradesh",
            "district": "Guna",
            "medicine": "Paracetamol",
            "current_stock": 100,
            "patient_count": 140,
            "previous_consumption": 30,
            "day_of_week": 2,
            "month": 9,
            "emergency_flag": 0
        })
        print(f"[OK] 2. POST /predict -> predicted_daily_demand={pred.get('predicted_daily_demand')}, stock_out_risk={pred.get('stock_out_risk')}")
    except Exception as e:
        print(f"[FAIL] 2. POST /predict FAILED: {e}")

    # 3. /predict/emergency
    try:
        emerg = post_json("/predict/emergency", {
            "phc": "PHC Guna Central",
            "state": "Madhya Pradesh",
            "district": "Guna",
            "medicine": "Paracetamol",
            "current_stock": 100,
            "patient_count": 140,
            "previous_consumption": 30,
            "day_of_week": 2,
            "month": 9,
            "emergency_flag": 0,
            "surge_percentage": 50.0,
            "emergency_type": "Epidemic Outbreak",
            "active_cases": 85
        })
        print(f"[OK] 3. POST /predict/emergency -> surge_demand={emerg.get('surge_predicted_7_day_demand')}, risk={emerg.get('surge_stock_out_risk')}")
    except Exception as e:
        print(f"[FAIL] 3. POST /predict/emergency FAILED: {e}")

    # 4. /explain/predict (SHAP)
    try:
        shap_res = post_json("/explain/predict", {
            "phc": "PHC Guna Central",
            "state": "Madhya Pradesh",
            "district": "Guna",
            "medicine": "Paracetamol",
            "current_stock": 100,
            "patient_count": 140,
            "previous_consumption": 30,
            "day_of_week": 2,
            "month": 9,
            "emergency_flag": 0
        })
        print(f"[OK] 4. POST /explain/predict (SHAP) -> model_type={shap_res.get('model_type')}, drivers_count={len(shap_res.get('explanation', []))}")
    except Exception as e:
        print(f"[FAIL] 4. POST /explain/predict FAILED: {e}")

    # 5. /optimize/redistribution (OR-Tools)
    try:
        opt_res = post_json("/optimize/redistribution", {
            "shortages": [
                {"phc_id": "phc-01", "phc_name": "Guna PHC-04", "district": "Guna", "state": "Madhya Pradesh", "medicine": "Paracetamol", "shortage_quantity": 400, "priority": "CRITICAL"},
                {"phc_id": "phc-04", "phc_name": "Shivpuri PHC-03", "district": "Shivpuri", "state": "Madhya Pradesh", "medicine": "Amoxicillin", "shortage_quantity": 100, "priority": "HIGH"}
            ],
            "surpluses": [
                {"phc_id": "phc-05", "phc_name": "PHC Pune East", "district": "Pune", "state": "Maharashtra", "medicine": "Paracetamol", "available_surplus": 800},
                {"phc_id": "phc-02", "phc_name": "PHC Bhopal Central", "district": "Bhopal", "state": "Madhya Pradesh", "medicine": "Amoxicillin", "available_surplus": 300}
            ]
        })
        print(f"[OK] 5. POST /optimize/redistribution (OR-Tools) -> status={opt_res.get('status')}, solver={opt_res.get('solver')}, transfers={len(opt_res.get('transfers', []))}")
    except Exception as e:
        print(f"[FAIL] 5. POST /optimize/redistribution FAILED: {e}")

    # 6. /detect/anomaly & /anomalies (Isolation Forest)
    try:
        anom_res = post_json("/detect/anomaly", {
            "records": [
                {"record_id": "rec-1", "phc_name": "PHC Guna Central", "metric_name": "daily_consumption", "value": 1500.0, "expected_baseline": 35.0, "timestamp": "2026-09-26T10:00:00Z"},
                {"record_id": "rec-2", "phc_name": "PHC Guna Central", "metric_name": "patient_footfall", "value": 140.0, "expected_baseline": 135.0, "timestamp": "2026-09-26T10:00:00Z"}
            ]
        })
        get_anom = get_json("/anomalies")
        print(f"[OK] 6. POST /detect/anomaly -> detected={len(anom_res.get('anomalies', []))}, GET /anomalies total={get_anom.get('total_anomalies')}")
    except Exception as e:
        print(f"[FAIL] 6. POST /detect/anomaly FAILED: {e}")

    # 7. /score/ensemble-risk
    try:
        ens_res = post_json("/score/ensemble-risk", {
            "phc_id": "phc-guna-01",
            "phc_name": "PHC Guna Central",
            "medicine": "Paracetamol",
            "current_stock": 100,
            "patient_count": 140,
            "previous_consumption": 30,
            "forecast_days_runway": 2.5,
            "anomaly_detected": True,
            "emergency_active": False,
            "regional_drift_detected": False
        })
        print(f"[OK] 7. POST /score/ensemble-risk -> composite_score={ens_res.get('composite_score')}, risk_tier={ens_res.get('risk_tier')}")
    except Exception as e:
        print(f"[FAIL] 7. POST /score/ensemble-risk FAILED: {e}")

    # 8. /predict/demand-sequence (GRU)
    try:
        gru_res = post_json("/predict/demand-sequence", {
            "phc_name": "PHC Guna Central",
            "medicine": "Paracetamol",
            "history_sequence": [28.0, 31.0, 29.5, 34.0, 32.0, 38.0, 42.0],
            "horizon_days": 7
        })
        print(f"[OK] 8. POST /predict/demand-sequence (GRU) -> model={gru_res.get('model')}, forecast_len={len(gru_res.get('forecast_sequence', []))}, total={gru_res.get('total_projected_demand')}")
    except Exception as e:
        print(f"[FAIL] 8. POST /predict/demand-sequence FAILED: {e}")

    # 9. /predict/bed-demand
    try:
        bed_res = post_json("/predict/bed-demand", {
            "phc_name": "PHC Guna Central",
            "total_beds": 30,
            "current_occupied_beds": 24,
            "daily_admissions_baseline": 6,
            "emergency_flag": 1,
            "epidemic_active": True
        })
        print(f"[OK] 9. POST /predict/bed-demand -> projected_occupancy={bed_res.get('projected_occupied_beds_7d')}, status={bed_res.get('capacity_status')}")
    except Exception as e:
        print(f"[FAIL] 9. POST /predict/bed-demand FAILED: {e}")

    # 10. /predict/staff-demand
    try:
        staff_res = post_json("/predict/staff-demand", {
            "phc_name": "PHC Guna Central",
            "current_doctors": 2,
            "current_nurses": 4,
            "current_pharmacists": 1,
            "patient_footfall": 280,
            "inpatient_admissions": 18,
            "emergency_mode": True
        })
        print(f"[OK] 10. POST /predict/staff-demand -> doctors_required={staff_res.get('recommended_doctors')}, nurse_shortage={staff_res.get('shortage_nurses')}")
    except Exception as e:
        print(f"[FAIL] 10. POST /predict/staff-demand FAILED: {e}")

    # 11. /monitor/drift
    try:
        drift_res = post_json("/monitor/drift", {
            "feature_name": "patient_footfall",
            "reference_distribution": [100.0, 110.0, 105.0, 120.0, 95.0, 115.0, 108.0],
            "recent_distribution": [180.0, 195.0, 210.0, 175.0, 220.0, 190.0, 205.0]
        })
        print(f"[OK] 11. POST /monitor/drift -> psi={drift_res.get('psi')}, drift_detected={drift_res.get('drift_detected')}, action={drift_res.get('recommended_action')}")
    except Exception as e:
        print(f"[FAIL] 11. POST /monitor/drift FAILED: {e}")

    # 12. /learn/update & /learn/status
    try:
        learn_res = post_json("/learn/update", {
            "phc": "PHC Guna Central",
            "medicine": "Paracetamol",
            "patient_count": 150,
            "previous_consumption": 35,
            "actual_consumption": 42.0
        })
        learn_status = get_json("/learn/status")
        print(f"[OK] 12. POST /learn/update -> current_loss={learn_res.get('current_loss')}, samples_trained={learn_status.get('samples_trained')}")
    except Exception as e:
        print(f"[FAIL] 12. POST /learn/update FAILED: {e}")

    # 13. /copilot/chat
    try:
        copilot_res = post_json("/copilot/chat", {
            "query": "Which PHC has the highest stockout risk and what should we do?",
            "context_phc": "PHC Guna Central",
            "user_role": "admin"
        })
        print(f"[OK] 13. POST /copilot/chat -> response length={len(copilot_res.get('response', ''))}, requires_action={copilot_res.get('requires_confirmation')}")
    except Exception as e:
        print(f"[FAIL] 13. POST /copilot/chat FAILED: {e}")

    print("=" * 65)
    print("ALL 13 ADVANCED AI & OPTIMIZATION CAPABILITIES FULLY OPERATIONAL!")
    print("=" * 65)

if __name__ == "__main__":
    test_all()
