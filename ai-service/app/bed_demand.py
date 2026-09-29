"""
HealthChain AI - Bed Demand & Inpatient Capacity Pressure Forecasting
Predicts bed occupancy surges and capacity saturation risks across PHCs.
"""

from typing import Dict, Any

def predict_bed_demand(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Estimates current and 7-day projected inpatient bed occupancy, free capacity, and saturation risk.
    """
    phc = str(data.get('phc') or data.get('phc_name') or 'Guna PHC-04')
    total_beds = int(data.get('total_beds') or 40)
    current_occupied = int(data.get('occupied_beds') or 31)
    patient_footfall = float(data.get('patient_count') or data.get('daily_patient_footfall') or 160.0)
    is_emergency = int(data.get('emergency_flag', 0)) == 1

    # Inpatient admission rate (~8-12% of total OPD footfall, higher in emergency mode)
    admission_rate = 0.16 if is_emergency else 0.09
    est_daily_admissions = max(2.0, round(patient_footfall * admission_rate, 1))
    avg_stay_days = 2.8

    # Projected 7-day steady-state occupancy
    inflow = est_daily_admissions * avg_stay_days
    projected_7d_occupied = min(total_beds, int(round((current_occupied * 0.4) + (inflow * 0.6))))
    
    current_util_pct = round((current_occupied / max(1, total_beds)) * 100, 1)
    projected_util_pct = round((projected_7d_occupied / max(1, total_beds)) * 100, 1)
    available_beds = max(0, total_beds - current_occupied)
    projected_free = max(0, total_beds - projected_7d_occupied)

    if projected_util_pct >= 90.0 or is_emergency:
        risk_level = "CRITICAL"
        status_msg = "Imminent bed saturation: activate regional diversion and discharge protocol."
    elif projected_util_pct >= 75.0:
        risk_level = "HIGH"
        status_msg = "High occupancy strain: reserve emergency beds for trauma & maternity."
    elif projected_util_pct >= 50.0:
        risk_level = "MODERATE"
        status_msg = "Optimal operating bed utilization."
    else:
        risk_level = "LOW"
        status_msg = "Surplus bed capacity available for cross-facility referral intake."

    return {
        "success": True,
        "model": "Inpatient Flow & Recurrent Surge Model",
        "phc": phc,
        "total_beds": total_beds,
        "current_occupied": current_occupied,
        "current_available": available_beds,
        "current_occupancy_pct": current_util_pct,
        "predicted_7d_occupied": projected_7d_occupied,
        "predicted_7d_available": projected_free,
        "projected_occupancy_pct": projected_util_pct,
        "capacity_pressure_risk": risk_level,
        "recommendation": status_msg
    }
