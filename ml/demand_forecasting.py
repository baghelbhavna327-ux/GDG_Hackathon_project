
from pathlib import Path

import numpy as np
import pandas as pd


class DemandForecaster:
    """
    Lightweight demand forecasting model using NumPy.

    The model uses historical demand, calendar features,
    and rolling averages to predict future medicine demand.
    """

    def __init__(self):
        self.coefficients = None
        self.feature_names = [
            "bias",
            "population",
            "day_of_week",
            "month",
            "day_of_year",
            "lag_1",
            "lag_7",
            "lag_14",
            "rolling_mean_7",
            "rolling_mean_14",
        ]

    def create_features(self, df):
        df = df.copy()

        df["date"] = pd.to_datetime(df["date"])

        df = df.sort_values(
            ["phc_id", "medicine_id", "date"]
        ).reset_index(drop=True)

        # Calendar features
        df["day_of_week"] = df["date"].dt.dayofweek
        df["month"] = df["date"].dt.month
        df["day_of_year"] = df["date"].dt.dayofyear

        # Historical demand
        grouped = df.groupby(
            ["phc_id", "medicine_id"]
        )["daily_demand"]

        df["lag_1"] = grouped.shift(1)
        df["lag_7"] = grouped.shift(7)
        df["lag_14"] = grouped.shift(14)

        df["rolling_mean_7"] = (
    df.groupby(["phc_id", "medicine_id"])["daily_demand"]
    .transform(
        lambda x: x.shift(1).rolling(7).mean()
    )
)

        df["rolling_mean_14"] = (
    df.groupby(["phc_id", "medicine_id"])["daily_demand"]
    .transform(
        lambda x: x.shift(1).rolling(14).mean()
    )
)

        return df.dropna(
            subset=self.feature_names[1:] + ["daily_demand"]
        ).reset_index(drop=True)

    def _build_matrix(self, df):
        """
        Convert features into a NumPy matrix.

        Standardization is used so large population values
        don't dominate the regression.
        """

        X = df[
            [
                "population",
                "day_of_week",
                "month",
                "day_of_year",
                "lag_1",
                "lag_7",
                "lag_14",
                "rolling_mean_7",
                "rolling_mean_14",
            ]
        ].to_numpy(dtype=float)

        # Scale features
        mean = X.mean(axis=0)
        std = X.std(axis=0)

        # Avoid division by zero
        std[std == 0] = 1

        X_scaled = (X - mean) / std

        # Add intercept
        X_scaled = np.column_stack(
            [np.ones(len(X_scaled)), X_scaled]
        )

        return X_scaled, mean, std

    def train(self, df):
        """Train using chronological data."""

        df = self.create_features(df)

        # Use dates rather than random splitting.
        unique_dates = sorted(df["date"].unique())

        split = int(len(unique_dates) * 0.8)

        train_dates = unique_dates[:split]
        test_dates = unique_dates[split:]

        train_df = df[df["date"].isin(train_dates)]
        test_df = df[df["date"].isin(test_dates)]

        X_train, feature_mean, feature_std = self._build_matrix(
            train_df
        )

        y_train = train_df["daily_demand"].to_numpy(
            dtype=float
        )

        # NumPy least-squares linear regression
        self.coefficients = np.linalg.lstsq(
            X_train,
            y_train,
            rcond=None
        )[0]

        # Store scaling parameters for future predictions
        self.feature_mean = feature_mean
        self.feature_std = feature_std

        # Test
        X_test_raw = test_df[
            [
                "population",
                "day_of_week",
                "month",
                "day_of_year",
                "lag_1",
                "lag_7",
                "lag_14",
                "rolling_mean_7",
                "rolling_mean_14",
            ]
        ].to_numpy(dtype=float)

        X_test_scaled = (
            X_test_raw - self.feature_mean
        ) / self.feature_std

        X_test = np.column_stack(
            [np.ones(len(X_test_scaled)), X_test_scaled]
        )

        predictions = X_test @ self.coefficients

        # Demand cannot be negative
        predictions = np.maximum(
            predictions,
            0
        )

        actual = test_df[
            "daily_demand"
        ].to_numpy(dtype=float)

        mae = np.mean(
            np.abs(actual - predictions)
        )

        rmse = np.sqrt(
            np.mean(
                (actual - predictions) ** 2
            )
        )

        print("\n==============================")
        print("DEMAND FORECASTING RESULTS")
        print("==============================")

        print(f"Training rows : {len(train_df)}")
        print(f"Testing rows  : {len(test_df)}")
        print(f"MAE           : {mae:.2f}")
        print(f"RMSE          : {rmse:.2f}")

        results = test_df[
            [
                "date",
                "phc_id",
                "medicine_id",
                "medicine_name",
                "daily_demand",
            ]
        ].copy()

        results["predicted_demand"] = np.round(
            predictions
        ).astype(int)

        print("\nSample predictions:")
        print(
            results.head(10).to_string(
                index=False
            )
        )

        return {
            "mae": mae,
            "rmse": rmse,
            "predictions": results,
        }

    def save(self, path="ml/models/demand_model.npz"):
        """Save the trained NumPy model."""

        path = Path(path)
        path.parent.mkdir(
            parents=True,
            exist_ok=True
        )

        np.savez(
            path,
            coefficients=self.coefficients,
            feature_mean=self.feature_mean,
            feature_std=self.feature_std,
        )

        print(f"\nModel saved to: {path}")


if __name__ == "__main__":

    data_path = Path(
        "data/synthetic_phc_data.csv"
    )

    df = pd.read_csv(data_path)

    print("Dataset loaded.")
    print(f"Rows: {len(df)}")
    print(f"Columns: {len(df.columns)}")

    forecaster = DemandForecaster()

    forecaster.train(df)

    forecaster.save()