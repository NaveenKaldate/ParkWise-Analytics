import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Entry() {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [slots, setSlots] = useState<any[]>([]);
    const [activeParkings, setActiveParkings] = useState<any[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState('');
    const [selectedSlot, setSelectedSlot] = useState('');
    const [selectedParkingId, setSelectedParkingId] = useState('');
    const [entryLoading, setEntryLoading] = useState(false);
    const [exitLoading, setExitLoading] = useState(false);
    const [exitSummary, setExitSummary] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        api.get('/vehicles').then(res => setVehicles(res.data)).catch(console.error);
        api.get('/slots/available').then(res => setSlots(res.data)).catch(console.error);
        api.get('/parking/active').then(res => setActiveParkings(res.data)).catch(console.error);
    };

    const handleEntrySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEntryLoading(true);
        try {
            await api.post('/parking/entry', {
                vehicle_id: selectedVehicle,
                slot_id: selectedSlot
            });
            alert('Vehicle entered successfully');
            setSelectedVehicle('');
            setSelectedSlot('');
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Entry failed');
        } finally {
            setEntryLoading(false);
        }
    };

    const handleExitSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setExitLoading(true);
        try {
            const res = await api.post('/parking/exit', { parking_id: selectedParkingId });
            setExitSummary(res.data);
            setSelectedParkingId('');
            fetchData();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Exit failed');
        } finally {
            setExitLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-text-primary">Parking Entry & Exit</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Entry Form */}
                <div className="bg-card-bg p-6 rounded-xl border border-border shadow-sm">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Register Entry</h3>
                    <form onSubmit={handleEntrySubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Select Vehicle</label>
                            <select style={{backgroundColor:"var(--color-main-bg)", color:"var(--color-text-primary)"}} required className="w-full border-border rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-primary focus:border-primary" value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)}>
                                <option value="">-- Choose Vehicle --</option>
                                {vehicles.map(v => (
                                    <option key={v.vehicle_id} value={v.vehicle_id}>{v.vehicle_number} ({v.vehicle_type})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Select Available Slot</label>
                            <select style={{backgroundColor:"var(--color-main-bg)", color:"var(--color-text-primary)"}} required className="w-full border-border rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-primary focus:border-primary" value={selectedSlot} onChange={e => setSelectedSlot(e.target.value)}>
                                <option value="">-- Choose Slot --</option>
                                {slots.map(s => (
                                    <option key={s.slot_id} value={s.slot_id}>{s.slot_number} - {s.floor_name} ({s.slot_type})</option>
                                ))}
                            </select>
                        </div>
                        <button disabled={entryLoading} type="submit" className="w-full bg-primary text-white py-2 rounded-md hover:bg-secondary transition-colors disabled:opacity-50 mt-4 shadow-md">
                            {entryLoading ? 'Processing...' : 'Register Entry'}
                        </button>
                    </form>
                </div>

                {/* Exit Form */}
                <div className="bg-card-bg p-6 rounded-xl border border-border shadow-sm flex flex-col">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Process Exit</h3>
                    <form onSubmit={handleExitSubmit} className="space-y-4 flex-1">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Select Parked Vehicle</label>
                            <select style={{backgroundColor:"var(--color-main-bg)", color:"var(--color-text-primary)"}} required className="w-full border-border rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-primary focus:border-primary" value={selectedParkingId} onChange={e => setSelectedParkingId(e.target.value)}>
                                <option value="">-- Choose active parking --</option>
                                {activeParkings.map(p => (
                                    <option key={p.parking_id} value={p.parking_id}>
                                        {p.vehicle_number} ({p.vehicle_type}) - Slot: {p.slot_number}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button disabled={exitLoading} type="submit" className="w-full bg-error text-white py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 shadow-md">
                            {exitLoading ? 'Processing...' : 'Process Exit'}
                        </button>
                    </form>

                    {exitSummary && (
                        <div className="bg-success/10 border border-success/30 p-4 rounded-lg mt-6">
                            <h3 className="text-md font-bold text-success mb-2">Exit Successful</h3>
                            <p className="text-sm text-text-primary"><strong>Duration:</strong> {exitSummary.durationMinutes} minutes</p>
                            <p className="text-lg mt-1 font-semibold text-text-primary">Total Fee: ${exitSummary.fee}</p>
                            <button 
                                onClick={() => navigate('/payments')}
                                className="mt-3 w-full bg-success text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity shadow-sm text-sm"
                            >
                                Proceed to Payment
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
