import React from 'react';

export const StatCard = ({
  title,
  value,
  subtext,
  change,
  changeType = 'positive', // 'positive' | 'negative' | 'neutral'
  icon,
  iconBg = 'bg-primary-container/10',
  iconColor = 'text-primary',
  extraBadge
}) => {
  return (
    <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm hover:shadow-md transition-all flex flex-col justify-between border border-surface-container-high/40 group">
      <div className="flex items-center justify-between mb-space-md">
        <span className="text-label-md text-on-surface-variant uppercase tracking-wider font-bold">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center ${iconColor} group-hover:scale-110 transition-transform`}>
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
      </div>
      <div>
        <div className="flex items-baseline justify-between">
          <div className="text-headline-xl text-primary font-bold">{value}</div>
          {extraBadge && <div>{extraBadge}</div>}
        </div>
        <div className="flex items-center gap-space-xs mt-space-xs">
          {change && (
            <span
              className={`text-label-sm px-1.5 py-0.5 rounded font-semibold flex items-center ${
                changeType === 'positive'
                  ? 'text-emerald-700 bg-emerald-50'
                  : changeType === 'negative'
                  ? 'text-rose-700 bg-rose-50'
                  : 'text-on-surface-variant bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-[12px] mr-0.5">
                {changeType === 'positive' ? 'trending_up' : changeType === 'negative' ? 'trending_down' : 'remove'}
              </span>
              {change}
            </span>
          )}
          {subtext && <span className="text-body-sm text-outline">{subtext}</span>}
        </div>
      </div>
    </div>
  );
};
