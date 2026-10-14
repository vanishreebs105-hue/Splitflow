const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  ...props
}) => {
  const baseClasses = {
    primary: 'btn-brand',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  return (
    <button
      className={`${baseClasses[variant] || baseClasses.primary} ${sizeClasses[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <>
          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;