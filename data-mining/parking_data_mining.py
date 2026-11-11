import mysql.connector
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import classification_report, confusion_matrix, mean_squared_error
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Connect to MySQL
connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="root",
    database="parking_warehouse"
)

print("Connected to MySQL successfully!")

query = """
SELECT
    fp.ParkingID,
    dv.VehicleType,
    dv.UserType,
    dv.ElectricVehicle,
    dv.VehicleWeight,
    dv.VehicleHeight,
    dt.HourNo,
    dt.ShiftName,
    de.Temperature,
    de.Precipitation,
    de.TrafficLevel,
    ds.SlotType,
    ds.SpotSize,
    ds.ReservedStatus,
    fp.DurationMinutes,
    fp.ParkingFee,
    fp.OccupancyRate,
    fp.DynamicPricingFactor,
    fp.ParkingViolation
FROM FactParking fp

JOIN DimVehicle dv
    ON fp.VehicleKey = dv.VehicleKey

JOIN DimTime dt
    ON fp.TimeKey = dt.TimeKey

JOIN DimEnvironment de
    ON fp.EnvironmentKey = de.EnvironmentKey

JOIN DimSlot ds
    ON fp.SlotKey = ds.SlotKey;
"""

df = pd.read_sql(query, connection)

print("\nDataset loaded successfully!")
print("Number of rows:", len(df))

print("\nFirst 5 records:")
print(df.head())

print("\nDataset Information:")
print(df.info())

print("\nMissing Values:")
print(df.isnull().sum())

print("\nStatistical Summary:")
print(df.describe())


vehicle_analysis = df.groupby("VehicleType").agg(
    Total_Parkings=("ParkingID", "count"),
    Average_Duration=("DurationMinutes", "mean"),
    Total_Revenue=("ParkingFee", "sum")
).reset_index()

print("\nVehicle Type Analysis:")
print(vehicle_analysis)



plt.figure(figsize=(8, 5))

plt.bar(
    vehicle_analysis["VehicleType"],
    vehicle_analysis["Total_Parkings"]
)

plt.xlabel("Vehicle Type")
plt.ylabel("Number of Parkings")
plt.title("Parking Usage by Vehicle Type")

plt.show()


hour_analysis = df.groupby("HourNo").agg(
    Number_of_Parkings=("ParkingID", "count"),
    Average_Duration=("DurationMinutes", "mean"),
    Total_Revenue=("ParkingFee", "sum")
).reset_index()

print("\nHourly Parking Analysis:")
print(hour_analysis)

plt.figure(figsize=(10, 5))

plt.plot(
    hour_analysis["HourNo"],
    hour_analysis["Number_of_Parkings"],
    marker="o"
)

plt.xlabel("Hour")
plt.ylabel("Number of Parkings")
plt.title("Parking Activity by Hour")

plt.grid(True)

plt.show()


correlation = df[
    [
        "VehicleWeight",
        "VehicleHeight",
        "HourNo",
        "Temperature",
        "Precipitation",
        "DurationMinutes",
        "ParkingFee",
        "OccupancyRate",
        "DynamicPricingFactor"
    ]
].corr()

print("\nCorrelation Matrix:")
print(correlation)


plt.figure(figsize=(10, 7))

sns.heatmap(
    correlation,
    annot=True,
    cmap="coolwarm"
)

plt.title("Correlation Analysis")

plt.show()


def classify_duration(minutes):

    if minutes <= 30:
        return "Short"

    elif minutes <= 120:
        return "Medium"

    else:
        return "Long"


df["DurationCategory"] = df["DurationMinutes"].apply(
    classify_duration
)

print("\nDuration Categories:")
print(df["DurationCategory"].value_counts())

df["DurationCategory"].value_counts().plot(
    kind="bar",
    figsize=(7, 5)
)

plt.xlabel("Duration Category")
plt.ylabel("Number of Parkings")
plt.title("Parking Duration Distribution")

plt.show()


violation_analysis = df["ParkingViolation"].value_counts()

print("\nParking Violation Analysis:")
print(violation_analysis)

violation_analysis.plot(
    kind="bar",
    figsize=(7, 5)
)

plt.xlabel("Parking Violation")
plt.ylabel("Number of Records")
plt.title("Parking Violation Distribution")

plt.show()


X = df[
    [
        "DurationMinutes",
        "VehicleType",
        "UserType",
        "HourNo",
        "Temperature",
        "Precipitation",
        "TrafficLevel",
        "OccupancyRate",
        "DynamicPricingFactor"
    ]
]
categorical_columns = [
    "VehicleType",
    "UserType",
    "TrafficLevel"
]

numerical_columns = [
    "DurationMinutes",
    "HourNo",
    "Temperature",
    "Precipitation",
    "OccupancyRate",
    "DynamicPricingFactor"
]

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_columns
        )
    ],
    remainder="passthrough"
)

y = df["ParkingFee"]

model = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        ("regressor", LinearRegression())
    ]
)

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

model.fit(X_train, y_train)

y_pred = model.predict(X_test)


mae = mean_absolute_error(y_test, y_pred)

mse = mean_squared_error(y_test, y_pred)

rmse = mse ** 0.5

r2 = r2_score(y_test, y_pred)

print("\nModel Performance")

print("MAE :", mae)
print("RMSE:", rmse)
print("R2 Score:", r2)

vehicle_analysis = df.groupby("VehicleType").agg(
    Total_Parkings=("ParkingID", "count"),
    Average_Duration=("DurationMinutes", "mean"),
    Total_Revenue=("ParkingFee", "sum")
).reset_index()

print("\nVehicle Type Analysis:")
print(vehicle_analysis)

plt.figure(figsize=(8, 5))

plt.bar(
    vehicle_analysis["VehicleType"],
    vehicle_analysis["Total_Parkings"]
)

plt.xlabel("Vehicle Type")
plt.ylabel("Number of Parkings")
plt.title("Parking Usage by Vehicle Type")

plt.show()

hour_analysis = df.groupby("HourNo").agg(
    Number_of_Parkings=("ParkingID", "count"),
    Average_Duration=("DurationMinutes", "mean"),
    Total_Revenue=("ParkingFee", "sum")
).reset_index()

print("\nHourly Parking Analysis:")
print(hour_analysis)

plt.figure(figsize=(10, 5))

plt.plot(
    hour_analysis["HourNo"],
    hour_analysis["Number_of_Parkings"],
    marker="o"
)

plt.xlabel("Hour")
plt.ylabel("Number of Parkings")
plt.title("Parking Activity by Hour")

plt.grid(True)

plt.show()



# Select numerical features for clustering
cluster_data = df[
    [
        "DurationMinutes",
        "ParkingFee",
        "OccupancyRate",
        "DynamicPricingFactor",
        "Temperature",
        "Precipitation"
    ]
].copy()


from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# Standardize the data
scaler = StandardScaler()

scaled_data = scaler.fit_transform(cluster_data)

# Create K-Means model
kmeans = KMeans(
    n_clusters=3,
    random_state=42,
    n_init=10
)

# Train clustering model
df["Cluster"] = kmeans.fit_predict(scaled_data)

print("\nCluster Distribution:")
print(df["Cluster"].value_counts().sort_index())


cluster_summary = df.groupby("Cluster").agg(
    Number_of_Parkings=("ParkingID", "count"),
    Average_Duration=("DurationMinutes", "mean"),
    Average_Fee=("ParkingFee", "mean"),
    Average_Occupancy=("OccupancyRate", "mean"),
    Average_Temperature=("Temperature", "mean"),
    Average_Pricing_Factor=("DynamicPricingFactor", "mean")
).reset_index()

print("\nCluster Summary:")
print(cluster_summary)


plt.figure(figsize=(9, 6))

plt.scatter(
    df["DurationMinutes"],
    df["ParkingFee"],
    c=df["Cluster"],
    s=50
)

plt.xlabel("Parking Duration (Minutes)")
plt.ylabel("Parking Fee")
plt.title("K-Means Clustering of Parking Records")

plt.grid(True)

plt.show()

df.to_csv(
    "parking_data_mining_results.csv",
    index=False
)

print("\nData mining results saved successfully!")

connection.close()