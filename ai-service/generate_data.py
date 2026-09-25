"""
HealthChain AI - Synthetic Healthcare Resource Data Generator

IMPORTANT NOTICE:
This dataset is synthetic and simulated solely for hackathon demonstration and
machine learning training. It contains NO real patient data, NO personally identifiable
information (PII), and does NOT represent official government healthcare statistics.
"""

import os
import csv
import random
from datetime import datetime, timedelta

# Set random seed for reproducibility
random.seed(42)

# Ensure data directory exists
BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, 'data')
os.makedirs(DATA_DIR, exist_ok=True)
OUTPUT_FILE = os.path.join(DATA_DIR, 'healthcare_data.csv')

# 20 Fictional PHCs across 5 Indian States
PHC_CATALOG = [
    # 1. Madhya Pradesh (4 PHCs)
    {"phc": "PHC Guna Central", "district": "Guna", "state": "Madhya Pradesh", "base_footfall": 140, "base_stock": 250},
    {"phc": "PHC Bhopal West", "district": "Bhopal", "state": "Madhya Pradesh", "base_footfall": 90, "base_stock": 800},
    {"phc": "PHC Indore Rural", "district": "Indore", "state": "Madhya Pradesh", "base_footfall": 120, "base_stock": 320},
    {"phc": "PHC Shivpuri North", "district": "Shivpuri", "state": "Madhya Pradesh", "base_footfall": 85, "base_stock": 280},
    
    # 2. Rajasthan (4 PHCs)
    {"phc": "PHC Jaipur Rural North", "district": "Jaipur", "state": "Rajasthan", "base_footfall": 95, "base_stock": 650},
    {"phc": "PHC Udaipur South", "district": "Udaipur", "state": "Rajasthan", "base_footfall": 110, "base_stock": 310},
    {"phc": "PHC Jodhpur Desert Edge", "district": "Jodhpur", "state": "Rajasthan", "base_footfall": 130, "base_stock": 220},
    {"phc": "PHC Kota Industrial", "district": "Kota", "state": "Rajasthan", "base_footfall": 85, "base_stock": 420},
    
    # 3. Maharashtra (4 PHCs)
    {"phc": "PHC Pune East", "district": "Pune", "state": "Maharashtra", "base_footfall": 100, "base_stock": 750},
    {"phc": "PHC Nagpur Rural", "district": "Nagpur", "state": "Maharashtra", "base_footfall": 115, "base_stock": 340},
    {"phc": "PHC Nashik Tribal Belt", "district": "Nashik", "state": "Maharashtra", "base_footfall": 135, "base_stock": 190},
    {"phc": "PHC Aurangabad North", "district": "Chhatrapati Sambhajinagar", "state": "Maharashtra", "base_footfall": 80, "base_stock": 450},
    
    # 4. Uttar Pradesh (4 PHCs)
    {"phc": "PHC Varanasi Ghats", "district": "Varanasi", "state": "Uttar Pradesh", "base_footfall": 125, "base_stock": 380},
    {"phc": "PHC Lucknow Central Hub", "district": "Lucknow", "state": "Uttar Pradesh", "base_footfall": 90, "base_stock": 900},
    {"phc": "PHC Kanpur South", "district": "Kanpur Nagar", "state": "Uttar Pradesh", "base_footfall": 95, "base_stock": 400},
    {"phc": "PHC Gorakhpur East", "district": "Gorakhpur", "state": "Uttar Pradesh", "base_footfall": 150, "base_stock": 240},
    
    # 5. Gujarat (4 PHCs)
    {"phc": "PHC Ahmedabad Metro East", "district": "Ahmedabad", "state": "Gujarat", "base_footfall": 85, "base_stock": 850},
    {"phc": "PHC Surat Coastal", "district": "Surat", "state": "Gujarat", "base_footfall": 105, "base_stock": 480},
    {"phc": "PHC Rajkot West", "district": "Rajkot", "state": "Gujarat", "base_footfall": 80, "base_stock": 500},
    {"phc": "PHC Kutch Rural Outpost", "district": "Kutch", "state": "Gujarat", "base_footfall": 140, "base_stock": 180}
]

# 5 Commonly Prescribed Essential Medicines
MEDICINES_CATALOG = [
    {"medicine": "Paracetamol", "consumption_ratio": 0.28, "emergency_multiplier": 1.65},
    {"medicine": "ORS", "consumption_ratio": 0.24, "emergency_multiplier": 1.70},
    {"medicine": "Amoxicillin", "consumption_ratio": 0.20, "emergency_multiplier": 1.45},
    {"medicine": "Azithromycin", "consumption_ratio": 0.16, "emergency_multiplier": 1.40},
    {"medicine": "Ibuprofen", "consumption_ratio": 0.18, "emergency_multiplier": 1.30}
]

def generate_healthcare_data(num_days=30):
    """
    Generates synthetic healthcare data for 20 PHCs x 5 Medicines x 30 Days = 3,000 Rows.
    """
    print(f"[Data Generator] Starting dataset synthesis...")
    print(f"- Target PHCs: {len(PHC_CATALOG)}")
    print(f"- Target Medicines: {len(MEDICINES_CATALOG)}")
    print(f"- Days of historical logs: {num_days}")
    print(f"- Estimated total rows: {len(PHC_CATALOG) * len(MEDICINES_CATALOG) * num_days}")
    
    start_date = datetime.now() - timedelta(days=num_days)
    records = []
    
    # Track evolving stock per (PHC, Medicine)
    stock_tracker = {}
    for phc in PHC_CATALOG:
        for med in MEDICINES_CATALOG:
            key = (phc["phc"], med["medicine"])
            stock_tracker[key] = phc["base_stock"]
            
    # Track previous consumption per (PHC, Medicine)
    prev_consumption_tracker = {}
    for phc in PHC_CATALOG:
        for med in MEDICINES_CATALOG:
            key = (phc["phc"], med["medicine"])
            prev_consumption_tracker[key] = int(phc["base_footfall"] * med["consumption_ratio"])

    # Simulate across consecutive 30 days
    for day_offset in range(num_days):
        current_date = start_date + timedelta(days=day_offset)
        date_str = current_date.strftime("%Y-%m-%d")
        day_of_week = current_date.weekday()  # 0=Monday, 6=Sunday
        month = current_date.month
        
        # Periodic emergency flag (e.g. seasonal heatwave/fever surge on specific days for high-risk PHCs)
        for phc in PHC_CATALOG:
            # High-risk PHCs experience emergency surges on specific day intervals
            is_emergency_phc = phc["phc"] in ["PHC Guna Central", "PHC Gorakhpur East", "PHC Jodhpur Desert Edge", "PHC Nashik Tribal Belt", "PHC Kutch Rural Outpost"]
            emergency_flag = 1 if is_emergency_phc and (day_offset % 7 in [2, 3]) else 0
            
            # Base footfall + day-of-week + emergency effects
            footfall_factor = 1.0
            if day_of_week in [0, 1]:  # Mon/Tue peak
                footfall_factor = 1.18
            elif day_of_week in [5, 6]:  # Weekend dip
                footfall_factor = 0.85
                
            if emergency_flag == 1:
                footfall_factor *= 1.60  # +60% surge during emergency mode
                
            noise = random.uniform(-8.0, 8.0)
            patient_count = max(20, int(round(phc["base_footfall"] * footfall_factor + noise)))
            
            for med in MEDICINES_CATALOG:
                key = (phc["phc"], med["medicine"])
                current_stock = stock_tracker[key]
                prev_consumption = prev_consumption_tracker[key]
                
                # Calculate consumption
                med_rate = med["consumption_ratio"]
                emerg_mult = med["emergency_multiplier"] if emergency_flag == 1 else 1.0
                rand_factor = random.uniform(0.92, 1.08)
                
                consumption = max(1, int(round(patient_count * med_rate * emerg_mult * rand_factor)))
                
                # Update stock
                updated_stock = current_stock - consumption
                
                # Simulated replenishment if stock falls below minimum threshold
                if updated_stock < 40:
                    replenishment = phc["base_stock"]
                    updated_stock += replenishment
                
                stock_tracker[key] = max(0, updated_stock)
                prev_consumption_tracker[key] = consumption
                
                records.append({
                    "date": date_str,
                    "state": phc["state"],
                    "district": phc["district"],
                    "phc": phc["phc"],
                    "medicine": med["medicine"],
                    "current_stock": current_stock,
                    "patient_count": patient_count,
                    "previous_consumption": prev_consumption,
                    "consumption": consumption,
                    "day_of_week": day_of_week,
                    "month": month,
                    "emergency_flag": emergency_flag
                })

    # Write CSV
    headers = [
        "date",
        "state",
        "district",
        "phc",
        "medicine",
        "current_stock",
        "patient_count",
        "previous_consumption",
        "consumption",
        "day_of_week",
        "month",
        "emergency_flag"
    ]
    
    with open(OUTPUT_FILE, mode='w', newline='', encoding='utf-8') as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=headers)
        writer.writeheader()
        writer.writerows(records)
        
    print(f"[Data Generator] Successfully generated {len(records):,} rows.")
    print(f"[Data Generator] Output saved to: {OUTPUT_FILE}")
    return records

def verify_dataset():
    """
    Validates dataset integrity against requirements.
    """
    print("\n--- Verifying Dataset Integrity ---")
    if not os.path.exists(OUTPUT_FILE):
        print(f"❌ Error: File {OUTPUT_FILE} does not exist.")
        return False
        
    rows = []
    with open(OUTPUT_FILE, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        rows = list(reader)
        
    total_rows = len(rows)
    phcs = set(r["phc"] for r in rows)
    medicines = set(r["medicine"] for r in rows)
    states = set(r["state"] for r in rows)
    districts = set(r["district"] for r in rows)
    
    # Check missing values
    missing_count = 0
    for r in rows:
        for k, v in r.items():
            if v is None or v == "":
                missing_count += 1
                
    # Check duplicate rows (by date + phc + medicine)
    keys_seen = set()
    duplicate_count = 0
    for r in rows:
        unique_key = (r["date"], r["phc"], r["medicine"])
        if unique_key in keys_seen:
            duplicate_count += 1
        keys_seen.add(unique_key)
        
    print(f"[OK] Total Rows: {total_rows:,}")
    print(f"[OK] Number of PHCs: {len(phcs)} (Target: 20)")
    print(f"[OK] Number of Medicines: {len(medicines)} (Target: 5)")
    print(f"[OK] Number of States: {len(states)} (Target: 5)")
    print(f"[OK] Number of Districts: {len(districts)}")
    print(f"[OK] Missing Values: {missing_count}")
    print(f"[OK] Duplicate Rows: {duplicate_count}")
    
    print("\nSample Record:")
    print(rows[0])
    print("-----------------------------------")
    return True

if __name__ == "__main__":
    generate_healthcare_data(num_days=30)
    verify_dataset()
