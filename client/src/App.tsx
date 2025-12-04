import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Vendors from './pages/Vendors';
import RFPs from './pages/RFPs';
import RFPDetail from './pages/RFPDetail';
import Proposals from './pages/Proposals';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/vendors" element={<Vendors />} />
        <Route path="/rfps" element={<RFPs />} />
        <Route path="/rfps/:id" element={<RFPDetail />} />
        <Route path="/proposals" element={<Proposals />} />
      </Routes>
    </Layout>
  );
}

export default App;
