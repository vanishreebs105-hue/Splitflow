import { useEffect, useState } from 'react';
import { TrendingUp, Activity, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { analyticsAPI } from '../../api/endpoints';
import {
  CategoryPieChart,
  MonthlyTrendChart,
  MemberBarChart,
} from './Charts';

export default function AnalyticsTab({ workspaceId, members }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await analyticsAPI.overview(workspaceId);
        setAnalytics(data.data);
      } catch (error) {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-1/4 mb-4" />
            <div className="h-[260px] bg-slate-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  // Build user map for names
  const usersMap = {};
  members.forEach((m) => {
    usersMap[m.user._id] = m.user;
  });

  const { summary, byCategory, byMember, monthlyTrend, largestExpense } = analytics;

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total spent"
          value={`₹${summary.totalExpenses.toLocaleString('en-IN')}`}
          icon={TrendingUp}
          color="primary"
        />
        <StatCard
          label="Transactions"
          value={summary.totalTransactions}
          icon={Activity}
          color="success"
        />
        <StatCard
          label="Avg expense"
          value={`₹${summary.avgExpense.toLocaleString('en-IN')}`}
          icon={Award}
          color="warning"
        />
        <StatCard
          label="Settled"
          value={`₹${summary.totalSettlements.toLocaleString('en-IN')}`}
          icon={TrendingUp}
          color="info"
        />
      </div>

      {/* Largest expense highlight */}
      {largestExpense && (
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-warning-50 rounded-xl flex items-center justify-center text-2xl">
              🏆
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                Largest expense
              </p>
              <p className="font-semibold text-slate-900">{largestExpense.title}</p>
            </div>
            <p className="text-lg font-bold text-slate-900">
              ₹{largestExpense.amount.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Spending by Category</h3>
          <CategoryPieChart data={byCategory} />
        </div>

        <div className="card p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Who Paid What</h3>
          <MemberBarChart data={byMember} users={usersMap} />
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Monthly Trend (last 6 months)</h3>
        <MonthlyTrendChart data={monthlyTrend} />
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    success: 'bg-success-50 text-success-600',
    warning: 'bg-amber-50 text-amber-600',
    info: 'bg-cyan-50 text-cyan-600',
  };

  return (
    <div className="card p-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${colorClasses[color]}`}>
        <Icon size={18} />
      </div>
      <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
      <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}