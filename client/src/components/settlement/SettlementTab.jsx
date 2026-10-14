import { useState, useEffect } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { settlementAPI } from '../../api/endpoints';
import Button from '../ui/Button';

export default function SettlementTab({ workspaceId, currentUser, balances, onRefresh }) {
  const [suggestions, setSuggestions] = useState([]);
  const [savings, setSavings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recording, setRecording] = useState(null);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const { data } = await settlementAPI.getSuggestions(workspaceId);
      setSuggestions(data.data.suggestions);
      setSavings(data.data.savings);
    } catch (error) {
      toast.error('Failed to load suggestions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
  }, [workspaceId, balances]);

  const handleRecord = async (suggestion) => {
    if (!window.confirm(`Record ₹${suggestion.amount} payment from ${suggestion.from.name} to ${suggestion.to.name}?`)) return;
    setRecording(suggestion.to._id);
    try {
      await settlementAPI.create(workspaceId, {
        from: suggestion.from._id,
        to: suggestion.to._id,
        amount: suggestion.amount,
        note: 'Settled via SplitFlow',
      });
      toast.success('Settlement recorded');
      fetchSuggestions();
      onRefresh?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record settlement');
    } finally {
      setRecording(null);
    }
  };

  if (loading) {
    return (
      <div className="card p-8 text-center">
        <div className="w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Calculating optimal settlements
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {savings && savings.saved > 0 && (
        <div className="card p-4 border-l-2 border-l-primary-600">
          <p className="text-sm text-slate-700 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              Optimized:
            </span>{' '}
            Reduced from {savings.naiveTransactions} to{' '}
            {savings.optimizedTransactions} transactions — saving {savings.saved}{' '}
            {savings.saved === 1 ? 'transfer' : 'transfers'}.
          </p>
        </div>
      )}

      <div>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
          Recommended settlements
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Minimum transactions to settle all balances
        </p>

        {suggestions.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="w-10 h-10 bg-success-50 dark:bg-success-950/40 rounded-full flex items-center justify-center mx-auto mb-3">
              <Check size={18} className="text-success-600 dark:text-success-500" />
            </div>
            <p className="font-medium text-slate-900 dark:text-slate-100">
              All settled up
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              No pending balances in this workspace
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {suggestions.map((s, idx) => (
              <div
                key={idx}
                className="card p-4 flex flex-col md:flex-row md:items-center gap-4"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {s.from.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {s.from._id === currentUser._id ? 'You' : s.from.name}
                  </span>
                  <ArrowRight size={14} className="text-slate-400" />
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {s.to.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {s.to._id === currentUser._id ? 'You' : s.to.name}
                  </span>
                </div>

                <div className="text-base font-semibold text-slate-900 dark:text-slate-100 md:min-w-[100px] md:text-right">
                  ₹{s.amount.toLocaleString('en-IN')}
                </div>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleRecord(s)}
                  loading={recording === s.to._id}
                >
                  Mark paid
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}