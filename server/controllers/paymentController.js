const { dbOltp } = require('../database/db');

exports.getAllPayments = async (req, res) => {
    try {
        const [rows] = await dbOltp.query(`
            SELECT p.payment_id, p.amount, p.payment_status, p.payment_date, pt.parking_id, v.vehicle_number
            FROM Payment p
            JOIN ParkingTransaction pt ON p.parking_id = pt.parking_id
            JOIN Vehicle v ON pt.vehicle_id = v.vehicle_id
            ORDER BY p.payment_date DESC
            LIMIT 500
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch payments" });
    }
};

exports.makePayment = async (req, res) => {
    const { parking_id, amount, payment_method } = req.body;
    try {
        const connection = await dbOltp.getConnection();
        await connection.beginTransaction();

        try {
            const paymentDate = new Date();
            // Note: Wait, the `Payment` schema in db actually doesn't have `payment_method` column?
            // Let's look at schema: 
            // CREATE TABLE Payment ( payment_id INT, parking_id INT, amount DECIMAL, payment_status ENUM('Pending','Success','Failed'), payment_date DATETIME )
            // Ah, there is NO payment_method column in Payment table according to the SQL file.
            
            await connection.query(
                'INSERT INTO Payment (parking_id, amount, payment_status, payment_date) VALUES (?, ?, "Success", ?)',
                [parking_id, amount, paymentDate]
            );

            await connection.query('UPDATE ParkingTransaction SET payment_status = "Paid" WHERE parking_id = ?', [parking_id]);

            await connection.commit();
            connection.release();

            res.json({ message: "Payment processed successfully" });
        } catch (innerErr) {
            await connection.rollback();
            connection.release();
            throw innerErr;
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to process payment" });
    }
};
