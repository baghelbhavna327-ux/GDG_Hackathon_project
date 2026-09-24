
from pathlib import Path
import numpy as np
import pandas as pd


class StockRiskPredictor:
    """
    Predicts medicine stockout risk for each PHC.

    Risk is based on:
    - Current stock
    - Recent demand
    - Forecasted demand
    - Incoming stock
    """

    def __init__(self, forecast_days=7):
        self.forecast_days = forecast_days

    def calculate_risk(self, df):
        df = df.copy()

        df["date"] = pd.to_datetime(df["date"])

        # Latest inventory record for every PHC + medicine
        latest = (
            df.sort_values("date")
            .groupby(["phc_id", "medicine_id"], as_index=False)
            .tail(1)
            .copy()
        )

        # Average recent demand
        recent_demand = (
            df.sort_values("date")
            .groupby(["phc_id", "medicine_id"])
            .tail(7)
            .groupby(["phc_id", "medicine_id"])["daily_demand"]
            .mean()
            .reset_index(name="avg_daily_demand")
        )

        latest = latest.merge(
            recent_demand,
            on=["phc_id", "medicine_id"],
            how="left",
        )

        # Projected demand for next 7 days
        latest["forecast_7_day_demand"] = (
            latest["avg_daily_demand"] * self.forecast_days
        )

        # Expected stock after forecast period
        latest["incoming_stock"] = latest["received_quantity"]

        latest["projected_stock"] = (
            latest["stock_quantity"]
            + latest["incoming_stock"]
            - latest["forecast_7_day_demand"]
        )

        # Days until stockout
        latest["days_of_stock"] = np.where(
            latest["avg_daily_demand"] > 0,
            latest["stock_quantity"]
            / latest["avg_daily_demand"],
            999,
        )

        # Risk classification
        latest["risk_level"] = np.select(
            [
                latest["projected_stock"] <= 0,
                latest["days_of_stock"] <= 3,
                latest["days_of_stock"] <= 7,
            ],
            [
                "HIGH",
                "HIGH",
                "MEDIUM",
            ],
            default="LOW",
        )

        # Recommended quantity to maintain 14 days of stock
        target_stock = (
            latest["avg_daily_demand"] * 14
        )

        latest["recommended_reorder_quantity"] = np.maximum(
            target_stock
            - latest["stock_quantity"]
            - latest["incoming_stock"],
            0,
        )

        latest["recommended_reorder_quantity"] = (
            latest["recommended_reorder_quantity"]
            .round()
            .astype(int)
        )

        # Round numerical values
        latest["avg_daily_demand"] = (
            latest["avg_daily_demand"].round(2)
        )

        latest["forecast_7_day_demand"] = (
            latest["forecast_7_day_demand"].round(2)
        )

        latest["projected_stock"] = (
            latest["projected_stock"].round(2)
        )

        latest["days_of_stock"] = (
            latest["days_of_stock"]
            .clip(upper=999)
            .round(1)
        )

        return latest

    def generate_report(self, df):
        results = self.calculate_risk(df)

        print("\n================================")
        print("STOCKOUT RISK ANALYSIS")
        print("================================")

        print(
            f"Total PHC-medicine combinations: "
            f"{len(results)}"
        )

        print("\nRisk summary:")

        summary = (
            results["risk_level"]
            .value_counts()
            .reindex(
                ["HIGH", "MEDIUM", "LOW"],
                fill_value=0,
            )
        )

        print(summary.to_string())

        print("\nHigh-risk medicines:")

        high_risk = results[
            results["risk_level"] == "HIGH"
        ].sort_values(
            "days_of_stock"
        )

        columns = [
            "phc_id",
            "medicine_id",
            "medicine_name",
            "stock_quantity",
            "avg_daily_demand",
            "forecast_7_day_demand",
            "days_of_stock",
            "projected_stock",
            "recommended_reorder_quantity",
            "risk_level",
        ]

        if len(high_risk) > 0:
            print(
                high_risk[columns]
                .head(20)
                .to_string(index=False)
            )
        else:
            print("No high-risk medicines detected.")

        return results

    def save_report(
        self,
        results,
        path="ml/models/stock_risk_report.csv",
    ):
        path = Path(path)

        path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        results.to_csv(
            path,
            index=False,
        )

        print(
            f"\nStock risk report saved to: {path}"
        )


if __name__ == "__main__":

    data_path = Path(
        "data/synthetic_phc_data.csv"
    )

    df = pd.read_csv(data_path)

    print("Dataset loaded.")
    print(f"Rows: {len(df)}")

    predictor = StockRiskPredictor(
        forecast_days=7
    )

    results = predictor.generate_report(df)

    predictor.save_report(results)