
import pandas as pd
import os


DATA_PATH = "data/synthetic_phc_data.csv"
OUTPUT_PATH = "ml/models/redistribution_recommendations.csv"


def calculate_redistribution(df):
    # Use the most recent record for each PHC + medicine
    latest = (
        df.sort_values("date")
        .groupby(["phc_id", "medicine_id"], as_index=False)
        .tail(1)
        .copy()
    )

    # Average demand over recent history
    avg_demand = (
        df.groupby(["phc_id", "medicine_id"])["daily_demand"]
        .mean()
        .reset_index(name="avg_daily_demand")
    )

    latest = latest.drop(columns=["avg_daily_demand"], errors="ignore")

    latest = latest.merge(
        avg_demand,
        on=["phc_id", "medicine_id"],
        how="left"
    )

    # Required stock for approximately 7 days
    latest["target_stock"] = (
        latest["avg_daily_demand"] * 7
    ).round()

    latest["surplus"] = (
        latest["stock_quantity"] - latest["target_stock"]
    ).round()

    latest["shortage"] = (
        latest["target_stock"] - latest["stock_quantity"]
    ).clip(lower=0).round()

    recommendations = []

    # Process each medicine separately
    for medicine_id, medicine_group in latest.groupby("medicine_id"):

        donors = medicine_group[
            medicine_group["surplus"] > 0
        ].copy()

        receivers = medicine_group[
            medicine_group["shortage"] > 0
        ].copy()

        # Largest shortage first
        receivers = receivers.sort_values(
            "shortage",
            ascending=False
        )

        for _, receiver in receivers.iterrows():

            remaining_shortage = int(receiver["shortage"])

            if remaining_shortage <= 0:
                continue

            # Largest surplus first
            donors = donors.sort_values(
                "surplus",
                ascending=False
            )

            for donor_index, donor in donors.iterrows():

                available = int(donor["surplus"])

                if available <= 0:
                    continue

                transfer_quantity = min(
                    available,
                    remaining_shortage
                )

                if transfer_quantity <= 0:
                    continue

                recommendations.append({
                    "medicine_id": medicine_id,
                    "medicine_name": receiver["medicine_name"],
                    "source_phc": donor["phc_id"],
                    "destination_phc": receiver["phc_id"],
                    "source_stock": int(donor["stock_quantity"]),
                    "destination_stock": int(
                        receiver["stock_quantity"]
                    ),
                    "source_surplus": available,
                    "destination_shortage": int(
                        receiver["shortage"]
                    ),
                    "recommended_transfer_quantity": transfer_quantity,
                    "reason": "SURPLUS_TO_SHORTAGE"
                })

                remaining_shortage -= transfer_quantity

                # Update donor surplus
                donors.loc[
                    donor_index,
                    "surplus"
                ] -= transfer_quantity

                if remaining_shortage <= 0:
                    break

    return pd.DataFrame(recommendations)


def main():

    print("Loading dataset...")

    df = pd.read_csv(DATA_PATH)

    print(f"Rows: {len(df)}")

    recommendations = calculate_redistribution(df)

    print("\n================================")
    print("REDISTRIBUTION RECOMMENDATIONS")
    print("================================")

    if recommendations.empty:
        print("No redistribution required.")
    else:
        print(
            f"Recommendations generated: "
            f"{len(recommendations)}"
        )

        print("\nTop recommendations:")

        print(
            recommendations[
                [
                    "medicine_name",
                    "source_phc",
                    "destination_phc",
                    "recommended_transfer_quantity"
                ]
            ].head(20).to_string(index=False)
        )

    os.makedirs(
        os.path.dirname(OUTPUT_PATH),
        exist_ok=True
    )

    recommendations.to_csv(
        OUTPUT_PATH,
        index=False
    )

    print(
        f"\nRedistribution report saved to: "
        f"{OUTPUT_PATH}"
    )


if __name__ == "__main__":
    main()