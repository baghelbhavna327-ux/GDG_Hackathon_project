"""
HealthChain AI - Federated State Dataset Generator

Generates distinct synthetic local healthcare datasets for 3 state-level nodes:
1. Madhya Pradesh (data/madhya_pradesh.csv) - 750 records
2. Rajasthan      (data/rajasthan.csv)      - 750 records
3. Gujarat        (data/gujarat.csv)        - 750 records

Each state has distinct statistical distributions (patient footfalls, medicine consumption rates,
stock levels, and emergency surge frequencies) reflecting regional public health heterogeneity.

Privacy & Anonymity:
- Purely synthetic demonstration data.
- Zero PII: No patient names, phone numbers, addresses, or medical record IDs.
- Datasets are completely independent and stored locally per state node.
"""

import os
import numpy as np
import pandas as pd
from datetime import datetime, timedelta

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
os.makedirs(DATA_DIR, exist_ok=True)

# 1. State-Specific Epidemiological & Operational Profiles
STATE_CONFIGS = {
    "Madhya Pradesh": {
        "filename": "madhya_pradesh.csv",
        "phcs": [
            ("PHC Bhopal North", 145),
            ("PHC Indore Rural", 160),
            ("PHC Guna Central", 130),
            ("PHC Guna North", 125),
            ("PHC Gwalior Fort", 140),
            ("PHC Jabalpur Cantt", 135),
            ("PHC Ujjain West", 130),
            ("PHC Sagar Green", 125),
            ("PHC Rewa East", 120),
            ("PHC Chhindwara Hill", 130),
        ],
        "medicine_rates": {
            "Paracetamol": 0.30,
            "Amoxicillin": 0.18,
            "Azithromycin": 0.15,
            "Ibuprofen": 0.17,
            "ORS": 0.28
        },
        "stock_range": (250, 480),
        "restock_threshold": 90,
        "restock_amount": (300, 450),
        "emergency_prob": 0.09,
        "emergency_mult": 1.40,
        "season_mult": 1.20
    },
    "Rajasthan": {
        "filename": "rajasthan.csv",
        "phcs": [
            ("PHC Jaipur Rural North", 120),
            ("PHC Jodhpur Desert Edge", 100),
            ("PHC Udaipur Lake View", 115),
            ("PHC Kota Thermal", 125),
            ("PHC Bikaner Fort", 95),
            ("PHC Alwar Industrial", 120),
            ("PHC Jaipur South", 125),
            ("PHC Ajmer Sharif", 110),
            ("PHC Sikar Oasis", 100),
            ("PHC Pali Central", 105),
        ],
        "medicine_rates": {
            "Paracetamol": 0.24,
            "Amoxicillin": 0.19,
            "Azithromycin": 0.24,
            "Ibuprofen": 0.23,
            "ORS": 0.18
        },
        "stock_range": (400, 700),  # Larger buffer stock for remote desert clinics
        "restock_threshold": 150,
        "restock_amount": (450, 650),
        "emergency_prob": 0.05,
        "emergency_mult": 1.30,
        "season_mult": 1.08
    },
    "Gujarat": {
        "filename": "gujarat.csv",
        "phcs": [
            ("PHC Ahmedabad Metro", 195),
            ("PHC Surat Diamond", 210),
            ("PHC Vadodara Sayaji", 180),
            ("PHC Rajkot West", 175),
            ("PHC Bhavnagar Coast", 170),
            ("PHC Gandhinagar Capital", 185),
            ("PHC Ahmedabad East", 190),
            ("PHC Surat Textile", 205),
            ("PHC Jamnagar Brass", 165),
            ("PHC Anand Milk City", 175),
        ],
        "medicine_rates": {
            "Paracetamol": 0.28,
            "Amoxicillin": 0.24,
            "Azithromycin": 0.18,
            "Ibuprofen": 0.20,
            "ORS": 0.22
        },
        "stock_range": (180, 360),  # Lean, high-turnover inventory
        "restock_threshold": 60,
        "restock_amount": (250, 400),
        "emergency_prob": 0.12,
        "emergency_mult": 1.45,
        "season_mult": 1.15
    }
}

MEDICINES = ["Paracetamol", "Amoxicillin", "Azithromycin", "Ibuprofen", "ORS"]

def generate_state_dataset(state_name: str, config: dict, num_days: int = 15, seed: int = 42) -> pd.DataFrame:
    """
    Generates an independent local dataset for a single state node (15 days x 10 PHCs x 5 medicines = 750 rows).
    """
    np.random.seed(seed)
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=num_days - 1)
    date_range = [start_date + timedelta(days=i) for i in range(num_days)]

    records = []

    for phc_name, base_footfall in config["phcs"]:
        # Initialize local stock and consumption tracking
        stock_tracker = {
            m: float(np.random.randint(config["stock_range"][0], config["stock_range"][1])) for m in MEDICINES
        }
        prev_consumption_tracker = {
            m: float(np.random.randint(15, 45)) for m in MEDICINES
        }

        for current_date in date_range:
            dow = current_date.weekday()
            month = current_date.month

            # Weekly footfall modulation
            dow_multiplier = 0.85 if dow == 6 else (1.10 if dow in [0, 4] else 1.0)
            seasonal_factor = config["season_mult"] if month in [7, 8, 9] else 1.0

            # State-specific emergency probability
            emergency_flag = 1 if np.random.rand() < config["emergency_prob"] else 0
            emergency_multiplier = config["emergency_mult"] if emergency_flag == 1 else 1.0

            # Total daily patient footfall
            footfall_noise = np.random.normal(0, 8)
            patient_count = max(25, int(base_footfall * dow_multiplier * seasonal_factor * emergency_multiplier + footfall_noise))

            for med_name in MEDICINES:
                b_rate = config["medicine_rates"][med_name]
                current_stock = stock_tracker[med_name]
                prev_consumption = prev_consumption_tracker[med_name]

                # Consumption model with noise
                emerg_mult = 1.35 if emergency_flag == 1 else 1.0
                consumption = max(1.0, round(
                    patient_count * b_rate * emerg_mult
                    + 0.12 * prev_consumption
                    + np.random.normal(0, 0.75),
                    1
                ))

                records.append({
                    "patient_count": patient_count,
                    "previous_consumption": round(prev_consumption, 1),
                    "current_stock": round(current_stock, 1),
                    "day_of_week": dow,
                    "month": month,
                    "emergency_flag": emergency_flag,
                    "medicine": med_name,
                    "consumption": consumption
                })

                # Local inventory transition & replenishment
                new_stock = current_stock - consumption
                if new_stock < config["restock_threshold"]:
                    new_stock += float(np.random.randint(config["restock_amount"][0], config["restock_amount"][1]))

                stock_tracker[med_name] = max(0.0, new_stock)
                prev_consumption_tracker[med_name] = consumption

    df = pd.DataFrame(records)
    out_file = os.path.join(DATA_DIR, config["filename"])
    df.to_csv(out_file, index=False)
    return df

def generate_all_state_data():
    """Generates all 3 state-level datasets."""
    print("======================================================")
    print("HealthChain AI - Generating Synthetic State Datasets")
    print("======================================================")
    for idx, (state, cfg) in enumerate(STATE_CONFIGS.items(), 1):
        df = generate_state_dataset(state, cfg, num_days=15, seed=100 + idx * 25)
        out_path = os.path.join(DATA_DIR, cfg['filename'])
        print(f" [{state}] -> {len(df)} records generated at: {out_path}")
        print(f"    * Avg Patient Count:       {df['patient_count'].mean():.1f}")
        print(f"    * Avg Consumption:         {df['consumption'].mean():.1f} units")
        print(f"    * Avg Current Stock:       {df['current_stock'].mean():.1f} units")
        print(f"    * Emergency Surge Days:    {df['emergency_flag'].sum()} instances ({df['emergency_flag'].mean()*100:.1f}%)")
    print("======================================================")
    print("[SUCCESS] All state datasets generated and saved independently.")
    print("======================================================\n")

if __name__ == "__main__":
    generate_all_state_data()
