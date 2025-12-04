import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, RefreshCw, Trash2 } from 'lucide-react';
import { getRFP, getVendors, sendRFP, deleteRFP, updateRFPStatus } from '@/services/api';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function RFPDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rfp, setRfp] = useState<any>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [rfpRes, vendorsRes] = await Promise.all([getRFP(id!), getVendors()]);
      setRfp(rfpRes.data);
      setVendors(vendorsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSendRFP = async () => {
    if (selectedVendors.length === 0) {
      alert('Please select at least one vendor');
      return;
    }
    setLoading(true);
    try {
      await sendRFP(id!, selectedVendors);
      alert('RFP sent successfully!');
      loadData();
      setSelectedVendors([]);
    } catch (error) {
      console.error('Error sending RFP:', error);
      alert('Failed to send RFP');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this RFP?')) return;
    try {
      await deleteRFP(id!);
      navigate('/rfps');
    } catch (error) {
      console.error('Error deleting RFP:', error);
      alert('Failed to delete RFP');
    }
  };

  const handleCloseRFP = async () => {
    if (!confirm('Close this RFP? This will mark it as completed.')) return;
    try {
      await updateRFPStatus(id!, 'CLOSED');
      loadData();
    } catch (error) {
      console.error('Error closing RFP:', error);
      alert('Failed to close RFP');
    }
  };

  if (!rfp) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate('/rfps')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to RFPs
      </button>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{rfp.title}</h1>
            <p className="text-gray-500 mt-2">Created {formatDate(rfp.createdAt)}</p>
          </div>
          <div className="flex gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                rfp.status === 'DRAFT'
                  ? 'bg-gray-100 text-gray-700'
                  : rfp.status === 'SENT'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {rfp.status}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{rfp.content}</p>
          </div>

          {rfp.structuredData && (
            <div className="grid grid-cols-2 gap-6">
              {rfp.structuredData.budget && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Budget</h3>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(rfp.structuredData.budget, rfp.structuredData.currency)}
                  </p>
                </div>
              )}
              {rfp.structuredData.timeline && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Timeline</h3>
                  <p className="text-gray-700">{rfp.structuredData.timeline}</p>
                </div>
              )}
            </div>
          )}

          {rfp.structuredData?.items && rfp.structuredData.items.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Items</h3>
              <div className="space-y-2">
                {rfp.structuredData.items.map((item: any, index: number) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        {item.specifications && (
                          <div className="text-sm text-gray-600 mt-2 space-y-1">
                            {typeof item.specifications === 'string' ? (
                              <p>{item.specifications}</p>
                            ) : Array.isArray(item.specifications) ? (
                              item.specifications.map((spec: any, idx: number) => (
                                <p key={idx}>• {spec.requirement || JSON.stringify(spec)}</p>
                              ))
                            ) : (
                              Object.entries(item.specifications).map(([key, value]) => (
                                <p key={key}>
                                  • {key.replace(/_/g, ' ')}: {String(value)}
                                </p>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                      <span className="text-gray-700 font-medium ml-4">Qty: {item.quantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {rfp.status !== 'CLOSED' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Send to Vendors</h2>
          <div className="space-y-3 mb-4">
            {vendors.map((vendor) => (
              <label key={vendor.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <input
                  type="checkbox"
                  checked={selectedVendors.includes(vendor.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedVendors([...selectedVendors, vendor.id]);
                    } else {
                      setSelectedVendors(selectedVendors.filter((v) => v !== vendor.id));
                    }
                  }}
                  className="w-5 h-5 text-primary rounded focus:ring-primary"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{vendor.name}</p>
                  <p className="text-sm text-gray-600">{vendor.email}</p>
                </div>
              </label>
            ))}
          </div>
          <button
            onClick={handleSendRFP}
            disabled={loading || selectedVendors.length === 0}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-5 h-5" />
            {loading ? 'Sending...' : `Send to ${selectedVendors.length} Vendor${selectedVendors.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      )}

      {rfp.proposals && rfp.proposals.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Proposals Received ({rfp.proposals.length})</h2>
          <div className="space-y-3">
            {rfp.proposals.map((proposal: any) => (
              <div key={proposal.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{proposal.vendor.name}</p>
                    {proposal.aiScore && (
                      <p className="text-sm text-gray-600 mt-1">Score: {proposal.aiScore.toFixed(1)}/100</p>
                    )}
                  </div>
                  {proposal.aiExtractedData?.price && (
                    <p className="text-lg font-bold text-primary">
                      {formatCurrency(proposal.aiExtractedData.price, proposal.aiExtractedData.currency || 'USD')}
                    </p>
                  )}
                </div>
                {proposal.aiSummary && (
                  <p className="text-sm text-gray-700 mt-2">{proposal.aiSummary}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {rfp.status === 'SENT' && (
          <button
            onClick={handleCloseRFP}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Close RFP
          </button>
        )}
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
        >
          <Trash2 className="w-5 h-5" />
          Delete RFP
        </button>
      </div>
    </div>
  );
}
