import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Tag, ArrowRight, Sparkles, CheckCircle } from 'lucide-react';
import { Item } from '../lib/types.js';

interface ItemCardProps {
  item: Item;
  matchScore?: number;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, matchScore }) => {
  const isLost = item.report_type === 'lost';
  const isResolved = item.status === 'resolved';

  const formattedDate = new Date(item.event_time).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Link
      to={`/item/${item.id}`}
      className="group flex flex-col rounded-2xl glass-card overflow-hidden transition-all duration-300 hover:shadow-glow-primary border border-slate-800 hover:border-sky-500/40 relative"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900/80">
        <img
          src={item.image_url}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // Fallback placeholder image if URL fails to load
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

        {/* Report Type Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase shadow-lg backdrop-blur-md border ${
              isLost
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {isLost ? '📍 Lost' : '✨ Found'}
          </span>

          {isResolved && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1">
              <CheckCircle size={12} /> Resolved
            </span>
          )}
        </div>

        {/* Optional AI Match Badge */}
        {typeof matchScore === 'number' && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-sky-600/90 text-white shadow-lg flex items-center gap-1">
              <Sparkles size={12} /> {matchScore}% AI Match
            </span>
          </div>
        )}

        {/* Category Pill */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900/80 text-slate-300 backdrop-blur-md border border-slate-700/60">
            <Tag size={12} className="text-sky-400" />
            {item.category}
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-heading font-semibold text-lg text-slate-100 line-clamp-1 group-hover:text-sky-400 transition-colors">
            {item.title}
          </h3>
          <p className="mt-1 text-sm text-slate-400 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col gap-1.5 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin size={13} className="text-slate-500 shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="text-slate-500 shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <span className="text-sky-400 font-medium flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Details <ArrowRight size={13} />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};
