import { Link } from 'react-router-dom';
import { Users, ChevronRight, Wallet } from 'lucide-react';

const roleStyles = {
  OWNER: 'bg-olive-100 text-olive-700',
  ADMIN: 'bg-purple-100 text-purple-700',
  MEMBER: 'bg-stone-100 text-stone-700',
  VIEWER: 'bg-stone-100 text-stone-500',
};

export default function WorkspaceCard({ workspace, role, memberCount = 0 }) {
  return (
    <Link
      to={`/workspaces/${workspace._id}`}
      className="group block card card-3d p-5 relative overflow-hidden"
    >
      {/* Subtle hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-olive-50/0 via-transparent to-olive-50/0 group-hover:from-olive-50/40 group-hover:to-transparent transition-all duration-300 pointer-events-none" />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 bg-olive-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Wallet size={18} className="text-olive-700" />
          </div>
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wide ${
              roleStyles[role] || roleStyles.MEMBER
            }`}
          >
            {role}
          </span>
        </div>

        <h3 className="font-semibold text-stone-900 mb-1 truncate group-hover:text-olive-700 transition-colors">
          {workspace.name}
        </h3>

        {workspace.description ? (
          <p className="text-sm text-stone-500 line-clamp-2 mb-3 min-h-[40px]">
            {workspace.description}
          </p>
        ) : (
          <p className="text-sm text-stone-400 mb-3 min-h-[40px] italic">
            No description
          </p>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-stone-100">
          <div className="flex items-center gap-3 text-xs text-stone-500">
            <span className="capitalize font-medium">{workspace.type}</span>
            <span className="w-1 h-1 bg-stone-300 rounded-full" />
            <span className="flex items-center gap-1">
              <Users size={12} />
              {memberCount}
            </span>
          </div>
          <ChevronRight
            size={16}
            className="text-stone-400 group-hover:text-olive-600 group-hover:translate-x-1 transition-all duration-300"
          />
        </div>
      </div>
    </Link>
  );
}