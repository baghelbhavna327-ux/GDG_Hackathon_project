import sys

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def print_comparison_demo():
    print("=" * 70)
    print(" HEALTHCHAIN AI: CENTRALIZED vs. FEDERATED ARCHITECTURE DEMONSTRATION")
    print("=" * 70)
    print()
    print("1. CENTRALIZED APPROACH:")
    print("   State A raw data ─┐")
    print("   State B raw data ─┼──> Central server")
    print("   State C raw data ─┘")
    print()
    print("   Characteristics:")
    print("   - High risk: Requires state nodes to send raw hospital and patient records.")
    print("   - Heavy bandwidth: Scales linearly with total raw data records.")
    print("   - Cross-jurisdictional compliance friction.")
    print()
    print("-" * 70)
    print("2. FEDERATED APPROACH (HealthChain AI):")
    print("   State A → Local training ─┐")
    print("   State B → Local training ─┼──> Model aggregation")
    print("   State C → Local training ─┘")
    print()
    print("   Characteristics:")
    print("   - Core Principle: \"Raw local training data remains at the simulated state node.")
    print("     Only model parameters/updates participate in aggregation.\"")
    print("   - Zero Raw Data Transmitted: Only mathematical weights (W) and biases (b).")
    print("   - Decentralized compute with centralized parameter averaging (FedAvg).")
    print()
    print("-" * 70)
    print("PRIVACY NOTICE:")
    print("   Model parameter aggregation prevents raw data centralization across state nodes.")
    print("   Note: Model updates alone do not theoretically guarantee complete differential privacy.")
    print("   This is a hackathon simulation demonstrating decentralized collaborative intelligence.")
    print("=" * 70)

if __name__ == "__main__":
    print_comparison_demo()
