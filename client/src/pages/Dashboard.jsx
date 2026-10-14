import { useEffect, useState } from 'react';
import { Plus, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import WorkspaceCard from '../components/workspace/WorkspaceCard';
import CreateWorkspaceModal from '../components/workspace/CreateWorkspaceModal';
import { workspaceAPI, authAPI } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [wsRes, sumRes] = await Promise.all([
        workspaceAPI.getAll(),
        authAPI.getMySummary(),
      ]);
      setWorkspaces(wsRes.data.data.workspaces);
      setSummary(sumRes.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const firstName = user?.name?.split(' ')[0] || 'there';

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8 animate-slide-up">
        <h1 className="text-3xl font-semibold text-stone-900 tracking-tight mb-1">
          Welcome back, {firstName}
        </h1>
        <p className="text-sm text-stone-500">
          Here's your expense overview
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <SummaryCard
            label="You are owed"
            value={summary.totalOwed}
            tone="success"
            icon={TrendingUp}
          />
          <SummaryCard
            label="You owe"
            value={summary.totalOwing}
            tone="danger"
            icon={TrendingDown}
          />
          <SummaryCard
            label="Net balance"
            value={summary.net}
            tone={summary.net >= 0 ? 'success' : 'danger'}
            showSign
            icon={Wallet}
          />
        </div>
      )}

      {/* Workspaces Section */}
      <div className="flex items-center justify-between mb-5 animate-slide-up">
        <div>
          <h2 className="text-lg font-semibold text-stone-900">
            Workspaces
          </h2>
          <p className="text-sm text-stone-500">
            {workspaces.length} {workspaces.length === 1 ? 'workspace' : 'workspaces'}
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          New workspace
        </Button>
      </div>

      {/* Workspaces Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="w-11 h-11 bg-stone-200 rounded-lg mb-4" />
              <div className="h-4 bg-stone-200 rounded mb-2 w-3/4" />
              <div className="h-3 bg-stone-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        <EmptyState onCreate={() => setModalOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((item) => (
            <WorkspaceCard
              key={item.workspace._id}
              workspace={item.workspace}
              role={item.role}
              memberCount={1}
            />
          ))}
        </div>
      )}

      <CreateWorkspaceModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={fetchData}
      />
    </Layout>
  );
}

function SummaryCard({ label, value, tone, showSign, icon: Icon }) {
  const toneClasses = {
    success: 'text-emerald-700 bg-emerald-50',
    danger: 'text-rose-700 bg-rose-50',
  };

  const formatted = Math.abs(value || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return (
    <div className="card card-3d p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-medium text-stone-500 uppercase tracking-wide">
          {label}
        </p>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${toneClasses[tone]}`}>
          <Icon size={15} />
        </div>
      </div>
      <p className={`text-2xl font-semibold tracking-tight ${
        showSign ? toneClasses[tone].split(' ')[0] : 'text-stone-900'
      }`}>
        {showSign && (value >= 0 ? '+' : '−')}₹{formatted}
      </p>
    </div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="card p-12 text-center animate-slide-up">
      <div className="w-14 h-14 bg-olive-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Wallet size={24} className="text-olive-700" />
      </div>
      <h3 className="font-semibold text-stone-900 mb-1">
        No workspaces yet
      </h3>
      <p className="text-sm text-stone-500 mb-6 max-w-sm mx-auto">
        Create your first workspace to start tracking shared expenses with friends, roommates, or your team.
      </p>
      <Button onClick={onCreate}>
        <Plus size={16} />
        Create your first workspace
      </Button>
    </div>
  );
}