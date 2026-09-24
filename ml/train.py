
from pathlib import Path

import pandas as pd

from demand_forecasting import DemandForecaster
from stock_prediction import StockRiskPredictor
from anomaly_detection import AnomalyDetector
from redistribution import calculate_redistribution


DATA_PATH = Path("data/synthetic_phc_data.csv")
MODEL_DIR = Path("ml/models")


def main():

    print("\n" + "=" * 60)
    print("HEALTH RESOURCE ML PIPELINE")
    print("=" * 60)

    # --------------------------------------------------
    # 1. LOAD DATA
    # --------------------------------------------------

    print("\n[1/5] Loading PHC data...")

    df = pd.read_csv(DATA_PATH)

    print(f"Dataset rows: {len(df)}")
    print(f"Dataset columns: {len(df.columns)}")

    # --------------------------------------------------
    # 2. DEMAND FORECASTING
    # --------------------------------------------------

    print("\n[2/5] Running demand forecasting...")

    forecaster = DemandForecaster()

    forecast_result = forecaster.train(df)

    forecaster.save(
        MODEL_DIR / "demand_model.npz"
    )

    # --------------------------------------------------
    # 3. STOCK RISK
    # --------------------------------------------------

    print("\n[3/5] Running stock-risk analysis...")

    stock_predictor = StockRiskPredictor(
        forecast_days=7
    )

    stock_results = stock_predictor.generate_report(df)

    stock_predictor.save_report(
        stock_results,
        MODEL_DIR / "stock_risk_report.csv"
    )

    # --------------------------------------------------
    # 4. ANOMALY DETECTION
    # --------------------------------------------------

    print("\n[4/5] Running anomaly detection...")

    anomaly_detector = AnomalyDetector(
        window=7,
        threshold=2.5
    )

    anomaly_results = anomaly_detector.generate_report(df)

    anomaly_detector.save_report(
        anomaly_results,
        MODEL_DIR / "anomaly_report.csv"
    )

    # --------------------------------------------------
    # 5. REDISTRIBUTION
    # --------------------------------------------------

    print("\n[5/5] Generating redistribution recommendations...")

    redistribution_results = calculate_redistribution(
        df
    )

    redistribution_path = (
        MODEL_DIR /
        "redistribution_recommendations.csv"
    )

    redistribution_results.to_csv(
        redistribution_path,
        index=False
    )

    print(
        f"Redistribution recommendations: "
        f"{len(redistribution_results)}"
    )

    # --------------------------------------------------
    # SUMMARY
    # --------------------------------------------------

    print("\n" + "=" * 60)
    print("ML PIPELINE COMPLETE")
    print("=" * 60)

    print(
        f"""
Demand forecasting:
    MAE  : {forecast_result["mae"]:.2f}
    RMSE : {forecast_result["rmse"]:.2f}

Stock risk:
    HIGH   : {(stock_results["risk_level"] == "HIGH").sum()}
    MEDIUM : {(stock_results["risk_level"] == "MEDIUM").sum()}
    LOW    : {(stock_results["risk_level"] == "LOW").sum()}

Anomalies:
    Detected : {anomaly_results["is_anomaly"].sum()}

Redistribution:
    Recommendations : {len(redistribution_results)}

Outputs:
    {MODEL_DIR / "demand_model.npz"}
    {MODEL_DIR / "stock_risk_report.csv"}
    {MODEL_DIR / "anomaly_report.csv"}
    {MODEL_DIR / "redistribution_recommendations.csv"}
"""
    )


if __name__ == "__main__":
    main()