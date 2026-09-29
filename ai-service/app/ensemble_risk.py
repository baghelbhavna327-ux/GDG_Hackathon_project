"""
HealthChain AI - Ensemble Multi-Signal Operational Risk Engine
Combines inventory runway, XGBoost forecast, Isolation Forest anomaly severity, bed pressure, and staff load.
"""

from typing import Dict, Any, List

def compute_ensemble_risk(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes a transparent, weighted multi-signal operational risk score (0-100) and tier.
    """
    phc = str(data.get('phc') or data.get('phc_name') or 'Guna PHC-04')
    medicine = str(data.get('medicine') or 'Paracetamol')

    # Signal 1: Stock-Out Risk & Days Remaining (Weight: 35%)
    days_remaining = float(data.get('days_remaining') or 3.0)
    stock_out_raw = str(data.get('stock_out_risk') or 'HIGH').upper()
    if days_remaining <= 1.5 or stock_out_raw == 'CRITICAL':
        s_stock = 100.0
        signal_stock = 'CRITICAL'
    elif days_remaining <= 3.5 or stock_out_raw == 'HIGH':
        s_stock = 75.0
        signal_stock = 'HIGH'
    elif days_remaining <= 6.0 or stock_out_raw == 'WARNING':
        s_stock = 45.0
        signal_stock = 'MEDIUM'
    else:
        s_stock = 15.0
        signal_stock = 'LOW'

    # Signal 2: Demand Surge Velocity (Weight: 20%)
    predicted_daily = float(data.get('predicted_daily_demand') or 40.0)
    baseline_daily = float(data.get('baseline_daily_demand') or 25.0)
    surge_ratio = predicted_daily / max(1.0, baseline_daily)
    if surge_ratio >= 1.8:
        s_demand = 95.0
        signal_demand = 'CRITICAL'
    elif surge_ratio >= 1.4:
        s_demand = 75.0
        signal_demand = 'HIGH'
    elif surge_ratio >= 1.15:
        s_demand = 50.0
        signal_demand = 'MEDIUM'
    else:
        s_demand = 15.0
        signal_demand = 'LOW'

    # Signal 3: Anomaly Detection Signal (Weight: 15%)
    anomaly_sev = str(data.get('anomaly_severity') or 'LOW').upper()
    anomaly_detected = bool(data.get('anomaly_detected', False))
    if anomaly_sev == 'CRITICAL' or (anomaly_detected and surge_ratio > 2.0):
        s_anomaly = 95.0
        signal_anomaly = 'CRITICAL'
    elif anomaly_sev == 'HIGH' or anomaly_detected:
        s_anomaly = 70.0
        signal_anomaly = 'HIGH'
    elif anomaly_sev == 'MEDIUM':
        s_anomaly = 45.0
        signal_anomaly = 'MEDIUM'
    else:
        s_anomaly = 10.0
        signal_anomaly = 'LOW'

    # Signal 4: Emergency / Outbreak Mode (Weight: 15%)
    is_emergency = int(data.get('emergency_flag', 0)) == 1 or bool(data.get('is_emergency', False))
    if is_emergency:
        s_emerg = 90.0
        signal_emerg = 'HIGH'
    else:
        s_emerg = 10.0
        signal_emerg = 'LOW'

    # Signal 5: Bed & Staff Pressure (Weight: 15%)
    bed_occ = float(data.get('bed_occupancy_pct') or 0.75)
    staff_att = float(data.get('staff_attendance_pct') or 0.85)
    bed_staff_score = (bed_occ * 60.0) + ((1.0 - staff_att) * 40.0)
    if bed_staff_score >= 80.0:
        s_capacity = 90.0
        signal_capacity = 'CRITICAL'
    elif bed_staff_score >= 60.0:
        s_capacity = 65.0
        signal_capacity = 'HIGH'
    elif bed_staff_score >= 40.0:
        s_capacity = 40.0
        signal_capacity = 'MEDIUM'
    else:
        s_capacity = 15.0
        signal_capacity = 'LOW'

    # Weighted Total Score
    total_score = (
        (0.35 * s_stock) +
        (0.20 * s_demand) +
        (0.15 * s_anomaly) +
        (0.15 * s_emerg) +
        (0.15 * s_capacity)
    )

    # 4-Tier Overall Operational Risk Classification
    if total_score >= 75.0 or (s_stock == 100.0 and s_demand >= 75.0):
        overall_risk = "CRITICAL"
        action_recom = "Immediate emergency redistribution dispatch and reserve inventory lock required."
    elif total_score >= 55.0:
        overall_risk = "HIGH"
        action_recom = "Initiate supply reorder request and schedule intra-district buffer transfer."
    elif total_score >= 35.0:
        overall_risk = "MEDIUM"
        action_recom = "Monitor consumption burn rate; maintain standard reorder timeline."
    else:
        overall_risk = "LOW"
        action_recom = "Operating in nominal equilibrium. Facility holds surplus buffer available for redistribution."

    return {
        "phc": phc,
        "medicine": medicine,
        "overall_risk": overall_risk,
        "risk_score": round(total_score, 1),
        "signals": {
            "stock_out": signal_stock,
            "demand_forecast": signal_demand,
            "anomaly": signal_anomaly,
            "emergency_outbreak": signal_emerg,
            "bed_staff_capacity": signal_capacity
        },
        "formula": "Score = (0.35 * Stock) + (0.20 * Demand) + (0.15 * Anomaly) + (0.15 * Emergency) + (0.15 * Capacity)",
        "recommendation": action_recom
    }
