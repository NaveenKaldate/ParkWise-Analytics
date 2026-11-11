import { useState, useEffect } from 'react';
import api from '../services/api';

export default function History() {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/parking/history')
            .then(res => {
                setHistory(res.data);
                setLoading(false);
            })
            .catch(console.error);
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-text-primary">Parking History</h2>

            <div className="bg-card-bg border-border rounded-lg shadow overflow-x-auto border border-border">
                <table className="w-full text-left border-collapse min-w-max">
                    <thead>
                        <tr className="bg-sidebar-bg border-b border-border">
                            <th className="p-3 text-sm font-semibold text-text-secondary">ID</th>
                            <th className="p-3 text-sm font-semibold text-text-secondary">Vehicle</th>
                            <th className="p-3 text-sm font-semibold text-text-secondary">Type</th>
                            <th className="p-3 text-sm font-semibold text-text-secondary">User</th>
                            <th className="p-3 text-sm font-semibold text-text-secondary">Slot</th>
                            <th className="p-3 text-sm font-semibold text-text-secondary">Entry</th>
                            <th className="p-3 text-sm font-semibold text-text-secondary">Exit</th>
                            <th className="p-3 text-sm font-semibold text-text-secondary">Duration</th>
                            <th className="p-3 text-sm font-semibold text-text-secondary">Fee</th>
                            <th className="p-3 text-sm font-semibold text-text-secondary">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={10} className="p-4 text-center">Loading...</td></tr>
                        ) : (
                            history.map(h => (
                                <tr key={h.parking_id} className="border-b border-border hover:bg-sidebar-bg">
                                    <td className="p-3 text-sm">{h.parking_id}</td>
                                    <td className="p-3 text-sm font-medium">{h.vehicle_number}</td>
                                    <td className="p-3 text-sm">{h.vehicle_type}</td>
                                    <td className="p-3 text-sm">{h.user_type}</td>
                                    <td className="p-3 text-sm">{h.floor_name} - {h.slot_number}</td>
                                    <td className="p-3 text-sm">{new Date(h.entry_time).toLocaleString()}</td>
                                    <td className="p-3 text-sm">{h.exit_time ? new Date(h.exit_time).toLocaleString() : '-'}</td>
                                    <td className="p-3 text-sm">{h.duration_minutes || '-'} min</td>
                                    <td className="p-3 text-sm">${h.payment_amount || 0}</td>
                                    <td className="p-3 text-sm">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                            h.payment_status === 'Paid' ? 'bg-green-100 text-green-800' : 
                                            h.payment_status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {h.payment_status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
