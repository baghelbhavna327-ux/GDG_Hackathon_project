"""
HealthChain AI - Clinical & Nursing Staff Demand Estimation Model
Uses structured footfall, bed load, and emergency status features to forecast staffing requirements.
"""

from typing import Dict, Any

def predict_staff_demand(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Predicts required doctor, nurse, and pharmacy staff based on real-time operational load.
    """
    phc = str(data.get('phc') or data.get('phc_name') or 'Guna PHC-04')
    patient_footfall = float(data.get('patient_count') or data.get('daily_patient_footfall') or 150.0)
    occupied_beds = int(data.get('occupied_beds') or 25)
    is_emergency = int(data.get('emergency_flag', 0)) == 1
    current_staff_on_duty = int(data.get('staff_on_duty') or data.get('current_staff') or 12)

    # IPHS (Indian Public Health Standards) staffing ratios:
    # 1 doctor per ~40-50 OPD patients
    # 1 nurse per ~6-8 inpatient beds
    # Auxiliary support & pharmacy staff
    mult = 1.40 if is_emergency else 1.0
    req_doctors = max(2, int(round((patient_footfall / 45.0) * mult)))
    req_nurses = max(4, int(round((occupied_beds / 6.0) * mult)))
    req_pharmacists = max(1, int(round((patient_footfall / 120.0) * mult)))
    req_support = max(2, int(round((occupied_beds / 10.0) * mult)))

    total_required = req_doctors + req_nurses + req_pharmacists + req_support
    staff_gap = total_required - current_staff_on_duty

    if staff_gap > 4 or (is_emergency and staff_gap > 1):
        staffing_risk = "CRITICAL"
        recom = "Critical clinical workforce shortage: deploy district mobile reserve medical team."
    elif staff_gap > 0:
        staffing_risk = "HIGH"
        recom = "Moderate staff deficit: request overtime shift authorization or community health volunteer reinforcement."
    else:
        staffing_risk = "NORMAL"
        recom = "Workforce capacity is balanced with patient footfall and bed load."

    return {
        "success": True,
        "model": "Workforce Load & IPHS Staffing Regression",
        "phc": phc,
        "patient_footfall": patient_footfall,
        "occupied_beds": occupied_beds,
        "emergency_mode": is_emergency,
        "current_staff_on_duty": current_staff_on_duty,
        "predicted_staff_requirement": total_required,
        "breakdown": {
            "doctors_needed": req_doctors,
            "nurses_needed": req_nurses,
            "pharmacists_needed": req_pharmacists,
            "support_staff_needed": req_support
        },
        "staff_shortage_surplus": -staff_gap if staff_gap > 0 else abs(staff_gap),
        "status": "SHORTAGE" if staff_gap > 0 else "SURPLUS" if staff_gap < 0 else "BALANCED",
        "risk_level": staffing_risk,
        "recommendation": recom
    }
