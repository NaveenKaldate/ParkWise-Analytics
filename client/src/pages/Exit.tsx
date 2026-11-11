import { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Exit() {
    const [activeParkings, setActiveParkings] = useState<any[]>([]);
    const [selectedParkingId, setSelectedParkingId] = useState('');
    const [loading, setLoading] = useState(false);
    const [exitSummary, setExitSummary] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchActiveParkings();
    }, []);

    const fetchActiveParkings = async () => {
        try {
            const res = await api.get('/parking/active');
            setActiveParkings(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleExit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/parking/exit', { parking_id: selectedParkingId });
            setExitSummary(res.data);
            fetchActiveParkings();
            setSelectedParkingId('');
        } catch (error: any) {
            alert(error.response?.data?.error || 'Exit failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-2xl font-bold text-text-primary">Parking Exit</h2>
            
            <div className="bg-card-bg border-border p-6 rounded-lg shadow border border-border">
                <form onSubmit={handleExit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Select Parked Vehicle</label>
                        <select style={{backgroundColor:"var(--color-main-bg)", color:"var(--color-text-primary)"}} required className="w-full border rounded p-2" value={selectedParkingId} onChange={e => setSelectedParkingId(e.target.value)}>
                            <option value="">-- Choose active parking --</option>
                            {activeParkings.map(p => (
                                <option key={p.parking_id} value={p.parking_id}>
                                    {p.vehicle_number} ({p.vehicle_type}) - Slot: {p.slot_number}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button disabled={loading} type="submit" className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 disabled:opacity-50">
                        {loading ? 'Processing...' : 'Process Exit'}
                    </button>
                </form>
            </div>

            {exitSummary && (
                <div className="bg-green-50 border border-green-200 text-green-900 p-6 rounded-lg mt-6">
                    <h3 className="text-lg font-bold mb-2">Exit Successful</h3>
                    <p><strong>Duration:</strong> {exitSummary.durationMinutes} minutes</p>
                    <p className="text-xl mt-2 font-semibold">Total Fee: ${exitSummary.fee}</p>
                    <button 
                        onClick={() => navigate('/payments')}
                        className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                        Proceed to Payment
                    </button>
                </div>
            )}
        </div>
    );
}
