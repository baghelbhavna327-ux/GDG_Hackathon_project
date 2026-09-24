
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, HTTPException


router = APIRouter(
    prefix="/api/ml",
    tags=["Machine Learning"]
)

MODEL_DIR = Path("ml/models")


def load_csv(filename: str):
    path = MODEL_DIR / filename

    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail=f"ML output not found: {filename}"
        )

    return pd.read_csv(path)


@router.get("/stock-risk")
def get_stock_risk():

    df = load_csv("stock_risk_report.csv")

    return {
        "count": len(df),
        "data": df.fillna("").to_dict(orient="records")
    }


@router.get("/anomalies")
def get_anomalies():

    df = load_csv("anomaly_report.csv")

    # Return newest anomalies first
    if "date" in df.columns:
        df = df.sort_values(
            "date",
            ascending=False
        )

    return {
        "count": len(df),
        "data": df.fillna("").to_dict(orient="records")
    }


@router.get("/redistribution")
def get_redistribution():

    df = load_csv(
        "redistribution_recommendations.csv"
    )

    return {
        "count": len(df),
        "data": df.fillna("").to_dict(orient="records")
    }


@router.get("/forecast")
def get_forecast():

    # Demand predictions are currently stored
    # inside the demand forecasting model output.
    #
    # This endpoint is kept as part of the API
    # contract so the frontend/backend can use
    # forecasting without knowing the ML internals.

    prediction_file = MODEL_DIR / "demand_predictions.csv"

    if not prediction_file.exists():

        return {
            "count": 0,
            "data": [],
            "message": "Demand predictions will be available after the forecasting pipeline exports them."
        }

    df = pd.read_csv(prediction_file)

    return {
        "count": len(df),
        "data": df.fillna("").to_dict(orient="records")
    }


@router.get("/summary")
def get_ml_summary():

    stock = load_csv(
        "stock_risk_report.csv"
    )

    anomalies = load_csv(
        "anomaly_report.csv"
    )

    redistribution = load_csv(
        "redistribution_recommendations.csv"
    )

    high_risk = 0
    medium_risk = 0
    low_risk = 0

    if "risk_level" in stock.columns:

        risk_counts = (
            stock["risk_level"]
            .value_counts()
        )

        high_risk = int(
            risk_counts.get("HIGH", 0)
        )

        medium_risk = int(
            risk_counts.get("MEDIUM", 0)
        )

        low_risk = int(
            risk_counts.get("LOW", 0)
        )

    anomaly_count = len(anomalies)

    redistribution_count = len(
        redistribution
    )

    return {
        "stock_risk": {
            "high": high_risk,
            "medium": medium_risk,
            "low": low_risk
        },
        "anomalies": anomaly_count,
        "redistribution_recommendations":
            redistribution_count
    }