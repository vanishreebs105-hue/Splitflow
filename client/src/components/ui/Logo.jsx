import { Wallet } from 'lucide-react';

const Logo = ({ size = 'md', showText = true }) => {
  const sizes = {
    sm: { box: 'w-7 h-7', icon: 14, text: 'text-base' },
    md: { box: 'w-8 h-8', icon: 16, text: 'text-lg' },
    lg: { box: 'w-10 h-10', icon: 20, text: 'text-xl' },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-2.5">
      <div className={`${s.box} bg-olive-600 rounded-lg flex items-center justify-center shadow-sm`}>
        <Wallet size={s.icon} className="text-white" />
      </div>
      {showText && (
        <span className={`${s.text} font-semibold tracking-tight text-stone-900`}>
          SplitFlow
        </span>
      )}
    </div>
  );
};

export default Logo;