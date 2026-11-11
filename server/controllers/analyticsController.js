const { dbWarehouse } = require('../database/db');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

exports.getRollup = async (req, res) => {
    try {
        const [rows] = await dbWarehouse.query(`
            SELECT dv.VehicleType, COUNT(fp.ParkingID) as TotalParkings, SUM(fp.ParkingFee) as Revenue, AVG(fp.DurationMinutes) as AvgDuration
            FROM FactParking fp
            JOIN DimVehicle dv ON fp.VehicleKey = dv.VehicleKey
            GROUP BY dv.VehicleType
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Analytics error" });
    }
};

exports.getDrilldown = async (req, res) => {
    try {
        const [rows] = await dbWarehouse.query(`
            SELECT dv.VehicleType, dv.UserType, COUNT(fp.ParkingID) as TotalParkings, SUM(fp.ParkingFee) as Revenue
            FROM FactParking fp
            JOIN DimVehicle dv ON fp.VehicleKey = dv.VehicleKey
            GROUP BY dv.VehicleType, dv.UserType
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Analytics error" });
    }
};

exports.getSlice = async (req, res) => {
    try {
        const [rows] = await dbWarehouse.query(`
            SELECT fp.ParkingID, fp.ParkingFee, fp.DurationMinutes
            FROM FactParking fp
            JOIN DimVehicle dv ON fp.VehicleKey = dv.VehicleKey
            WHERE dv.VehicleType = 'Car'
            LIMIT 50
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Analytics error" });
    }
};

exports.getDice = async (req, res) => {
    try {
        const [rows] = await dbWarehouse.query(`
            SELECT fp.ParkingID, fp.ParkingFee, fp.DurationMinutes, dv.VehicleType, dv.UserType
            FROM FactParking fp
            JOIN DimVehicle dv ON fp.VehicleKey = dv.VehicleKey
            WHERE dv.VehicleType = 'Car' AND dv.UserType = 'Visitor' AND fp.DurationMinutes > 60
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Analytics error" });
    }
};

exports.getPivot = async (req, res) => {
    try {
        // Pivot: UserType vs VehicleType 
        const [rows] = await dbWarehouse.query(`
            SELECT 
                dv.UserType,
                SUM(CASE WHEN dv.VehicleType = 'Car' THEN 1 ELSE 0 END) as CarCount,
                SUM(CASE WHEN dv.VehicleType = 'Bike' THEN 1 ELSE 0 END) as BikeCount,
                SUM(CASE WHEN dv.VehicleType = 'Truck' THEN 1 ELSE 0 END) as TruckCount
            FROM FactParking fp
            JOIN DimVehicle dv ON fp.VehicleKey = dv.VehicleKey
            GROUP BY dv.UserType
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Analytics error" });
    }
};

exports.getRevenue = async (req, res) => {
    try {
        const [rows] = await dbWarehouse.query(`
            SELECT dv.VehicleType, COUNT(fp.ParkingID) as NumParkings, SUM(fp.ParkingFee) as TotalRevenue, AVG(fp.ParkingFee) as AvgFee
            FROM FactParking fp
            JOIN DimVehicle dv ON fp.VehicleKey = dv.VehicleKey
            GROUP BY dv.VehicleType
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Analytics error" });
    }
};

exports.getHourly = async (req, res) => {
    try {
        const [rows] = await dbWarehouse.query(`
            SELECT dt.HourNo, COUNT(fp.ParkingID) as NumParkings, AVG(fp.DurationMinutes) as AvgDuration, SUM(fp.ParkingFee) as TotalRevenue
            FROM FactParking fp
            JOIN DimTime dt ON fp.TimeKey = dt.TimeKey
            GROUP BY dt.HourNo
            ORDER BY dt.HourNo
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Analytics error" });
    }
};

exports.getDataMiningResults = async (req, res) => {
    const csvPath = path.join(__dirname, '../../data-mining/parking_data_mining_results.csv');
    const results = [];
    if (fs.existsSync(csvPath)) {
        fs.createReadStream(csvPath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                // Hardcode some summary stats that match python results from user prompt
                res.json({
                    metrics: {
                        mae: 8.66,
                        rmse: 11.52,
                        r2: 0.016,
                        message: "Exploratory model with limited explanatory power on the current dataset."
                    },
                    clusteringData: results
                });
            });
    } else {
        res.json({ error: "Data mining results not found." });
    }
};
