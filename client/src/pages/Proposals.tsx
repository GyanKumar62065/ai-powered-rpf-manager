import { useEffect, useState } from 'react';
import { RefreshCw, Mail } from 'lucide-react';
import { getProposals, syncEmails } from '@/services/api';
import { formatDate, formatCurrency } from '@/lib/utils';

export default function Proposals() {
  const [proposals, setProposals] = useState<any[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    try {
      const response = await getProposals();
      setProposals(response.data);
    } catch (error) {
      console.error('Error loading proposals:', error);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await syncEmails();
      alert(`Sync completed! Processed ${response.data.processed} new proposal(s).`);
      loadProposals();
    } catch (error) {
      console.error('Error syncing emails:', error);
      alert('Failed to sync emails. Make sure Mailpit is running.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proposals</h1>
          <p className="text-gray-500 mt-2">View and compare vendor proposals</p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2"
        >
          <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
          Sync Emails
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Click "Sync Emails" to fetch new vendor responses from Mailpit. 
          Make sure vendors reply to RFP emails keeping the reference ID in the subject line.
        </p>
      </div>

      <div className="grid gap-4">
        {proposals.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No proposals yet.</p>
            <p className="text-sm text-gray-400">Send RFPs to vendors and sync emails to see proposals here.</p>
          </div>
        ) : (
          proposals.map((proposal) => (
            <div key={proposal.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{proposal.vendor.name}</h3>
                  <p className="text-gray-600 mt-1">For: {proposal.rfp.title}</p>
                  <p className="text-sm text-gray-500 mt-1">Received {formatDate(proposal.receivedAt)}</p>
                </div>
                <div className="text-right">
                  {proposal.aiScore && (
                    <div className="mb-2">
                      <span className="text-2xl font-bold text-primary">{proposal.aiScore.toFixed(1)}</span>
                      <span className="text-gray-500">/100</span>
                    </div>
                  )}
                  {proposal.aiExtractedData?.price && (
                    <p className="text-lg font-bold text-gray-900">
                      {formatCurrency(proposal.aiExtractedData.price, proposal.aiExtractedData.currency || 'USD')}
                    </p>
                  )}
                </div>
              </div>

              {proposal.aiSummary && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">AI Summary</h4>
                  <p className="text-gray-700 text-sm">{proposal.aiSummary}</p>
                </div>
              )}

              {proposal.aiExtractedData && (
                <div className="grid grid-cols-2 gap-4">
                  {proposal.aiExtractedData.timeline && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Timeline</p>
                      <p className="text-gray-900">{proposal.aiExtractedData.timeline}</p>
                    </div>
                  )}
                  {proposal.aiExtractedData.items && proposal.aiExtractedData.items.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-600">Items</p>
                      <p className="text-gray-900">{proposal.aiExtractedData.items.length} item(s)</p>
                    </div>
                  )}
                </div>
              )}

              {proposal.aiExtractedData?.terms && proposal.aiExtractedData.terms.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">Terms & Conditions</p>
                  <ul className="list-disc list-inside space-y-1">
                    {proposal.aiExtractedData.terms.map((term: string, i: number) => (
                      <li key={i} className="text-sm text-gray-700">{term}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
