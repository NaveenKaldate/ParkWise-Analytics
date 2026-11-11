const { dbOltp } = require('../database/db');

exports.getAllSlots = async (req, res) => {
    try {
        const [rows] = await dbOltp.query(`
            SELECT ps.*, pf.floor_name 
            FROM ParkingSlot ps
            JOIN ParkingFloor pf ON ps.floor_id = pf.floor_id
            ORDER BY pf.floor_name, ps.slot_number
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch parking slots" });
    }
};

exports.getFloors = async (req, res) => {
    try {
        const [rows] = await dbOltp.query('SELECT * FROM ParkingFloor');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch floors" });
    }
};

exports.getAvailableSlots = async (req, res) => {
    try {
        const [rows] = await dbOltp.query(`
            SELECT ps.slot_id, ps.slot_number, pf.floor_name, ps.slot_type
            FROM ParkingSlot ps
            JOIN ParkingFloor pf ON ps.floor_id = pf.floor_id
            WHERE ps.status = 'Available'
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch available slots" });
    }
};
