import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Payments() {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Simple payment form state
    const [parkingId, setParkingId] = useState('');
    const [amount, setAmount] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const res = await api.get('/payments');
            setPayments(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        try {
            await api.post('/payments', {
                parking_id: parkingId,
                amount: amount
            });
            alert('Payment recorded successfully');
            setParkingId('');
            setAmount('');
            fetchPayments();
        } catch (error: any) {
            alert(error.response?.data?.error || 'Payment failed');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-text-primary">Payments</h2>

            <div className="bg-card-bg border-border p-6 rounded-lg shadow border border-border max-w-xl">
                <h3 className="font-semibold text-lg mb-4">Record New Payment</h3>
                <form onSubmit={handlePayment} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-text-secondary mb-1">Parking ID</label>
                        <input style={{backgroundColor:"var(--color-main-bg)", color:"var(--color-text-primary)"}} required type="number" className="w-full border rounded p-2" value={parkingId} onChange={e => setParkingId(e.target.value)} />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-text-secondary mb-1">Amount ($)</label>
                        <input style={{backgroundColor:"var(--color-main-bg)", color:"var(--color-text-primary)"}} required type="number" step="0.01" className="w-full border rounded p-2" value={amount} onChange={e => setAmount(e.target.value)} />
                    </div>
                    <button disabled={processing} type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700 disabled:opacity-50">
                        Pay
                    </button>
                </form>
            </div>

            <div className="bg-card-bg border-border rounded-lg shadow overflow-hidden border border-border">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-sidebar-bg border-b border-border">
                            <th className="p-4 text-sm font-semibold text-text-secondary">Payment ID</th>
                            <th className="p-4 text-sm font-semibold text-text-secondary">Parking ID</th>
                            <th className="p-4 text-sm font-semibold text-text-secondary">Vehicle Number</th>
                            <th className="p-4 text-sm font-semibold text-text-secondary">Amount</th>
                            <th className="p-4 text-sm font-semibold text-text-secondary">Date</th>
                            <th className="p-4 text-sm font-semibold text-text-secondary">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
                        ) : (
                            payments.map(p => (
                                <tr key={p.payment_id} className="border-b border-border hover:bg-sidebar-bg">
                                    <td className="p-4 text-sm">{p.payment_id}</td>
                                    <td className="p-4 text-sm">{p.parking_id}</td>
                                    <td className="p-4 text-sm font-medium">{p.vehicle_number}</td>
                                    <td className="p-4 text-sm text-emerald-600 font-semibold">${p.amount}</td>
                                    <td className="p-4 text-sm">{new Date(p.payment_date).toLocaleString()}</td>
                                    <td className="p-4 text-sm">
                                        <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                                            {p.payment_status}
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
