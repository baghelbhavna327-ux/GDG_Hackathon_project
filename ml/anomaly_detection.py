
from pathlib import Path

import numpy as np
import pandas as pd


class AnomalyDetector:
    """
    Detect unusual medicine-demand behavior using
    rolling statistics.

    No scikit-learn or SciPy required.
    """

    def __init__(
        self,
        window=7,
        threshold=2.5,
    ):
        self.window = window
        self.threshold = threshold

    def detect(self, df):
        df = df.copy()

        df["date"] = pd.to_datetime(df["date"])

        df = df.sort_values(
            ["phc_id", "medicine_id", "date"]
        ).reset_index(drop=True)

        grouped = df.groupby(
            ["phc_id", "medicine_id"]
        )["daily_demand"]

        # Previous observations only.
        df["rolling_mean"] = grouped.transform(
            lambda x:
            x.shift(1)
            .rolling(self.window)
            .mean()
        )

        df["rolling_std"] = grouped.transform(
            lambda x:
            x.shift(1)
            .rolling(self.window)
            .std()
        )

        # Avoid division by zero.
        df["rolling_std"] = df[
            "rolling_std"
        ].replace(0, np.nan)

        # Z-score
        df["z_score"] = (
            df["daily_demand"]
            - df["rolling_mean"]
        ) / df["rolling_std"]

        df["z_score"] = df[
            "z_score"
        ].replace(
            [np.inf, -np.inf],
            np.nan,
        )

        # Absolute deviation from normal behavior.
        df["anomaly_score"] = (
            df["z_score"].abs()
        )

        df["is_anomaly"] = (
            df["anomaly_score"]
            >= self.threshold
        )

        # Classify anomaly direction.
        df["anomaly_type"] = np.select(
            [
                (
                    df["is_anomaly"]
                    & (
                        df["daily_demand"]
                        > df["rolling_mean"]
                    )
                ),
                (
                    df["is_anomaly"]
                    & (
                        df["daily_demand"]
                        < df["rolling_mean"]
                    )
                ),
            ],
            [
                "DEMAND_SPIKE",
                "DEMAND_DROP",
            ],
            default="NORMAL",
        )

        return df

    def generate_report(self, df):
        results = self.detect(df)

        anomalies = results[
            results["is_anomaly"]
        ].copy()

        print("\n================================")
        print("ANOMALY DETECTION")
        print("================================")

        print(
            f"Total observations: {len(results)}"
        )

        print(
            f"Anomalies detected: {len(anomalies)}"
        )

        print(
            f"Anomaly rate: "
            f"{len(anomalies) / len(results) * 100:.2f}%"
        )

        if len(anomalies) > 0:

            print("\nRecent anomalies:")

            columns = [
                "date",
                "phc_id",
                "medicine_id",
                "medicine_name",
                "daily_demand",
                "rolling_mean",
                "z_score",
                "anomaly_type",
            ]

            print(
                anomalies
                .sort_values(
                    "date",
                    ascending=False,
                )
                .head(20)[columns]
                .to_string(index=False)
            )

        else:
            print(
                "\nNo significant anomalies detected."
            )

        return results

    def save_report(
        self,
        results,
        path="ml/models/anomaly_report.csv",
    ):
        path = Path(path)

        path.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        anomalies = results[
            results["is_anomaly"]
        ].copy()

        anomalies.to_csv(
            path,
            index=False,
        )

        print(
            f"\nAnomaly report saved to: {path}"
        )


if __name__ == "__main__":

    data_path = Path(
        "data/synthetic_phc_data.csv"
    )

    df = pd.read_csv(data_path)

    print("Dataset loaded.")
    print(f"Rows: {len(df)}")

    detector = AnomalyDetector(
        window=7,
        threshold=2.5,
    )

    results = detector.generate_report(df)

    detector.save_report(results)