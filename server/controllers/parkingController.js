const { dbOltp } = require('../database/db');

exports.entry = async (req, res) => {
    const { vehicle_id, slot_id } = req.body;
    
    try {
        // Start transaction manually since pool doesn't have a transaction helper simply
        const connection = await dbOltp.getConnection();
        await connection.beginTransaction();

        try {
            // Check slot status
            const [slots] = await connection.query('SELECT status FROM ParkingSlot WHERE slot_id = ? FOR UPDATE', [slot_id]);
            if (slots.length === 0 || slots[0].status === 'Occupied') {
                await connection.rollback();
                connection.release();
                return res.status(400).json({ error: "Slot is not available" });
            }

            // Check if vehicle is already parked
            const [activeTx] = await connection.query('SELECT parking_id FROM ParkingTransaction WHERE vehicle_id = ? AND exit_time IS NULL', [vehicle_id]);
            if (activeTx.length > 0) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({ error: "Vehicle is already parked in another slot" });
            }

            const entryTime = new Date();
            
            // Insert transaction
            const [result] = await connection.query(
                'INSERT INTO ParkingTransaction (vehicle_id, slot_id, entry_time, payment_status, occupancy_status) VALUES (?, ?, ?, "Pending", "Occupied")',
                [vehicle_id, slot_id, entryTime]
            );

            // Mark slot as Occupied
            await connection.query('UPDATE ParkingSlot SET status = "Occupied" WHERE slot_id = ?', [slot_id]);

            await connection.commit();
            connection.release();

            res.status(201).json({ message: "Vehicle entered successfully", parking_id: result.insertId });
        } catch (innerErr) {
            await connection.rollback();
            connection.release();
            throw innerErr;
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to process parking entry" });
    }
};

exports.exit = async (req, res) => {
    const { parking_id } = req.body;
    try {
        const connection = await dbOltp.getConnection();
        await connection.beginTransaction();

        try {
            const [transactions] = await connection.query(`
                SELECT pt.*, v.vehicle_type, pt.slot_id 
                FROM ParkingTransaction pt 
                JOIN Vehicle v ON pt.vehicle_id = v.vehicle_id 
                WHERE pt.parking_id = ? AND pt.exit_time IS NULL FOR UPDATE
            `, [parking_id]);

            if (transactions.length === 0) {
                await connection.rollback();
                connection.release();
                return res.status(400).json({ error: "Invalid parking transaction or already exited" });
            }

            const tx = transactions[0];
            const exitTime = new Date();
            const entryTime = new Date(tx.entry_time);
            
            const diffMs = exitTime - entryTime;
            let durationMinutes = Math.floor(diffMs / 60000);
            if (durationMinutes < 0) durationMinutes = 0;

            // Calculate fee
            const [rates] = await connection.query('SELECT * FROM ParkingRate WHERE vehicle_type = ?', [tx.vehicle_type]);
            let fee = 0;
            if (rates.length > 0) {
                const rate = rates[0];
                const hours = Math.ceil(durationMinutes / 60);
                fee = hours * rate.base_hourly_rate;
                if (fee < rate.minimum_charge) fee = rate.minimum_charge;
                if (rate.maximum_charge && fee > rate.maximum_charge) fee = rate.maximum_charge;
            } else {
                // Fallback basic rates
                const hours = Math.ceil(durationMinutes / 60);
                fee = hours * (tx.vehicle_type === 'Car' ? 50 : 20); 
            }

            const dynamicFactor = 1.0;
            const finalFee = fee * dynamicFactor;

            await connection.query(`
                UPDATE ParkingTransaction 
                SET exit_time = ?, duration_minutes = ?, payment_amount = ?, occupancy_status = 'Available', dynamic_pricing_factor = ? 
                WHERE parking_id = ?
            `, [exitTime, durationMinutes, finalFee, dynamicFactor, parking_id]);

            await connection.query('UPDATE ParkingSlot SET status = "Available" WHERE slot_id = ?', [tx.slot_id]);
            
            // Add parking history count to vehicle
            await connection.query('UPDATE Vehicle SET user_parking_history = user_parking_history + 1 WHERE vehicle_id = ?', [tx.vehicle_id]);

            await connection.commit();
            connection.release();

            res.json({ message: "Vehicle exited successfully", durationMinutes, fee: finalFee });
        } catch (innerErr) {
            await connection.rollback();
            connection.release();
            throw innerErr;
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to process parking exit" });
    }
};

exports.getActiveParkings = async (req, res) => {
    try {
        const [rows] = await dbOltp.query(`
            SELECT pt.parking_id, v.vehicle_number, v.vehicle_type, ps.slot_number, pt.entry_time 
            FROM ParkingTransaction pt
            JOIN Vehicle v ON pt.vehicle_id = v.vehicle_id
            JOIN ParkingSlot ps ON pt.slot_id = ps.slot_id
            WHERE pt.exit_time IS NULL
            ORDER BY pt.entry_time DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch active parkings" });
    }
};

exports.getHistory = async (req, res) => {
    try {
        // Try to query the view first
        const [rows] = await dbOltp.query('SELECT * FROM ParkingHistory ORDER BY entry_time DESC LIMIT 1000');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch parking history" });
    }
};
