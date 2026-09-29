"""
HealthChain AI - Operational Anomaly Detection Service
Uses scikit-learn Isolation Forest to detect anomalous consumption, footfall shocks, and inventory drain across PHCs.
"""

try:
    import numpy as np
except ImportError:
    np = None

from typing import Dict, Any, List, Optional

try:
    from sklearn.ensemble import IsolationForest
except Exception:
    IsolationForest = None

_isolation_forest_model = None

def _train_default_anomaly_model():
    """Trains a baseline IsolationForest model on representative multi-feature PHC operational telemetry."""
    global _isolation_forest_model
    if IsolationForest is None or np is None:
        return None
    try:
        np.random.seed(42)
        normal_data = np.random.normal(
            loc=[1.0, 1.0, 0.15, 0.70, 0.90],
            scale=[0.18, 0.20, 0.05, 0.12, 0.08],
            size=(800, 5)
        )
        normal_data[:, 0] = np.clip(normal_data[:, 0], 0.4, 1.8)
        normal_data[:, 1] = np.clip(normal_data[:, 1], 0.5, 2.0)
        normal_data[:, 2] = np.clip(normal_data[:, 2], 0.02, 0.40)
        normal_data[:, 3] = np.clip(normal_data[:, 3], 0.20, 0.95)
        normal_data[:, 4] = np.clip(normal_data[:, 4], 0.60, 1.0)

        model = IsolationForest(
            n_estimators=100,
            contamination=0.08,
            random_state=42
        )
        model.fit(normal_data)
        _isolation_forest_model = model
        return model
    except Exception:
        _isolation_forest_model = None
        return None

def get_anomaly_model():
    global _isolation_forest_model
    if _isolation_forest_model is None:
        _train_default_anomaly_model()
    return _isolation_forest_model

def detect_anomaly(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluates an operational telemetry record for statistical and behavioral anomalies.
    """
    model = get_anomaly_model()

    phc = str(data.get('phc') or data.get('phc_name') or 'Guna PHC-04')
    medicine = str(data.get('medicine') or 'Paracetamol')
    
    # 1. Feature normalization
    daily_consumption = float(data.get('daily_consumption') or data.get('previous_consumption') or 45.0)
    baseline_consumption = float(data.get('baseline_consumption') or max(15.0, daily_consumption * 0.7))
    consumption_ratio = daily_consumption / max(1.0, baseline_consumption)

    patient_footfall = float(data.get('patient_count') or data.get('daily_patient_footfall') or 150.0)
    baseline_footfall = float(data.get('baseline_footfall') or 120.0)
    footfall_ratio = patient_footfall / max(1.0, baseline_footfall)

    current_stock = float(data.get('current_stock') or 100.0)
    stock_burn_pct = daily_consumption / max(1.0, current_stock)

    bed_occupancy = float(data.get('bed_occupancy_pct') or 0.75)
    staff_attendance = float(data.get('staff_attendance_pct') or 0.88)

    raw_pred = 1
    raw_score = 0.05
    if model is not None and np is not None:
        try:
            sample = np.array([[
                consumption_ratio,
                footfall_ratio,
                stock_burn_pct,
                bed_occupancy,
                staff_attendance
            ]])
            raw_pred = model.predict(sample)[0]  # -1 = anomaly, 1 = normal
            raw_score = float(model.decision_function(sample)[0])  # Lower = more anomalous
        except Exception:
            pass

    is_anomaly = raw_pred == -1 or consumption_ratio > 2.2 or footfall_ratio > 2.0 or stock_burn_pct > 0.65

    # Compute Anomaly Severity and Explanatory Rationale
    severity = "LOW"
    reasons = []

    if is_anomaly:
        if consumption_ratio > 2.0:
            reasons.append(f"Consumption surge (+{((consumption_ratio - 1) * 100):.0f}% above historical baseline)")
        if footfall_ratio > 1.8:
            reasons.append(f"Acute OPD patient influx (+{((footfall_ratio - 1) * 100):.0f}% jump)")
        if stock_burn_pct > 0.50:
            reasons.append(f"Rapid stock depletion ({stock_burn_pct * 100:.0f}% of total inventory consumed in 24h)")
        if bed_occupancy > 0.92:
            reasons.append(f"Critical bed saturation ({bed_occupancy * 100:.0f}% occupied)")
        if staff_attendance < 0.60:
            reasons.append(f"Significant staff absenteeism ({staff_attendance * 100:.0f}% on duty)")

        if not reasons:
            reasons.append("Multi-variate statistical anomaly detected in joint consumption & footfall distribution")

        # Severity classification based on score and factors
        if raw_score < -0.15 or consumption_ratio > 2.5 or stock_burn_pct > 0.70:
            severity = "CRITICAL"
        elif raw_score < -0.05 or consumption_ratio > 1.8:
            severity = "HIGH"
        else:
            severity = "MEDIUM"

    explanation = "; ".join(reasons) if reasons else "Telemetry is within normal expected statistical distribution."

    return {
        "phc": phc,
        "medicine": medicine,
        "anomaly_detected": bool(is_anomaly),
        "anomaly_score": round(raw_score, 4),
        "severity": severity,
        "metric_deviations": {
            "consumption_ratio": round(consumption_ratio, 2),
            "footfall_ratio": round(footfall_ratio, 2),
            "stock_burn_pct": round(stock_burn_pct * 100, 1),
            "bed_occupancy_pct": round(bed_occupancy * 100, 1),
            "staff_attendance_pct": round(staff_attendance * 100, 1)
        },
        "reason": explanation
    }

def get_batch_anomalies(phc_records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Evaluates multiple PHC facilities and returns detected anomalies sorted by severity."""
    results = []
    for rec in phc_records:
        res = detect_anomaly(rec)
        if res["anomaly_detected"]:
            results.append(res)
    
    severity_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    results.sort(key=lambda x: (severity_order.get(x["severity"], 4), x["anomaly_score"]))
    return results
