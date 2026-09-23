import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  MapPin,
  Clock,
  Mail,
  ExternalLink,
  BrainCircuit,
  Tag,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import { Item, ItemMatch } from '../lib/types.js';
import { MatchScoreBadge } from './MatchScoreBadge.js';

interface MatchListProps {
  sourceItem: Item;
  matches: ItemMatch[];
  onTriggerMatch: () => void;
  isTriggering: boolean;
}

export const MatchList: React.FC<MatchListProps> = ({
  sourceItem,
  matches,
  onTriggerMatch,
  isTriggering
}) => {
  return (
    <div className="space-y-6">
      {/* Header bar with trigger AI button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-slate-100 flex items-center gap-2">
              <Sparkles className="text-sky-400" size={24} />
              AI-Generated Potential Matches
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              {matches.length} Candidates
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gemini 2.5 Flash multimodal reasoning analyzed visual attributes, timing, and campus proximity.
          </p>
        </div>

        <button
          onClick={onTriggerMatch}
          disabled={isTriggering}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-sky-500/50 transition-all shadow-md shrink-0 disabled:opacity-60"
        >
          <BrainCircuit size={16} className={isTriggering ? 'animate-spin text-sky-400' : 'text-sky-400'} />
          <span>{isTriggering ? 'Running Gemini Analysis...' : 'Re-run AI Matching'}</span>
        </button>
      </div>

      {/* No matches state */}
      {matches.length === 0 ? (
        <div className="glass-panel rounded-2xl p-10 text-center border border-slate-800">
          <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto mb-4 text-slate-400">
            <Sparkles size={28} className="text-sky-400" />
          </div>
          <h3 className="text-lg font-heading font-bold text-slate-200">No Potential Matches Yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
            The AI engine hasn't identified candidates with high feature correlation in the opposite database yet.
            As new items are submitted, matching runs automatically.
          </p>
          <div className="mt-6">
            <button
              onClick={onTriggerMatch}
              disabled={isTriggering}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-all shadow-lg"
            >
              Scan Database Now
            </button>
          </div>
        </div>
      ) : (
        /* Match Cards Feed */
        <div className="space-y-5">
          {matches.map((match, idx) => {
            const matched = match.matched_item;
            if (!matched) return null;

            const formattedTime = new Date(matched.event_time).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });

            return (
              <div
                key={match.id || idx}
                className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-sky-500/40 transition-all duration-300 shadow-lg space-y-4"
              >
                {/* Match Top Bar: Score Badge & Rank */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400">#{idx + 1} Candidate</span>
                    <MatchScoreBadge score={match.confidence_score} size="md" />
                  </div>
                  <Link
                    to={`/item/${matched.id}`}
                    className="text-xs font-semibold text-sky-400 hover:text-sky-300 inline-flex items-center gap-1 group"
                  >
                    View Matched Item Details <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>

                {/* AI Reasoning Box */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-sky-500/20 shadow-inner space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
                    <BrainCircuit size={14} />
                    <span>Gemini AI Multimodal Reasoning</span>
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed italic">
                    "{match.explanation}"
                  </p>
                </div>

                {/* Matched Item Comparative Data Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-1">
                  {/* Thumbnail */}
                  <div className="md:col-span-3 aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative group">
                    <img
                      src={matched.image_url}
                      alt={matched.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute top-2 left-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          matched.report_type === 'lost'
                            ? 'bg-rose-500/80 text-white'
                            : 'bg-emerald-500/80 text-white'
                        }`}
                      >
                        {matched.report_type}
                      </span>
                    </div>
                  </div>

                  {/* Details Summary */}
                  <div className="md:col-span-6 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {matched.category}
                      </span>
                    </div>
                    <h4 className="font-heading font-bold text-base text-slate-100">
                      {matched.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2">
                      {matched.description}
                    </p>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                      <div className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-500" />
                        <span>{matched.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={12} className="text-slate-500" />
                        <span>{formattedTime}</span>
                      </div>
                    </div>
                  </div>

                  {/* Contact Action */}
                  <div className="md:col-span-3 flex flex-col justify-center gap-2 bg-slate-900/40 p-3 rounded-xl border border-slate-800/80">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck size={13} className="text-emerald-400" />
                      Finder / Reporter Contact:
                    </div>
                    <a
                      href={`mailto:${matched.contact_info}?subject=Inquiry regarding campus ${matched.report_type} item: ${matched.title}&body=Hello, I noticed our items matched on CampusFind AI.`}
                      className="text-xs font-medium text-sky-300 hover:text-sky-200 bg-sky-950/40 hover:bg-sky-900/50 border border-sky-800/50 rounded-lg p-2 flex items-center justify-between transition-colors truncate"
                    >
                      <span className="truncate">{matched.contact_info}</span>
                      <Mail size={13} className="shrink-0 ml-1 text-sky-400" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
