import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Users, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import ExpenseList from '../components/expense/ExpenseList';
import AddExpenseModal from '../components/expense/AddExpenseModal';
import SettlementTab from '../components/settlement/SettlementTab';
import AnalyticsTab from '../components/analytics/AnalyticsTab';
import { workspaceAPI, expenseAPI, settlementAPI } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';

export default function WorkspaceDetail() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [workspace, setWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [myRole, setMyRole] = useState('');
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('expenses');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [wsRes, expRes, balRes] = await Promise.all([
        workspaceAPI.getOne(workspaceId),
        expenseAPI.getAll(workspaceId),
        settlementAPI.getBalances(workspaceId),
      ]);
      setWorkspace(wsRes.data.data.workspace);
      setMembers(wsRes.data.data.members);
      setMyRole(wsRes.data.data.myRole);
      setExpenses(expRes.data.data.expenses);
      setBalances(balRes.data.data.balances);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Workspace not found');
        navigate('/dashboard');
      } else if (error.response?.status === 403) {
        toast.error('You are not a member of this workspace');
        navigate('/dashboard');
      } else {
        toast.error('Failed to load workspace');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [workspaceId]);

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await expenseAPI.delete(workspaceId, expenseId);
      toast.success('Expense deleted');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3" />
          <div className="h-32 bg-slate-200 rounded" />
          <div className="h-64 bg-slate-200 rounded" />
        </div>
      </Layout>
    );
  }

  if (!workspace) return null;

  const myBalance = balances.find((b) => b.user._id === user._id);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const tabs = [
    { id: 'expenses', label: 'Expenses' },
    { id: 'balances', label: 'Balances' },
    { id: 'settlements', label: 'Settlements' },
    { id: 'analytics', label: 'Analytics' },
  ];

  return (
    <Layout>
      {/* Back link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>

      {/* Header Card */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center">
              <Wallet size={26} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">
                {workspace.name}
              </h1>
              <p className="text-slate-600 text-sm">
                {workspace.description || 'No description'}
              </p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-xs font-medium px-2 py-1 rounded-md bg-slate-100 text-slate-700 capitalize">
                  {workspace.type}
                </span>
                <span className="flex items-center gap-1 text-xs text-slate-500">
                  <Users size={14} />
                  {members.length} member{members.length !== 1 ? 's' : ''}
                </span>
                <span className="text-xs font-medium px-2 py-1 rounded-md bg-primary-100 text-primary-700">
                  {myRole}
                </span>
              </div>
            </div>
          </div>

          <Button onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            Add Expense
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-500 mb-1">Total expenses</p>
            <p className="text-xl font-bold text-slate-900">
              ₹{totalExpenses.toLocaleString('en-IN')}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Your balance</p>
            <p
              className={`text-xl font-bold ${
                myBalance?.balance > 0
                  ? 'text-success-600'
                  : myBalance?.balance < 0
                    ? 'text-danger-600'
                    : 'text-slate-900'
              }`}
            >
              {myBalance?.balance > 0 ? '+' : ''}₹
              {Math.abs(myBalance?.balance || 0).toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {myBalance?.status === 'owed'
                ? 'You are owed'
                : myBalance?.status === 'owes'
                  ? 'You owe'
                  : 'Settled up'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Transactions</p>
            <p className="text-xl font-bold text-slate-900">{expenses.length}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-slate-200 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="pb-8">
        {activeTab === 'expenses' && (
          <ExpenseList
            expenses={expenses}
            currentUserId={user._id}
            onDelete={handleDeleteExpense}
          />
        )}

        {activeTab === 'balances' && (
          <div className="space-y-2">
            {balances.length === 0 ? (
              <div className="card p-8 text-center text-slate-500">
                No balances yet
              </div>
            ) : (
              balances.map((b) => (
                <div key={b.user._id} className="card p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {b.user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      {b.user.name}
                      {b.user._id === user._id && (
                        <span className="text-slate-400 ml-1">(you)</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">
                      {b.status === 'owed'
                        ? 'is owed'
                        : b.status === 'owes'
                          ? 'owes'
                          : 'settled up'}
                    </p>
                  </div>
                  <p
                    className={`text-lg font-bold ${
                      b.balance > 0
                        ? 'text-success-600'
                        : b.balance < 0
                          ? 'text-danger-600'
                          : 'text-slate-400'
                    }`}
                  >
                    {b.balance > 0 ? '+' : ''}₹
                    {Math.abs(b.balance).toLocaleString('en-IN')}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'settlements' && (
          <SettlementTab
            workspaceId={workspaceId}
            members={members}
            currentUser={user}
            balances={balances}
            onRefresh={fetchData}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsTab workspaceId={workspaceId} members={members} />
        )}
      </div>

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        workspaceId={workspaceId}
        members={members}
        currentUser={user}
        onCreated={fetchData}
      />
    </Layout>
  );
}