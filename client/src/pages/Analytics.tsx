import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line
} from 'recharts';

export default function Analytics() {
    const [rollup, setRollup] = useState([]);
    const [revenue, setRevenue] = useState([]);
    const [hourly, setHourly] = useState([]);
    
    useEffect(() => {
        api.get('/analytics/olap/rollup').then(res => setRollup(res.data)).catch(console.error);
        api.get('/analytics/revenue').then(res => setRevenue(res.data)).catch(console.error);
        api.get('/analytics/hourly').then(res => setHourly(res.data)).catch(console.error);
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-text-primary">OLAP Analytics Dashboard</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Rollup Chart */}
                <div className="bg-card-bg border-border p-6 rounded-lg shadow border border-border">
                    <h3 className="font-semibold text-lg mb-4">Roll-up: Revenue by Vehicle Type</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={rollup} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#263449" />
                                <XAxis dataKey="VehicleType" stroke="#64748b" />
                                <YAxis stroke="#64748b" />
                                <Tooltip contentStyle={{ backgroundColor: '#151F32', borderColor: '#263449', color: '#f1f5f9' }} />
                                <Legend />
                                <Bar dataKey="Revenue" fill="#3b82f6" name="Total Revenue ($)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Hourly Activity */}
                <div className="bg-card-bg border-border p-6 rounded-lg shadow border border-border">
                    <h3 className="font-semibold text-lg mb-4">Hourly Parking Activity</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={hourly} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#263449" />
                                <XAxis dataKey="HourNo" stroke="#64748b" />
                                <YAxis yAxisId="left" stroke="#64748b" />
                                <YAxis yAxisId="right" orientation="right" stroke="#64748b" />
                                <Tooltip contentStyle={{ backgroundColor: '#151F32', borderColor: '#263449', color: '#f1f5f9' }} />
                                <Legend />
                                <Line yAxisId="left" type="monotone" dataKey="NumParkings" stroke="#8b5cf6" name="Parkings" strokeWidth={2} />
                                <Line yAxisId="right" type="monotone" dataKey="AvgDuration" stroke="#10b981" name="Avg Duration (m)" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Data Table */}
                <div className="col-span-1 lg:col-span-2 bg-card-bg border-border p-6 rounded-lg shadow border border-border">
                    <h3 className="font-semibold text-lg mb-4">Detailed Revenue Stats</h3>
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-sidebar-bg border-b border-border">
                                <th className="p-3 text-sm font-semibold text-text-secondary">Vehicle Type</th>
                                <th className="p-3 text-sm font-semibold text-text-secondary">Total Parkings</th>
                                <th className="p-3 text-sm font-semibold text-text-secondary">Average Fee</th>
                                <th className="p-3 text-sm font-semibold text-text-secondary">Total Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {revenue.map((r: any) => (
                                <tr key={r.VehicleType} className="border-b border-border">
                                    <td className="p-3 text-sm font-medium">{r.VehicleType}</td>
                                    <td className="p-3 text-sm">{r.NumParkings}</td>
                                    <td className="p-3 text-sm">${Number(r.AvgFee).toFixed(2)}</td>
                                    <td className="p-3 text-sm text-green-600 font-semibold">${r.TotalRevenue}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}
