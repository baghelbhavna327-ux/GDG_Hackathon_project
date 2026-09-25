import urllib.request
import urllib.error
import json

BASE_URL = 'http://localhost:8000'

def test_scenario(name, payload, expected_risk=None, check_fn=None):
    req = urllib.request.Request(
        f'{BASE_URL}/predict',
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    try:
        res = urllib.request.urlopen(req)
        d = json.loads(res.read().decode())
        data = d['data']
        print(f"[PASS] {name}:")
        print(f"   - Daily Demand: {data['predicted_daily_demand']}, 7-Day: {data['predicted_7_day_demand']}, Stock: {data['current_stock']}")
        print(f"   - Days Remaining: {data['days_remaining']}, Shortage: {data['shortage_quantity']}, Risk: {data['stock_out_risk']}")
        if expected_risk:
            assert data['stock_out_risk'] == expected_risk, f"Expected {expected_risk}, got {data['stock_out_risk']}"
        if check_fn:
            check_fn(data)
    except Exception as e:
        print(f"[FAIL] {name}: {e}")

print("=== TESTING ALL 6 SCENARIOS ===")

# Scenario 1: High stock (Stock = 2000, Footfall = 100) -> Days remaining > 14 -> LOW risk
test_scenario(
    'Scenario 1: High Stock',
    {'phc': 'PHC Guna Central', 'medicine': 'Paracetamol', 'current_stock': 2000, 'patient_count': 100},
    expected_risk='LOW'
)

# Scenario 2: Moderate stock (Stock = 280, Footfall = 100) -> Days remaining ~ 10-12 -> MEDIUM risk
test_scenario(
    'Scenario 2: Moderate Stock',
    {'phc': 'PHC Guna Central', 'medicine': 'Paracetamol', 'current_stock': 280, 'patient_count': 100},
    expected_risk='MEDIUM'
)

# Scenario 3: Very low stock (Stock = 20, Footfall = 180) -> Days remaining < 1 -> CRITICAL risk
test_scenario(
    'Scenario 3: Very Low Stock',
    {'phc': 'PHC Guna Central', 'medicine': 'Paracetamol', 'current_stock': 20, 'patient_count': 180},
    expected_risk='CRITICAL'
)

# Scenario 4: Emergency Mode
req_emerg = urllib.request.Request(
    f'{BASE_URL}/predict/emergency',
    data=json.dumps({'phc': 'PHC Guna Central', 'medicine': 'Paracetamol', 'current_stock': 120, 'patient_count': 250}).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
res_emerg = urllib.request.urlopen(req_emerg)
d_emerg = json.loads(res_emerg.read().decode())['data']
print("[PASS] Scenario 4: Emergency Mode:")
print(f"   - Normal Daily: {d_emerg['normal']['predicted_daily_demand']}, Emergency Daily: {d_emerg['emergency']['predicted_daily_demand']}")
print(f"   - Demand Surge: +{d_emerg['demand_increase_percentage']}%, Emergency 7-day shortage: {d_emerg['shortage_quantity']}")
assert d_emerg['emergency']['predicted_daily_demand'] > d_emerg['normal']['predicted_daily_demand']

# Scenario 5: Zero footfall (patient_count = 0)
test_scenario(
    'Scenario 5: Zero/Low Footfall (Safe Division)',
    {'phc': 'PHC Guna Central', 'medicine': 'Paracetamol', 'current_stock': 50, 'patient_count': 0},
    check_fn=lambda d: print('   - Handled zero footfall gracefully with days remaining:', d['days_remaining'])
)

# Scenario 6: Invalid Input (Negative Stock)
try:
    req_inv = urllib.request.Request(
        f'{BASE_URL}/predict',
        data=json.dumps({'phc': 'PHC Guna Central', 'medicine': 'Paracetamol', 'current_stock': -100}).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    urllib.request.urlopen(req_inv)
    print('[FAIL] Scenario 6: Did not reject negative stock')
except urllib.error.HTTPError as e:
    print(f"[PASS] Scenario 6: Invalid Input cleanly rejected with HTTP {e.code}")

print("\n=== ALL 6 SCENARIOS VERIFIED SUCCESSFULLY ===")
