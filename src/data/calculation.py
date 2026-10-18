import pandas as pd
import numpy as np

# --------------------------------------------------
# 1. Load input CSV files
# --------------------------------------------------

observations = pd.read_csv("observations.csv")
rules = pd.read_csv("indicator_rules.csv")
states = pd.read_csv("states.csv")

# Make sure numeric columns are numeric
observations["value"] = pd.to_numeric(
    observations["value"],
    errors="coerce"
)

rules["low_reference"] = pd.to_numeric(
    rules["low_reference"],
    errors="coerce"
)

rules["high_reference"] = pd.to_numeric(
    rules["high_reference"],
    errors="coerce"
)

rules["weight"] = pd.to_numeric(
    rules["weight"],
    errors="coerce"
)

# --------------------------------------------------
# 2. Validate input data
# --------------------------------------------------

required_observation_columns = [
    "state_code",
    "state_name",
    "year",
    "indicator_id",
    "value"
]

required_rule_columns = [
    "indicator_id",
    "dimension",
    "direction",
    "low_reference",
    "high_reference",
    "weight"
]

missing_observation_columns = [
    column for column in required_observation_columns
    if column not in observations.columns
]

missing_rule_columns = [
    column for column in required_rule_columns
    if column not in rules.columns
]

if missing_observation_columns:
    raise ValueError(
        f"Missing observation columns: {missing_observation_columns}"
    )

if missing_rule_columns:
    raise ValueError(
        f"Missing rule columns: {missing_rule_columns}"
    )

duplicate_rules = rules[
    rules["indicator_id"].duplicated(keep=False)
]

if not duplicate_rules.empty:
    raise ValueError(
        "Each indicator_id must appear only once in indicator_rules.csv"
    )

# --------------------------------------------------
# 3. Merge observations with indicator rules
# --------------------------------------------------

data = observations.merge(
    rules,
    on="indicator_id",
    how="left",
    validate="many_to_one"
)

if data["dimension"].isna().any():
    missing_rules = data.loc[
        data["dimension"].isna(),
        "indicator_id"
    ].unique()

    raise ValueError(
        f"No rule found for indicators: {missing_rules}"
    )

# --------------------------------------------------
# 4. Calculate normalized pressure scores
# --------------------------------------------------

def calculate_pressure(row):
    value = row["value"]
    low = row["low_reference"]
    high = row["high_reference"]
    direction = row["direction"]

    if pd.isna(value) or pd.isna(low) or pd.isna(high):
        return np.nan

    if high == low:
        return np.nan

    if direction == "higher_worse":
        raw_score = (value - low) / (high - low)

    elif direction == "higher_better":
        raw_score = (high - value) / (high - low)

    else:
        raise ValueError(
            f"Unknown direction: {direction}"
        )

    return float(np.clip(raw_score * 100, 0, 100))


data["pressure_score"] = data.apply(
    calculate_pressure,
    axis=1
)

data["pressure_score"] = data["pressure_score"].round(2)

# --------------------------------------------------
# 5. Create detailed indicator output
# --------------------------------------------------

indicator_scores = data[
    [
        "state_code",
        "state_name",
        "year",
        "indicator_id",
        "dimension",
        "label",
        "value",
        "unit",
        "direction",
        "low_reference",
        "high_reference",
        "weight",
        "pressure_score",
        "source_name",
        "source_url",
        "methodology",
        "confidence"
    ]
].copy()

indicator_scores.to_csv(
    "indicator_scores.csv",
    index=False
)

# --------------------------------------------------
# 6. Calculate dimension scores
# --------------------------------------------------

dimension_scores = (
    data
    .dropna(subset=["pressure_score"])
    .groupby(
        [
            "state_code",
            "state_name",
            "year",
            "dimension"
        ],
        as_index=False
    )
    .agg(
        dimension_score=("pressure_score", "mean"),
        indicators_available=("pressure_score", "count")
    )
)

dimension_scores["dimension_score"] = (
    dimension_scores["dimension_score"].round(2)
)

# --------------------------------------------------
# 7. Ensure fertiliser nutrients is one dimension
# --------------------------------------------------

fertiliser_dimension = (
    data[
        data["indicator_id"].isin(
            [
                "nitrogen_fertiliser_kg_ha",
                "phosphorus_fertiliser_kg_ha"
            ]
        )
    ]
    .dropna(subset=["pressure_score"])
    .groupby(
        [
            "state_code",
            "state_name",
            "year"
        ],
        as_index=False
    )
    .agg(
        dimension_score=("pressure_score", "mean"),
        indicators_available=("pressure_score", "count")
    )
)

fertiliser_dimension["dimension"] = "fertiliser_nutrients"

# Remove any existing fertiliser dimension row
dimension_scores = dimension_scores[
    dimension_scores["dimension"] != "fertiliser_nutrients"
]

dimension_scores = pd.concat(
    [
        dimension_scores,
        fertiliser_dimension
    ],
    ignore_index=True
)

dimension_scores["dimension_score"] = (
    dimension_scores["dimension_score"].round(2)
)

dimension_scores.to_csv(
    "dimension_scores.csv",
    index=False
)

# --------------------------------------------------
# 8. Calculate five-dimensional overall score
# --------------------------------------------------

five_dimensions = [
    "air_pollution",
    "forest_cover",
    "groundwater",
    "fertiliser_nutrients",
    "hazardous_waste"
]

five_dimension_data = dimension_scores[
    dimension_scores["dimension"].isin(five_dimensions)
].copy()

state_scores = (
    five_dimension_data
    .groupby(
        [
            "state_code",
            "state_name",
            "year"
        ],
        as_index=False
    )
    .agg(
        overall_score=("dimension_score", "mean"),
        dimensions_available=("dimension_score", "count")
    )
)

state_scores["overall_score"] = (
    state_scores["overall_score"].round(2)
)

state_scores["coverage_pct"] = (
    state_scores["dimensions_available"] /
    len(five_dimensions) *
    100
).round(2)

# --------------------------------------------------
# 9. Assign risk bands and map colours
# --------------------------------------------------

def assign_risk_band(score):
    if pd.isna(score):
        return "Insufficient data"

    if score <= 25:
        return "Low"

    if score <= 50:
        return "Moderate"

    if score <= 75:
        return "High"

    return "Critical"


def assign_map_colour(score):
    if pd.isna(score):
        return "#9CA3AF"

    if score <= 25:
        return "#2E7D32"

    if score <= 50:
        return "#F9D648"

    if score <= 75:
        return "#F57C00"

    return "#C62828"


def assign_grade(score):
    if pd.isna(score):
        return "N/A"
    if score <= 25:
        return "A"
    if score <= 50:
        return "B"
    if score <= 75:
        return "C"
    return "D"


state_scores["risk_band"] = (
    state_scores["overall_score"]
    .apply(assign_risk_band)
)

state_scores["grade"] = (
    state_scores["overall_score"]
    .apply(assign_grade)
)

state_scores["map_colour"] = (
    state_scores["overall_score"]
    .apply(assign_map_colour)
)

# --------------------------------------------------
# 10. Add individual dimension columns
# --------------------------------------------------

dimension_pivot = (
    five_dimension_data
    .pivot_table(
        index=[
            "state_code",
            "state_name",
            "year"
        ],
        columns="dimension",
        values="dimension_score",
        aggfunc="mean"
    )
    .reset_index()
)

dimension_pivot.columns.name = None

state_scores = state_scores.merge(
    dimension_pivot,
    on=[
        "state_code",
        "state_name",
        "year"
    ],
    how="left"
)

# Rename columns for easier frontend use
state_scores = state_scores.rename(
    columns={
        "air_pollution": "air_pollution_score",
        "forest_cover": "forest_cover_score",
        "groundwater": "groundwater_score",
        "fertiliser_nutrients": "fertiliser_nutrients_score",
        "hazardous_waste": "hazardous_waste_score"
    }
)

# --------------------------------------------------
# 11. Add top pressure dimensions
# --------------------------------------------------

score_columns = {
    "air_pollution_score": "Air pollution",
    "forest_cover_score": "Forest cover",
    "groundwater_score": "Groundwater",
    "fertiliser_nutrients_score": "Fertiliser nutrients",
    "hazardous_waste_score": "Hazardous waste"
}


def get_top_dimensions(row, number=3):
    available_scores = {}

    for score_column, label in score_columns.items():
        score = row.get(score_column)

        if pd.notna(score):
            available_scores[label] = score

    sorted_scores = sorted(
        available_scores.items(),
        key=lambda item: item[1],
        reverse=True
    )

    return ", ".join(
        [
            f"{label} ({score:.1f})"
            for label, score in sorted_scores[:number]
        ]
    )


state_scores["top_pressure_dimensions"] = state_scores.apply(
    get_top_dimensions,
    axis=1
)

# --------------------------------------------------
# 12. Reorder and export final outputs
# --------------------------------------------------

# Merge capital coordinates and region from states.csv
state_scores = state_scores.merge(
    states[["state_code", "region", "capital_lat", "capital_lng"]],
    on="state_code",
    how="left"
)

output_columns = [
    "state_code",
    "state_name",
    "year",
    "overall_score",
    "risk_band",
    "grade",
    "map_colour",
    "dimensions_available",
    "coverage_pct",
    "air_pollution_score",
    "forest_cover_score",
    "groundwater_score",
    "fertiliser_nutrients_score",
    "hazardous_waste_score",
    "top_pressure_dimensions",
    "region",
    "capital_lat",
    "capital_lng"
]

state_scores = state_scores[
    [
        column for column in output_columns
        if column in state_scores.columns
    ]
]

state_scores.to_csv(
    "state_scores.csv",
    index=False
)
state_scores.to_json(
    "stateScores.json",
    orient="records",
    indent=2
)

# Also export indicator_scores and dimension_scores to JSON for frontend usage
indicator_scores.to_json(
    "indicatorScores.json",
    orient="records",
    indent=2
)
dimension_scores.to_json(
    "dimensionScores.json",
    orient="records",
    indent=2
)

# --------------------------------------------------
# 13. Create a citizen-friendly output
# --------------------------------------------------

citizen_scores = state_scores[
    [
        "state_code",
        "state_name",
        "year",
        "overall_score",
        "risk_band",
        "map_colour",
        "coverage_pct",
        "top_pressure_dimensions"
    ]
].copy()

citizen_scores.to_csv(
    "citizen_scores.csv",
    index=False
)

# --------------------------------------------------
# 14. Create a professional heatmap output
# --------------------------------------------------

professional_heatmap = (
    five_dimension_data
    .pivot_table(
        index=[
            "state_name",
            "year"
        ],
        columns="dimension",
        values="dimension_score",
        aggfunc="mean"
    )
    .reset_index()
)

professional_heatmap.columns.name = None

professional_heatmap.to_csv(
    "professional_heatmap.csv",
    index=False
)

# --------------------------------------------------
# 15. Display results
# --------------------------------------------------

print("Created files:")
print("- indicator_scores.csv & indicatorScores.json")
print("- dimension_scores.csv & dimensionScores.json")
print("- state_scores.csv & stateScores.json")
print("- citizen_scores.csv")
print("- professional_heatmap.csv")

print("\nCitizen output (sample):")
try:
    display(citizen_scores.head(6))
except NameError:
    print(citizen_scores.head(6))

print("\nProfessional heatmap output (sample):")
try:
    display(professional_heatmap.head(6))
except NameError:
    print(professional_heatmap.head(6))