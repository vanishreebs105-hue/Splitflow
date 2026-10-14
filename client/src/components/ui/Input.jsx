import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, icon: Icon, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <div className="relative">
        {Icon && (
          <Icon
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          />
        )}
        <input
          ref={ref}
          className={`input ${Icon ? 'pl-9' : ''} ${
            error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/15' : ''
          }`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-rose-600">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;