import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Users, Mail, TrendingUp } from 'lucide-react';
import { getRFPs, getVendors, getProposals } from '@/services/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    rfps: 0,
    vendors: 0,
    proposals: 0,
    activeRFPs: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [rfpsRes, vendorsRes, proposalsRes] = await Promise.all([
        getRFPs(),
        getVendors(),
        getProposals(),
      ]);

      const rfps = rfpsRes.data;
      const activeRFPs = rfps.filter((rfp: any) => rfp.status === 'SENT').length;

      setStats({
        rfps: rfps.length,
        vendors: vendorsRes.data.length,
        proposals: proposalsRes.data.length,
        activeRFPs,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const statCards = [
    { label: 'Total RFPs', value: stats.rfps, icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-100', link: '/rfps' },
    { label: 'Active RFPs', value: stats.activeRFPs, icon: TrendingUp, color: 'text-green-600', bgColor: 'bg-green-100', link: '/rfps' },
    { label: 'Vendors', value: stats.vendors, icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-100', link: '/vendors' },
    { label: 'Proposals', value: stats.proposals, icon: Mail, color: 'text-orange-600', bgColor: 'bg-orange-100', link: '/proposals' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">Welcome to your RFP Management System</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Start</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-semibold">
              1
            </div>
            <div>
              <h3 className="font-medium">Add Vendors</h3>
              <p className="text-sm text-gray-600">Start by adding vendors to your database</p>
              <Link to="/vendors" className="text-primary text-sm font-medium hover:underline mt-1 inline-block">
                Manage Vendors →
              </Link>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-semibold">
              2
            </div>
            <div>
              <h3 className="font-medium">Create RFP</h3>
              <p className="text-sm text-gray-600">Use AI to parse your requirements and create an RFP</p>
              <Link to="/rfps" className="text-primary text-sm font-medium hover:underline mt-1 inline-block">
                Create RFP →
              </Link>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-semibold">
              3
            </div>
            <div>
              <h3 className="font-medium">Send & Track</h3>
              <p className="text-sm text-gray-600">Send RFPs via email and sync responses from Mailpit</p>
              <Link to="/proposals" className="text-primary text-sm font-medium hover:underline mt-1 inline-block">
                View Proposals →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
