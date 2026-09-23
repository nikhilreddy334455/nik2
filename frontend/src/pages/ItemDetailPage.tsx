import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Mail,
  Tag,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Share2,
  BrainCircuit,
  Sparkles,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { Item, ItemMatch } from '../lib/types.js';
import { fetchItemMatches, triggerItemMatch, updateItemStatus } from '../lib/api.js';
import { MatchList } from '../components/MatchList.js';
import { MatchScoreBadge } from '../components/MatchScoreBadge.js';

export const ItemDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [item, setItem] = useState<Item | null>(null);
  const [matches, setMatches] = useState<ItemMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTriggering, setIsTriggering] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadItemAndMatches = async (itemId: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchItemMatches(itemId);
      setItem(data.item);
      setMatches(data.matches);
    } catch (err: any) {
      console.error('Failed to load item matches:', err);
      setError(err.response?.data?.error || 'Item not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadItemAndMatches(id);
    }
  }, [id]);

  const handleManualTrigger = async () => {
    if (!id) return;
    try {
      setIsTriggering(true);
      const res = await triggerItemMatch(id);
      setMatches(res.matches);
      setStatusMessage(`AI analysis complete! Found ${res.matches.length} candidates.`);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      console.error('Failed to trigger AI matching:', err);
      setStatusMessage('Error executing AI match algorithm.');
      setTimeout(() => setStatusMessage(null), 3000);
    } finally {
      setIsTriggering(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!item) return;
    try {
      setIsUpdatingStatus(true);
      const nextStatus = item.status === 'active' ? 'resolved' : 'active';
      const updated = await updateItemStatus(item.id, nextStatus);
      setItem(updated);
      setStatusMessage(`Item marked as ${nextStatus.toUpperCase()}!`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error('Failed to toggle status:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 space-y-8 animate-pulse">
        <div className="h-6 w-32 bg-slate-800 rounded-lg" />
        <div className="h-96 glass-panel rounded-3xl bg-slate-800/50" />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-400">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-heading font-bold text-slate-100">Item Not Found</h2>
        <p className="text-sm text-slate-400">{error || 'The requested item could not be retrieved.'}</p>
        <Link
          to="/search"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition-colors"
        >
          <ArrowLeft size={16} /> Return to Search Feed
        </Link>
      </div>
    );
  }

  const isLost = item.report_type === 'lost';
  const isResolved = item.status === 'resolved';

  const formattedEventTime = new Date(item.event_time).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const formattedCreatedTime = new Date(item.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Toast feedback */}
      {statusMessage && (
        <div className="fixed top-20 right-6 z-50 glass-panel border border-sky-500/40 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm text-sky-300 animate-slide-up">
          <Sparkles size={18} className="text-sky-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/search"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Directory
        </Link>

        {/* Status Toggle & Share */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleStatusToggle}
            disabled={isUpdatingStatus}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              isResolved
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 size={14} className={isResolved ? 'text-emerald-400' : 'text-slate-400'} />
            <span>{isResolved ? 'Status: Resolved (Reopen)' : 'Mark as Claimed / Resolved'}</span>
          </button>
        </div>
      </div>

      {/* Primary Item Overview Card */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-12">
        {/* Left: Image Canvas */}
        <div className="lg:col-span-5 relative bg-slate-950 aspect-[4/3] lg:aspect-auto min-h-[300px] overflow-hidden flex items-center justify-center">
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent lg:hidden" />

          {/* Badge over image */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md border ${
                isLost
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}
            >
              {isLost ? '📍 Lost Item' : '✨ Found Item'}
            </span>
            {isResolved && (
              <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                Resolved
              </span>
            )}
          </div>
        </div>

        {/* Right: Item Metadata & Details */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category tag & Report Time */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 text-sky-300 font-medium border border-slate-700">
                <Tag size={12} /> {item.category}
              </span>
              <span>Reported on {formattedCreatedTime}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-100">
              {item.title}
            </h1>

            {/* Description */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Description & Distinguishing Characteristics
              </p>
              <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </div>

            {/* Location & Time Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5">
                <MapPin size={16} className="text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wider block text-[10px]">
                    Campus Location
                  </span>
                  <span className="text-slate-200 font-medium text-sm">{item.location}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-2.5">
                <Clock size={16} className="text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-400 uppercase tracking-wider block text-[10px]">
                    Event Time
                  </span>
                  <span className="text-slate-200 font-medium text-sm">{formattedEventTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Box */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-400" />
                Reporter Campus Contact
              </span>
              <p className="text-sm font-bold text-slate-100 mt-0.5">{item.contact_info}</p>
            </div>

            <a
              href={`mailto:${item.contact_info}?subject=Regarding your ${item.report_type} report on CampusFind AI: ${item.title}`}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Mail size={14} />
              <span>Contact Directly</span>
            </a>
          </div>
        </div>
      </div>

      {/* AI Matches Section */}
      <section className="pt-4">
        <MatchList
          sourceItem={item}
          matches={matches}
          onTriggerMatch={handleManualTrigger}
          isTriggering={isTriggering}
        />
      </section>
    </div>
  );
};
