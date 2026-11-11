import { useState, useEffect } from 'react';
import api from '../services/api';

export default function ParkingSlots() {
    const [slots, setSlots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterFloor, setFilterFloor] = useState('');

    useEffect(() => {
        fetchSlots();
    }, []);

    const fetchSlots = async () => {
        try {
            const res = await api.get('/slots');
            setSlots(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const floors = Array.from(new Set(slots.map(s => s.floor_name)));

    const filteredSlots = slots.filter(s => filterFloor ? s.floor_name === filterFloor : true);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-text-primary">Parking Slots</h2>
            
            <div className="bg-card-bg border-border p-4 rounded-lg shadow-sm border border-border mb-6">
                <label className="mr-3 font-medium text-text-secondary">Filter by Floor:</label>
                <select style={{backgroundColor:"var(--color-main-bg)", color:"var(--color-text-primary)"}} 
                    className="border rounded px-3 py-1 outline-none"
                    value={filterFloor}
                    onChange={(e) => setFilterFloor(e.target.value)}
                >
                    <option value="">All Floors</option>
                    {floors.map((f: any) => (
                        <option key={f} value={f}>{f}</option>
                    ))}
                </select>
            </div>

            {loading ? <p>Loading...</p> : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredSlots.map(slot => (
                        <div 
                            key={slot.slot_id} 
                            className={`p-4 rounded-lg border-2 text-center cursor-pointer transition-transform hover:scale-105 ${
                                slot.status === 'Available' 
                                    ? 'border-green-400 bg-green-50 text-green-800' 
                                    : 'border-red-400 bg-red-50 text-red-800'
                            }`}
                        >
                            <div className="font-bold text-xl mb-1">{slot.slot_number}</div>
                            <div className="text-sm font-medium">{slot.floor_name}</div>
                            <div className="text-xs mt-2 opacity-80">{slot.slot_type} - {slot.status}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
