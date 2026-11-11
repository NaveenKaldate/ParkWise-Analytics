import { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';

export default function Vehicles() {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        vehicle_number: '', vehicle_type: 'Car', user_type: 'Visitor',
        electric_vehicle: false, vehicle_weight: '', vehicle_height: ''
    });

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            const res = await api.get('/vehicles');
            setVehicles(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this vehicle?')) return;
        try {
            await api.delete(`/vehicles/${id}`);
            fetchVehicles();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to delete');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/vehicles/${editingId}`, formData);
            } else {
                await api.post('/vehicles', formData);
            }
            setShowModal(false);
            fetchVehicles();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Failed to save');
        }
    };

    const openModal = (vehicle: any = null) => {
        if (vehicle) {
            setEditingId(vehicle.vehicle_id);
            setFormData({
                vehicle_number: vehicle.vehicle_number,
                vehicle_type: vehicle.vehicle_type,
                user_type: vehicle.user_type,
                electric_vehicle: vehicle.electric_vehicle === 1,
                vehicle_weight: vehicle.vehicle_weight || '',
                vehicle_height: vehicle.vehicle_height || ''
            });
        } else {
            setEditingId(null);
            setFormData({
                vehicle_number: '', vehicle_type: 'Car', user_type: 'Visitor',
                electric_vehicle: false, vehicle_weight: '', vehicle_height: ''
            });
        }
        setShowModal(true);
    };

    const filteredVehicles = vehicles.filter(v => {
        const matchesSearch = v.vehicle_number.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter ? v.vehicle_type === typeFilter : true;
        return matchesSearch && matchesType;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-text-primary">Vehicles</h2>
                <button onClick={() => openModal()} className="bg-primary text-white px-4 py-2 rounded-md shadow-lg hover:bg-secondary transition-colors flex items-center">
                    <Plus size={20} className="mr-2" /> Add Vehicle
                </button>
            </div>

            <div className="bg-card-bg p-4 rounded-xl border border-border flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search vehicle number..." 
                        className="w-full pl-10 pr-4 py-2 bg-main-bg border border-border rounded-md focus:ring-1 focus:ring-primary focus:border-primary outline-none text-text-primary placeholder-text-secondary"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select 
                    className="bg-main-bg border border-border rounded-md px-4 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none text-text-primary"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                >
                    <option value="">All Types</option>
                    <option value="Car">Car</option>
                    <option value="Bike">Bike</option>
                    <option value="Truck">Truck</option>
                </select>
            </div>

            <div className="bg-card-bg rounded-xl shadow-sm border border-border overflow-hidden">
                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-sidebar-bg border-b border-border">
                                    <th className="p-4 text-sm font-semibold text-text-secondary">ID</th>
                                    <th className="p-4 text-sm font-semibold text-text-secondary">Vehicle Number</th>
                                    <th className="p-4 text-sm font-semibold text-text-secondary">Type</th>
                                    <th className="p-4 text-sm font-semibold text-text-secondary">User Type</th>
                                    <th className="p-4 text-sm font-semibold text-text-secondary">EV</th>
                                    <th className="p-4 text-sm font-semibold text-text-secondary">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredVehicles.map((v) => (
                                    <tr key={v.vehicle_id} className="border-b border-border/50 hover:bg-sidebar-bg/50 transition-colors">
                                        <td className="p-4 text-sm text-text-secondary">#{v.vehicle_id}</td>
                                        <td className="p-4 text-sm font-medium text-text-primary">{v.vehicle_number}</td>
                                        <td className="p-4 text-sm text-text-secondary">
                                            <span className="px-2 py-1 rounded bg-main-bg border border-border">{v.vehicle_type}</span>
                                        </td>
                                        <td className="p-4 text-sm text-text-secondary">{v.user_type}</td>
                                        <td className="p-4 text-sm text-text-secondary">
                                            {v.electric_vehicle ? (
                                                <span className="px-2 py-1 rounded text-xs bg-success/20 text-success">Yes</span>
                                            ) : (
                                                <span className="px-2 py-1 rounded text-xs bg-sidebar-bg text-text-secondary border border-border">No</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-sm flex gap-3">
                                            <button onClick={() => openModal(v)} className="text-secondary hover:text-primary transition-colors"><Edit2 size={18} /></button>
                                            <button onClick={() => handleDelete(v.vehicle_id)} className="text-error hover:opacity-80 transition-opacity"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredVehicles.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-text-secondary">No vehicles found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-card-bg border border-border rounded-xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold mb-4 text-text-primary">{editingId ? 'Edit Vehicle' : 'Add Vehicle'}</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Vehicle Number</label>
                                <input 
                                    required 
                                    disabled={!!editingId}
                                    type="text" 
                                    className="w-full bg-main-bg border border-border rounded-md px-3 py-2 text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none disabled:opacity-50" 
                                    value={formData.vehicle_number}
                                    onChange={e => setFormData({...formData, vehicle_number: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Type</label>
                                    <select className="w-full bg-main-bg border border-border rounded-md px-3 py-2 text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={formData.vehicle_type} onChange={e => setFormData({...formData, vehicle_type: e.target.value})}>
                                        <option value="Car">Car</option>
                                        <option value="Bike">Bike</option>
                                        <option value="Truck">Truck</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">User Type</label>
                                    <select className="w-full bg-main-bg border border-border rounded-md px-3 py-2 text-text-primary focus:border-primary focus:ring-1 focus:ring-primary outline-none" value={formData.user_type} onChange={e => setFormData({...formData, user_type: e.target.value})}>
                                        <option value="Student">Student</option>
                                        <option value="Faculty">Faculty</option>
                                        <option value="Staff">Staff</option>
                                        <option value="Visitor">Visitor</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center pt-2">
                                <input type="checkbox" id="ev" className="mr-2 w-4 h-4 rounded border-border bg-main-bg text-primary focus:ring-primary focus:ring-offset-main-bg" checked={formData.electric_vehicle} onChange={e => setFormData({...formData, electric_vehicle: e.target.checked})} />
                                <label htmlFor="ev" className="text-sm font-medium text-text-secondary">Electric Vehicle</label>
                            </div>
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-border rounded-md text-text-secondary hover:bg-sidebar-bg transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md shadow-md hover:bg-secondary transition-colors">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
