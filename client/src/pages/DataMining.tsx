import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis 
} from 'recharts';

export default function DataMining() {
    const [miningData, setMiningData] = useState<any>(null);

    useEffect(() => {
        api.get('/analytics/data-mining')
            .then(res => setMiningData(res.data))
            .catch(console.error);
    }, []);

    if (!miningData) return <div>Loading data mining results...</div>;

    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-text-primary">Data Mining & Machine Learning</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Regression Metrics */}
                <div className="bg-card-bg border-border p-6 rounded-lg shadow border border-border lg:col-span-1">
                    <h3 className="font-semibold text-lg mb-4">Linear Regression Metrics</h3>
                    <p className="text-sm text-text-secondary mb-6">Predicting parking fee based on features.</p>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-text-secondary font-medium">MAE:</span>
                            <span className="font-bold text-text-primary">{miningData.metrics?.mae}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-text-secondary font-medium">RMSE:</span>
                            <span className="font-bold text-text-primary">{miningData.metrics?.rmse}</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                            <span className="text-text-secondary font-medium">R² Score:</span>
                            <span className="font-bold text-text-primary">{miningData.metrics?.r2}</span>
                        </div>
                    </div>
                    
                    <div className="mt-6 p-4 bg-blue-50 text-blue-800 rounded text-sm font-medium">
                        {miningData.metrics?.message}
                    </div>
                </div>

                {/* K-Means Scatter Plot */}
                <div className="bg-card-bg border-border p-6 rounded-lg shadow border border-border lg:col-span-2">
                    <h3 className="font-semibold text-lg mb-4">K-Means Clustering</h3>
                    <p className="text-sm text-text-secondary mb-6">Clusters based on Duration and Fee.</p>
                    
                    <div className="h-80">
                        {miningData.clusteringData?.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#263449" />
                                    <XAxis type="number" dataKey="DurationMinutes" name="Duration (min)" stroke="#64748b" />
                                    <YAxis type="number" dataKey="ParkingFee" name="Fee ($)" stroke="#64748b" />
                                    <ZAxis type="number" range={[50, 50]} />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#151F32', borderColor: '#263449', color: '#f1f5f9' }} />
                                    <Scatter name="Clusters" data={miningData.clusteringData.slice(0, 300)}>
                                        {miningData.clusteringData.slice(0, 300).map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[parseInt(entry.Cluster) % COLORS.length]} />
                                        ))}
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-text-secondary">
                                Clustering data not available or format is incorrect.
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
