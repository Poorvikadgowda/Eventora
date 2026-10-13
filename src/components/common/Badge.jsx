import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md' }) => {
  const variantStyles = {
    default: 'bg-surface-container-high text-on-surface-variant',
    primary: 'bg-primary-container text-on-primary-container',
    secondary: 'bg-secondary-fixed text-on-secondary-fixed',
    tertiary: 'bg-tertiary-fixed text-on-tertiary-fixed',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200/60',
    danger: 'bg-rose-50 text-rose-800 border border-rose-200/60',
    live: 'bg-rose-500 text-white animate-pulse',
    verified: 'bg-emerald-100 text-emerald-800',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-bold',
    md: 'text-label-sm px-2.5 py-0.5 font-semibold',
    lg: 'text-label-md px-3 py-1 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full uppercase tracking-wider ${
        variantStyles[variant] || variantStyles.default
      } ${sizeStyles[size] || sizeStyles.md}`}
    >
      {children}
    </span>
  );
};
