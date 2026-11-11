import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    LayoutGrid, ArrowRightLeft, DollarSign, AlertTriangle, Clock, ShieldAlert, BarChart2, PieChart as PieIcon
} from 'lucide-react';
import { 
    Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ComposedChart, Line
} from 'recharts';

export default function Dashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [revenueChartType, setRevenueChartType] = useState<'bar' | 'pie'>('bar');

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await api.get('/dashboard');
            if (res.data) {
                setData(res.data);
            } else {
                setError("Invalid data format received.");
            }
            setLoading(false);
        } catch (error: any) {
            console.error("Error fetching dashboard", error);
            setError(error.message || "Failed to load dashboard data. Check backend connection.");
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="bg-card-bg border border-error rounded-lg p-6 max-w-lg mx-auto mt-10">
                <div className="flex items-center space-x-3 text-error mb-4">
                    <AlertTriangle size={24} />
                    <h2 className="text-lg font-semibold">Error Loading Dashboard</h2>
                </div>
                <p className="text-text-secondary">{error}</p>
                <button 
                    onClick={() => { setLoading(true); setError(null); fetchDashboard(); }}
                    className="mt-6 bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md transition-colors"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    if (!data || !data.kpi) {
        return <div className="text-text-secondary p-6">No data available.</div>;
    }

    const { kpi, recentTransactions, charts } = data;
    const capacityPct = Math.round((kpi.occupiedSlots / (kpi.totalSlots || 1)) * 100);
    const freePct = 100 - capacityPct;
    const avgHrs = Math.floor(kpi.avgDuration / 60);
    const avgMins = kpi.avgDuration % 60;

    const COLORS_REVENUE = ['#22D3EE', '#22C55E', '#8B5CF6']; // Teal, green, purple
    const COLORS_VEHICLE = ['#3B82F6', '#F59E0B', '#EF4444'];
    
    // Fallbacks
    const vehicleTypes = charts?.vehicleTypes || [];
    const userTypes = charts?.userTypes || [];
    const activityByHour = charts?.activityByHour || [];
    const revenueByVehicle = charts?.revenueByVehicle || [];

    const getTrafficLabel = (cap: number) => {
        if (cap < 50) return { label: 'Safe', color: '#22C55E' };
        if (cap < 85) return { label: 'Moderate', color: '#F59E0B' };
        return { label: 'High Congestion', color: '#EF4444' };
    };
    const congestion = getTrafficLabel(capacityPct);

    return (
        <div className="space-y-6 pb-6 animate-fade-in">
            {/* KPI Row - 6 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                
                {/* 1. Total Vehicles */}
                <div className="bg-card-bg p-5 rounded-xl border border-border flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Total Vehicles</p>
                        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                            <CarIcon className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-text-primary">{kpi.totalVehicles}</h3>
                        <p className="text-xs text-text-secondary mt-1">Unique registered</p>
                    </div>
                </div>

                {/* 2. Capacity */}
                <div className="bg-card-bg p-5 rounded-xl border border-border flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Capacity</p>
                        <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                            <LayoutGrid className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-end space-x-2 mb-2">
                            <h3 className="text-2xl font-bold text-text-primary">{kpi.occupiedSlots}</h3>
                            <span className="text-sm text-text-secondary pb-1">/ {kpi.totalSlots}</span>
                        </div>
                        <div className="w-full bg-sidebar-bg rounded-full h-1.5 mb-1 overflow-hidden">
                            <div className="bg-cyan-500 h-1.5 rounded-full" style={{ width: `${capacityPct}%` }}></div>
                        </div>
                        <p className="text-xs text-text-secondary">{freePct}% Free Rate</p>
                    </div>
                </div>

                {/* 3. Transactions */}
                <div className="bg-card-bg p-5 rounded-xl border border-border flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Transactions</p>
                        <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                            <ArrowRightLeft className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-text-primary">{kpi.totalTransactions}</h3>
                        <p className="text-xs text-text-secondary mt-1">Payment split N/A</p>
                    </div>
                </div>

                {/* 4. Total Revenue */}
                <div className="bg-card-bg p-5 rounded-xl border border-border flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Total Revenue</p>
                        <div className="p-1.5 rounded-lg bg-green-500/10 text-green-400">
                            <DollarSign className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-text-primary">₹{Number(kpi.totalRevenue).toLocaleString('en-IN')}</h3>
                        <p className="text-xs text-text-secondary mt-1">Total collected</p>
                    </div>
                </div>

                {/* 5. Incidents */}
                <div className="bg-card-bg p-5 rounded-xl border border-border flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Incidents</p>
                        <div className="p-1.5 rounded-lg bg-error/10 text-error">
                            <ShieldAlert className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-text-primary">{kpi.parkingViolations}</h3>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-error/20 text-error uppercase">
                            Violations
                        </span>
                    </div>
                </div>

                {/* 6. Avg Duration */}
                <div className="bg-card-bg p-5 rounded-xl border border-border flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                        <p className="text-xs text-text-secondary font-semibold uppercase tracking-wider">Avg Duration</p>
                        <div className="p-1.5 rounded-lg bg-warning/10 text-warning">
                            <Clock className="w-4 h-4" />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-text-primary">{avgHrs}h {avgMins}m</h3>
                        <div className="w-full bg-sidebar-bg rounded-full h-1.5 mt-2 overflow-hidden">
                            <div className="bg-warning h-1.5 rounded-full" style={{ width: '60%' }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Middle Row - Analytics */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Activity By Hour (Wider) */}
                <div className="bg-card-bg p-6 rounded-xl border border-border xl:col-span-2 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Parking Activity By Hour</h3>
                        <div className="flex space-x-2">
                            <button className="px-3 py-1 bg-primary text-white text-xs rounded-md">Hourly</button>
                            <button className="px-3 py-1 bg-sidebar-bg text-text-secondary hover:text-white text-xs rounded-md border border-border transition-colors">Heatmap (N/A)</button>
                            <button className="px-3 py-1 bg-sidebar-bg text-text-secondary hover:text-white text-xs rounded-md border border-border transition-colors">Zone (N/A)</button>
                        </div>
                    </div>
                    <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={activityByHour} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#263449" vertical={false} />
                                <XAxis dataKey="name" stroke="#94A3B8" tick={{fill: '#94A3B8', fontSize: 12}} tickMargin={10} />
                                <YAxis stroke="#94A3B8" tick={{fill: '#94A3B8', fontSize: 12}} />
                                <RechartsTooltip 
                                    contentStyle={{ backgroundColor: '#151F32', borderColor: '#263449', color: '#F8FAFC', borderRadius: '8px' }}
                                    cursor={{fill: '#263449', opacity: 0.4}}
                                    formatter={(val: any) => [val, 'Vehicles']}
                                />
                                <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={30} />
                                <Line type="monotone" dataKey="value" stroke="#22D3EE" strokeWidth={3} dot={{r: 4, fill: '#22D3EE', strokeWidth: 0}} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Revenue by Vehicle Type */}
                <div className="bg-card-bg p-6 rounded-xl border border-border flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Revenue by Type</h3>
                        <div className="flex space-x-1 border border-border rounded-md bg-sidebar-bg p-0.5">
                            <button 
                                onClick={() => setRevenueChartType('bar')}
                                className={`p-1.5 rounded ${revenueChartType === 'bar' ? 'bg-card-bg text-white shadow' : 'text-text-secondary hover:text-white'}`}
                            >
                                <BarChart2 className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setRevenueChartType('pie')}
                                className={`p-1.5 rounded ${revenueChartType === 'pie' ? 'bg-card-bg text-white shadow' : 'text-text-secondary hover:text-white'}`}
                            >
                                <PieIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            {revenueChartType === 'bar' ? (
                                <BarChart data={revenueByVehicle} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#263449" horizontal={false} />
                                    <XAxis type="number" stroke="#94A3B8" tick={{fill: '#94A3B8', fontSize: 12}} />
                                    <YAxis type="category" dataKey="name" stroke="#94A3B8" tick={{fill: '#94A3B8', fontSize: 12}} />
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: '#151F32', borderColor: '#263449', color: '#F8FAFC', borderRadius: '8px' }}
                                        cursor={{fill: '#263449', opacity: 0.4}}
                                        formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                        {revenueByVehicle.map((_entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS_REVENUE[index % COLORS_REVENUE.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            ) : (
                                <PieChart>
                                    <Pie data={revenueByVehicle} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                                        {revenueByVehicle.map((_entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS_REVENUE[index % COLORS_REVENUE.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip 
                                        contentStyle={{ backgroundColor: '#151F32', borderColor: '#263449', color: '#F8FAFC', borderRadius: '8px' }}
                                        formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                                    />
                                    <Legend wrapperStyle={{ fontSize: '12px', color: '#94A3B8' }} />
                                </PieChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

            {/* Bottom Row - 3 Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Vehicles & Users */}
                <div className="bg-card-bg p-6 rounded-xl border border-border flex flex-col">
                    <h3 className="text-sm font-semibold mb-6 text-text-primary uppercase tracking-wider">Vehicles & Users</h3>
                    <div className="h-48 mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={vehicleTypes} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                                    {vehicleTypes.map((_entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS_VEHICLE[index % COLORS_VEHICLE.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip contentStyle={{ backgroundColor: '#151F32', borderColor: '#263449', color: '#F8FAFC', borderRadius: '8px' }} />
                                <Legend wrapperStyle={{ fontSize: '12px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="pt-4 border-t border-border">
                        <p className="text-xs text-text-secondary mb-3 uppercase tracking-wider">User Distribution</p>
                        <div className="space-y-2">
                            {userTypes.map((ut: any) => (
                                <div key={ut.name} className="flex justify-between items-center text-sm">
                                    <span className="text-text-secondary">{ut.name}</span>
                                    <span className="font-semibold text-text-primary">{ut.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Real-Time Traffic Gauge */}
                <div className="bg-card-bg p-6 rounded-xl border border-border flex flex-col items-center text-center">
                    <h3 className="text-sm font-semibold w-full text-left mb-6 text-text-primary uppercase tracking-wider">Occupancy Gauge</h3>
                    
                    <div className="h-48 w-full relative mb-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                    data={[{value: capacityPct}, {value: freePct}]} 
                                    cx="50%" cy="75%" 
                                    startAngle={180} endAngle={0} 
                                    innerRadius={70} outerRadius={90} 
                                    dataKey="value" stroke="none"
                                >
                                    <Cell fill={congestion.color} />
                                    <Cell fill="#1B2940" />
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 pointer-events-none">
                            <span className="text-4xl font-bold text-white">{capacityPct}%</span>
                            <span className="text-sm" style={{ color: congestion.color }}>{congestion.label}</span>
                        </div>
                    </div>
                    
                    <div className="w-full pt-4 border-t border-border text-left">
                        <p className="text-xs text-text-secondary mb-3 uppercase tracking-wider">Live Status</p>
                        <div className="flex justify-between items-center bg-sidebar-bg p-3 rounded-lg border border-border">
                            <span className="text-sm text-text-secondary">System Load</span>
                            <span className="text-sm font-semibold text-white">Nominal</span>
                        </div>
                    </div>
                </div>

                {/* Live Security Log */}
                <div className="bg-card-bg rounded-xl border border-border flex flex-col h-[350px]">
                    <div className="p-6 border-b border-border flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">Operations Log</h3>
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                        {recentTransactions && recentTransactions.length > 0 ? (
                            <div className="space-y-1">
                                {recentTransactions.map((tx: any) => {
                                    // Determine event type
                                    let type = 'Entry';
                                    let color = 'bg-cyan-400';
                                    let textColor = 'text-cyan-400';
                                    let time = new Date(tx.entry_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                                    
                                    if (tx.exit_time) {
                                        type = 'Exit';
                                        color = 'bg-green-400';
                                        textColor = 'text-green-400';
                                        time = new Date(tx.exit_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                                    }
                                    
                                    return (
                                        <div key={tx.parking_id} className="flex items-start p-3 hover:bg-sidebar-bg/50 rounded-lg transition-colors group">
                                            <div className={`mt-1.5 w-2 h-2 rounded-full ${color} shadow-[0_0_8px_currentColor] mr-3 shrink-0`}></div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-baseline mb-0.5">
                                                    <span className={`text-xs font-bold uppercase ${textColor}`}>{type}</span>
                                                    <span className="text-[11px] text-text-secondary whitespace-nowrap">{time}</span>
                                                </div>
                                                <p className="text-sm text-text-primary font-medium truncate">{tx.vehicle_number}</p>
                                                <p className="text-xs text-text-secondary truncate">
                                                    {tx.vehicle_type} • Slot {tx.slot_number} 
                                                    {type === 'Exit' && tx.payment_status === 'Paid' && ` • ₹${tx.payment_amount}`}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="h-full flex items-center justify-center text-text-secondary text-sm">No recent events.</div>
                        )}
                    </div>
                </div>
                
            </div>
        </div>
    );
}

// Add missing CarIcon
function CarIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
            <circle cx="7" cy="17" r="2" />
            <path d="M9 17h6" />
            <circle cx="17" cy="17" r="2" />
        </svg>
    )
}
