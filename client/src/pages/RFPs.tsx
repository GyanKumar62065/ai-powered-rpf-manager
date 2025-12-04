import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Clock } from 'lucide-react';
import { getRFPs, createRFP } from '@/services/api';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function RFPs() {
  const [rfps, setRfps] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRFPs();
  }, []);

  const loadRFPs = async () => {
    try {
      const response = await getRFPs();
      setRfps(response.data);
    } catch (error) {
      console.error('Error loading RFPs:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createRFP(formData);
      setFormData({ title: '', content: '' });
      setShowForm(false);
      loadRFPs();
    } catch (error) {
      console.error('Error creating RFP:', error);
      alert('Failed to create RFP. Make sure Ollama is running.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-700';
      case 'SENT':
        return 'bg-blue-100 text-blue-700';
      case 'CLOSED':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">RFPs</h1>
          <p className="text-gray-500 mt-2">Manage your Requests for Proposal</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create RFP
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New RFP</h2>
          <p className="text-sm text-gray-600 mb-4">
            Describe your requirements in natural language. AI will parse and structure your RFP.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Leave blank for AI to generate"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Example: I need 50 laptops with 16GB RAM and 512GB SSD for my team. Budget is around $50,000. Need delivery within 2 weeks."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? 'Creating with AI...' : 'Create RFP'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {rfps.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No RFPs yet. Create your first RFP to get started.</p>
          </div>
        ) : (
          rfps.map((rfp) => (
            <Link
              key={rfp.id}
              to={`/rfps/${rfp.id}`}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{rfp.title}</h3>
                  <p className="text-gray-600 mt-1 line-clamp-2">{rfp.content}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(rfp.status)}`}
                >
                  {rfp.status}
                </span>
              </div>
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {formatDate(rfp.createdAt)}
                </div>
                {rfp.structuredData?.budget && (
                  <div>
                    Budget: {formatCurrency(rfp.structuredData.budget, rfp.structuredData.currency)}
                  </div>
                )}
                {rfp.proposals?.length > 0 && (
                  <div className="font-medium text-primary">
                    {rfp.proposals.length} Proposal{rfp.proposals.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
