import { Trash2, UtensilsCrossed, Plane, Home, Lightbulb, Film, ShoppingBag, HeartPulse, GraduationCap, Smartphone, Tag } from 'lucide-react';

const categoryIcons = {
  food: UtensilsCrossed,
  travel: Plane,
  rent: Home,
  utilities: Lightbulb,
  entertainment: Film,
  shopping: ShoppingBag,
  health: HeartPulse,
  education: GraduationCap,
  subscription: Smartphone,
  other: Tag,
};

export default function ExpenseList({ expenses, currentUserId, onDelete }) {
  if (expenses.length === 0) {
    return (
      <div className="card p-12 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No expenses yet
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Add your first expense to get started
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {expenses.map((exp) => {
        const isPayer = exp.paidBy?._id === currentUserId;
        const mySplit = exp.splits?.find((s) => s.user?._id === currentUserId);
        const myShare = mySplit?.amount || 0;
        const Icon = categoryIcons[exp.category] || Tag;

        return (
          <div
            key={exp._id}
            className="card p-4 flex items-center gap-4 hover:border-slate-300 transition-colors group dark:hover:border-slate-700"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Icon size={18} className="text-slate-600 dark:text-slate-400" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                {exp.title}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isPayer ? 'You' : exp.paidBy?.name} paid
                <span className="mx-1.5">·</span>
                {new Date(exp.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                ₹{exp.amount.toLocaleString('en-IN')}
              </p>
              {!isPayer && myShare > 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  your share ₹{myShare.toFixed(2)}
                </p>
              )}
            </div>

            {onDelete && isPayer && (
              <button
                onClick={() => onDelete(exp._id)}
                className="p-2 rounded-md text-slate-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-950/40 opacity-0 group-hover:opacity-100 transition-all"
                title="Delete expense"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}