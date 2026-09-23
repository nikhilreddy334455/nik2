import React from 'react';
import { Package, Search, Sparkles, CheckCircle2, TrendingUp } from 'lucide-react';
import { DashboardStats } from '../lib/types.js';

interface StatsOverviewProps {
  stats: DashboardStats | null;
  loading?: boolean;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({ stats, loading }) => {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-24 glass-panel rounded-2xl bg-slate-800/40" />
        ))}
      </div>
    );
  }

  const statCards = [
    {
      label: 'Active Lost Reports',
      value: stats.lostItems,
      icon: Search,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/20'
    },
    {
      label: 'Active Found Reports',
      value: stats.foundItems,
      icon: Package,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      label: 'AI Matches Computed',
      value: stats.totalMatches,
      icon: Sparkles,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10 border-sky-500/20'
    },
    {
      label: 'High-Confidence Matches',
      value: stats.highConfidenceMatches,
      icon: CheckCircle2,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10 border-purple-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {statCards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`glass-panel rounded-2xl p-4 border flex items-center justify-between transition-all hover:scale-[1.01] ${card.bgColor}`}
          >
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{card.label}</p>
              <h4 className="text-2xl font-bold font-heading text-slate-100 mt-1">{card.value}</h4>
            </div>
            <div className={`p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 ${card.color}`}>
              <Icon size={20} />
            </div>
          </div>
        );
      })}
    </div>
  );
};
