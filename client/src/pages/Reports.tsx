import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Reports() {
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        api.get('/parking/history').then(res => setHistory(res.data)).catch(console.error);
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const handleExportCSV = () => {
        if (!history.length) return;
        const headers = Object.keys(history[0]).join(',');
        const rows = history.map(row => 
            Object.values(row).map(val => `"${val}"`).join(',')
        ).join('\n');
        
        const csv = `${headers}\n${rows}`;
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'parking_report.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center print:hidden">
                <h2 className="text-2xl font-bold text-text-primary">Reports</h2>
                <div className="flex gap-3">
                    <button onClick={handlePrint} className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900">
                        Print Report
                    </button>
                    <button onClick={handleExportCSV} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="bg-card-bg border-border p-8 rounded-lg shadow border border-border print:shadow-none print:border-none print:p-0">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold">Car Parking Management System</h1>
                    <p className="text-text-secondary mt-2">Comprehensive Parking Report</p>
                    <p className="text-sm text-text-secondary mt-1">Generated: {new Date().toLocaleString()}</p>
                </div>
                
                <h3 className="text-xl font-bold mb-4 border-b pb-2">Recent Parking Activities</h3>
                <table className="w-full text-left border-collapse text-sm">
                    <thead>
                        <tr className="bg-sidebar-bg border-b-2 border-border">
                            <th className="p-2 font-semibold">ID</th>
                            <th className="p-2 font-semibold">Vehicle</th>
                            <th className="p-2 font-semibold">Type</th>
                            <th className="p-2 font-semibold">Slot</th>
                            <th className="p-2 font-semibold">Duration</th>
                            <th className="p-2 font-semibold">Fee</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.slice(0, 50).map(h => (
                            <tr key={h.parking_id} className="border-b border-border">
                                <td className="p-2">{h.parking_id}</td>
                                <td className="p-2 font-medium">{h.vehicle_number}</td>
                                <td className="p-2">{h.vehicle_type}</td>
                                <td className="p-2">{h.slot_number}</td>
                                <td className="p-2">{h.duration_minutes || '-'} min</td>
                                <td className="p-2">${h.payment_amount || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
