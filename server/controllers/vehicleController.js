const { dbOltp } = require('../database/db');

exports.getAllVehicles = async (req, res) => {
    try {
        const [rows] = await dbOltp.query('SELECT * FROM Vehicle ORDER BY created_at DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch vehicles" });
    }
};

exports.getVehicleById = async (req, res) => {
    try {
        const [rows] = await dbOltp.query('SELECT * FROM Vehicle WHERE vehicle_id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: "Vehicle not found" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch vehicle" });
    }
};

exports.addVehicle = async (req, res) => {
    const { vehicle_number, vehicle_type, user_type, electric_vehicle, vehicle_weight, vehicle_height } = req.body;
    try {
        const [result] = await dbOltp.query(
            'INSERT INTO Vehicle (vehicle_number, vehicle_type, user_type, electric_vehicle, vehicle_weight, vehicle_height) VALUES (?, ?, ?, ?, ?, ?)',
            [vehicle_number, vehicle_type, user_type, electric_vehicle || false, vehicle_weight || null, vehicle_height || null]
        );
        res.status(201).json({ message: "Vehicle added successfully", vehicle_id: result.insertId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: "Vehicle number already exists" });
        }
        res.status(500).json({ error: "Failed to add vehicle" });
    }
};

exports.updateVehicle = async (req, res) => {
    const { vehicle_type, user_type, electric_vehicle, vehicle_weight, vehicle_height } = req.body;
    try {
        await dbOltp.query(
            'UPDATE Vehicle SET vehicle_type = ?, user_type = ?, electric_vehicle = ?, vehicle_weight = ?, vehicle_height = ? WHERE vehicle_id = ?',
            [vehicle_type, user_type, electric_vehicle, vehicle_weight, vehicle_height, req.params.id]
        );
        res.json({ message: "Vehicle updated successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update vehicle" });
    }
};

exports.deleteVehicle = async (req, res) => {
    try {
        // check if vehicle has transactions
        const [txs] = await dbOltp.query('SELECT COUNT(*) as count FROM ParkingTransaction WHERE vehicle_id = ?', [req.params.id]);
        if (txs[0].count > 0) {
            return res.status(400).json({ error: "Cannot delete vehicle with parking history. Only safe deletions allowed." });
        }
        await dbOltp.query('DELETE FROM Vehicle WHERE vehicle_id = ?', [req.params.id]);
        res.json({ message: "Vehicle deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete vehicle" });
    }
};
