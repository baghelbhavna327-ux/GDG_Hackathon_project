
from pathlib import Path

import numpy as np
import pandas as pd


class DemandForecaster:
    """
    Lightweight demand forecasting model using NumPy.

    Uses:
    - Population
    - Calendar features
    - Historical demand lags
    - Rolling demand averages

    Outputs:
    - Trained model
    - Demand predictions CSV
    - MAE/RMSE metrics
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
        """Create calendar, lag and rolling-demand features."""

        df = df.copy()

        df["date"] = pd.to_datetime(df["date"])

        df = df.sort_values(
            ["phc_id", "medicine_id", "date"]
        ).reset_index(drop=True)

        # -----------------------------
        # Calendar features
        # -----------------------------

        df["day_of_week"] = df["date"].dt.dayofweek
        df["month"] = df["date"].dt.month
        df["day_of_year"] = df["date"].dt.dayofyear

        # -----------------------------
        # Historical demand
        # -----------------------------

        grouped = df.groupby(
            ["phc_id", "medicine_id"]
        )["daily_demand"]

        df["lag_1"] = grouped.shift(1)
        df["lag_7"] = grouped.shift(7)
        df["lag_14"] = grouped.shift(14)

        # -----------------------------
        # Rolling averages
        # -----------------------------

        df["rolling_mean_7"] = (
            df.groupby(
                ["phc_id", "medicine_id"]
            )["daily_demand"]
            .transform(
                lambda x: x.shift(1).rolling(7).mean()
            )
        )

        df["rolling_mean_14"] = (
            df.groupby(
                ["phc_id", "medicine_id"]
            )["daily_demand"]
            .transform(
                lambda x: x.shift(1).rolling(14).mean()
            )
        )

        # Remove rows where historical
        # features are not available.

        return df.dropna(
            subset=self.feature_names[1:] + ["daily_demand"]
        ).reset_index(drop=True)

    def _get_feature_columns(self):
        """Return model feature columns."""

        return [
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

    def _build_matrix(self, df):
        """Convert dataframe features into NumPy matrix."""

        feature_columns = self._get_feature_columns()

        X = df[
            feature_columns
        ].to_numpy(dtype=float)

        # Feature scaling
        mean = X.mean(axis=0)
        std = X.std(axis=0)

        # Avoid division by zero
        std[std == 0] = 1

        X_scaled = (
            X - mean
        ) / std

        # Add intercept
        X_scaled = np.column_stack(
            [
                np.ones(len(X_scaled)),
                X_scaled,
            ]
        )

        return X_scaled, mean, std

    def train(self, df):
        """Train model using chronological split."""

        df = self.create_features(df)

        # --------------------------------
        # Chronological train/test split
        # --------------------------------

        unique_dates = sorted(
            df["date"].unique()
        )

        split = int(
            len(unique_dates) * 0.8
        )

        train_dates = unique_dates[:split]
        test_dates = unique_dates[split:]

        train_df = df[
            df["date"].isin(train_dates)
        ].copy()

        test_df = df[
            df["date"].isin(test_dates)
        ].copy()

        # --------------------------------
        # Training
        # --------------------------------

        X_train, feature_mean, feature_std = (
            self._build_matrix(train_df)
        )

        y_train = train_df[
            "daily_demand"
        ].to_numpy(dtype=float)

        # NumPy least-squares regression
        self.coefficients = np.linalg.lstsq(
            X_train,
            y_train,
            rcond=None
        )[0]

        # Store scaling parameters
        self.feature_mean = feature_mean
        self.feature_std = feature_std

        # --------------------------------
        # Testing
        # --------------------------------

        feature_columns = self._get_feature_columns()

        X_test_raw = test_df[
            feature_columns
        ].to_numpy(dtype=float)

        X_test_scaled = (
            X_test_raw - self.feature_mean
        ) / self.feature_std

        X_test = np.column_stack(
            [
                np.ones(len(X_test_scaled)),
                X_test_scaled,
            ]
        )

        predictions = (
            X_test @ self.coefficients
        )

        # Demand cannot be negative
        predictions = np.maximum(
            predictions,
            0
        )

        actual = test_df[
            "daily_demand"
        ].to_numpy(dtype=float)

        # --------------------------------
        # Evaluation
        # --------------------------------

        mae = np.mean(
            np.abs(
                actual - predictions
            )
        )

        rmse = np.sqrt(
            np.mean(
                (actual - predictions) ** 2
            )
        )

        # --------------------------------
        # Prediction results
        # --------------------------------

        results = test_df[
            [
                "date",
                "phc_id",
                "medicine_id",
                "medicine_name",
                "daily_demand",
            ]
        ].copy()

        results["predicted_demand"] = (
            np.round(predictions)
            .astype(int)
        )

        results["prediction_error"] = (
            results["daily_demand"]
            - results["predicted_demand"]
        )

        results["absolute_error"] = (
            np.abs(
                results["prediction_error"]
            )
        )

        # --------------------------------
        # Print results
        # --------------------------------

        print("\n==============================")
        print("DEMAND FORECASTING RESULTS")
        print("==============================")

        print(
            f"Training rows : {len(train_df)}"
        )

        print(
            f"Testing rows  : {len(test_df)}"
        )

        print(
            f"MAE           : {mae:.2f}"
        )

        print(
            f"RMSE          : {rmse:.2f}"
        )

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

    def save(
        self,
        path="ml/models/demand_model.npz"
    ):
        """Save trained NumPy model."""

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

        print(
            f"\nModel saved to: {path}"
        )

    def save_predictions(
        self,
        predictions,
        path="ml/models/demand_predictions.csv"
    ):
        """Save forecast predictions for the backend/frontend."""

        path = Path(path)

        path.parent.mkdir(
            parents=True,
            exist_ok=True
        )

        predictions.to_csv(
            path,
            index=False
        )

        print(
            f"Predictions saved to: {path}"
        )

    def save_metrics(
        self,
        mae,
        rmse,
        path="ml/models/demand_metrics.csv"
    ):
        """Save model evaluation metrics."""

        path = Path(path)

        path.parent.mkdir(
            parents=True,
            exist_ok=True
        )

        metrics = pd.DataFrame(
            [
                {
                    "metric": "MAE",
                    "value": round(mae, 4),
                },
                {
                    "metric": "RMSE",
                    "value": round(rmse, 4),
                },
            ]
        )

        metrics.to_csv(
            path,
            index=False
        )

        print(
            f"Metrics saved to: {path}"
        )


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    data_path = Path(
        "data/synthetic_phc_data.csv"
    )

    print(
        "Loading dataset..."
    )

    df = pd.read_csv(
        data_path
    )

    print(
        "Dataset loaded."
    )

    print(
        f"Rows: {len(df)}"
    )

    print(
        f"Columns: {len(df.columns)}"
    )

    # Create forecaster
    forecaster = DemandForecaster()

    # Train
    result = forecaster.train(
        df
    )

    # Save trained model
    forecaster.save()

    # Save predictions
    forecaster.save_predictions(
        result["predictions"]
    )

    # Save metrics
    forecaster.save_metrics(
        result["mae"],
        result["rmse"]
    )

    print("\n==============================")
    print("FORECASTING COMPLETE")
    print("==============================")

    print(
        "Model:"
        "\n  ml/models/demand_model.npz"
    )

    print(
        "Predictions:"
        "\n  ml/models/demand_predictions.csv"
    )

    print(
        "Metrics:"
        "\n  ml/models/demand_metrics.csv"
    )