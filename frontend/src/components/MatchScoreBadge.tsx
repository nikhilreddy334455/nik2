import React from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

interface MatchScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const MatchScoreBadge: React.FC<MatchScoreBadgeProps> = ({
  score,
  size = 'md',
  showLabel = true
}) => {
  // Score tiers:
  // > 80: High confidence (Green / Emerald)
  // 50 - 80: Moderate confidence (Amber / Yellow)
  // < 50: Low confidence (Slate / Gray)
  let badgeColor = '';
  let labelText = '';
  let Icon = HelpCircle;

  if (score >= 80) {
    badgeColor = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-glow-emerald';
    labelText = 'Strong Match';
    Icon = CheckCircle2;
  } else if (score >= 50) {
    badgeColor = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    labelText = 'Moderate Match';
    Icon = AlertTriangle;
  } else {
    badgeColor = 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    labelText = 'Possible Match';
    Icon = Sparkles;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3.5 py-1.5 gap-2 font-semibold'
  };

  const iconSizes = {
    sm: 13,
    md: 15,
    lg: 18
  };

  return (
    <div
      className={`inline-flex items-center rounded-full border backdrop-blur-md font-medium transition-all ${badgeColor} ${sizeClasses[size]}`}
    >
      <Icon size={iconSizes[size]} className="shrink-0" />
      <span className="font-bold">{score}%</span>
      {showLabel && <span className="opacity-90 font-normal">· {labelText}</span>}
    </div>
  );
};
