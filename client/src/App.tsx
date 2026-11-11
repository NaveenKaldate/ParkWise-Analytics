import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import ParkingSlots from './pages/ParkingSlots';
import Entry from './pages/Entry';
import Exit from './pages/Exit';
import Payments from './pages/Payments';
import History from './pages/History';
import Analytics from './pages/Analytics';
import DataMining from './pages/DataMining';
import Reports from './pages/Reports';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="vehicles" element={<Vehicles />} />
          <Route path="slots" element={<ParkingSlots />} />
          <Route path="entry" element={<Entry />} />
          <Route path="exit" element={<Exit />} />
          <Route path="payments" element={<Payments />} />
          <Route path="history" element={<History />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="data-mining" element={<DataMining />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
