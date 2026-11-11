const { dbOltp } = require('../database/db');

exports.getDashboardData = async (req, res) => {
    try {
        const [vehicles] = await dbOltp.query('SELECT COUNT(*) as count FROM Vehicle');
        const [slots] = await dbOltp.query('SELECT COUNT(*) as count FROM ParkingSlot');
        const [availableSlots] = await dbOltp.query('SELECT COUNT(*) as count FROM ParkingSlot WHERE status = "Available"');
        const [occupiedSlots] = await dbOltp.query('SELECT COUNT(*) as count FROM ParkingSlot WHERE status = "Occupied"');
        const [transactions] = await dbOltp.query('SELECT COUNT(*) as count FROM ParkingTransaction');
        const [revenue] = await dbOltp.query('SELECT SUM(payment_amount) as total FROM ParkingTransaction WHERE payment_status = "Paid"');
        const [violations] = await dbOltp.query('SELECT COUNT(*) as count FROM ParkingTransaction WHERE parking_violation = 1');
        const [avgDuration] = await dbOltp.query('SELECT AVG(duration_minutes) as avg FROM ParkingTransaction WHERE duration_minutes IS NOT NULL');

        const [recentTransactions] = await dbOltp.query(`
            SELECT pt.parking_id, v.vehicle_number, v.vehicle_type, ps.slot_number, pt.entry_time, pt.exit_time, pt.duration_minutes, pt.payment_amount, pt.payment_status
            FROM ParkingTransaction pt
            JOIN Vehicle v ON pt.vehicle_id = v.vehicle_id
            JOIN ParkingSlot ps ON pt.slot_id = ps.slot_id
            ORDER BY pt.entry_time DESC
            LIMIT 10
        `);

        const [vehicleTypeStats] = await dbOltp.query('SELECT vehicle_type as name, COUNT(*) as value FROM Vehicle GROUP BY vehicle_type');
        const [userTypeStats] = await dbOltp.query('SELECT user_type as name, COUNT(*) as value FROM Vehicle GROUP BY user_type');
        
        const [activityByHour] = await dbOltp.query('SELECT HOUR(entry_time) as name, COUNT(*) as value FROM ParkingTransaction GROUP BY HOUR(entry_time) ORDER BY name');
        
        const [revenueByVehicle] = await dbOltp.query(`
            SELECT v.vehicle_type as name, SUM(pt.payment_amount) as value 
            FROM ParkingTransaction pt 
            JOIN Vehicle v ON pt.vehicle_id = v.vehicle_id 
            WHERE pt.payment_status = "Paid" 
            GROUP BY v.vehicle_type
        `);
        
        const [violationsStats] = await dbOltp.query(`
            SELECT 
                CASE WHEN parking_violation = 1 THEN 'Violation' ELSE 'Compliant' END as name,
                COUNT(*) as value
            FROM ParkingTransaction
            GROUP BY parking_violation
        `);

        const [environmentStats] = await dbOltp.query('SELECT traffic_level as name, COUNT(*) as value FROM ParkingEnvironment WHERE traffic_level IS NOT NULL GROUP BY traffic_level');

        res.json({
            kpi: {
                totalVehicles: vehicles[0].count,
                totalSlots: slots[0].count,
                availableSlots: availableSlots[0].count,
                occupiedSlots: occupiedSlots[0].count,
                totalTransactions: transactions[0].count,
                totalRevenue: revenue[0].total || 0,
                parkingViolations: violations[0].count,
                avgDuration: Math.round(avgDuration[0].avg || 0)
            },
            recentTransactions,
            charts: {
                vehicleTypes: vehicleTypeStats,
                userTypes: userTypeStats,
                activityByHour: activityByHour.map(row => ({ name: `${row.name}:00`, value: row.value })),
                revenueByVehicle,
                violations: violationsStats,
                environment: environmentStats
            }
        });
    } catch (err) {
        console.error("Dashboard error:", err);
        res.status(500).json({ error: "Failed to fetch dashboard data" });
    }
};
