import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Search,
  PlusCircle,
  HelpCircle,
  TrendingUp,
  BrainCircuit,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Item, DashboardStats } from '../lib/types.js';
import { fetchItems, fetchDashboardStats } from '../lib/api.js';
import { StatsOverview } from '../components/StatsOverview.js';
import { ItemCard } from '../components/ItemCard.js';

export const HomePage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [statsData, itemsData] = await Promise.all([
          fetchDashboardStats(),
          fetchItems({ limit: 6 })
        ]);
        setStats(statsData);
        setRecentItems(itemsData.items);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl glass-panel border border-slate-800 p-8 sm:p-12 shadow-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/80">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles size={14} className="animate-spin" />
            <span>Multimodal Gemini 2.5 Flash Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-heading font-extrabold text-slate-100 tracking-tight leading-tight">
            Lost something on campus? <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-purple-400">
              Let AI reconnect you instantly.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
            Submit a photo, description, or location. Our automated multimodal intelligence compares visual features,
            timestamps, and spatial proximity across campus to identify matches with precise confidence scores.
          </p>

          {/* Primary Call To Actions */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              to="/report/lost"
              className="px-6 py-3.5 rounded-xl font-heading font-bold text-white bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 shadow-glow-rose hover:scale-[1.02] transition-all flex items-center gap-2.5 text-sm sm:text-base"
            >
              <span>📍 I Lost Something</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/report/found"
              className="px-6 py-3.5 rounded-xl font-heading font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-glow-emerald hover:scale-[1.02] transition-all flex items-center gap-2.5 text-sm sm:text-base"
            >
              <span>✨ I Found Something</span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/search"
              className="px-5 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all flex items-center gap-2 text-sm sm:text-base"
            >
              <Search size={16} className="text-sky-400" />
              <span>Explore All Reports</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Real-time Campus Metrics */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-heading font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Zap size={16} className="text-sky-400" />
            Live Campus Intelligence Metrics
          </h2>
        </div>
        <StatsOverview stats={stats} loading={loading} />
      </section>

      {/* How It Works 3-Step Banner */}
      <section className="glass-panel rounded-2xl p-6 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold shrink-0">
            1
          </div>
          <div>
            <h3 className="font-heading font-bold text-slate-100 text-sm">Multimodal Ingestion</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Upload photos, exact campus landmarks, and defining marks like scratches or stickers.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold shrink-0">
            2
          </div>
          <div>
            <h3 className="font-heading font-bold text-slate-100 text-sm">Automated AI Matching</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Gemini 2.5 Flash calculates confidence scores (0-100%) and generates plain-English rationale.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shrink-0">
            3
          </div>
          <div>
            <h3 className="font-heading font-bold text-slate-100 text-sm">Instant Resolution</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Connect directly with finders or owners via verified campus contacts and claim items safely.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Feed Section */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-heading font-bold text-slate-100">
              Recent Campus Activity
            </h2>
            <p className="text-sm text-slate-400 mt-0.5">
              Latest items reported lost or turned in across university buildings
            </p>
          </div>

          <Link
            to="/search"
            className="text-sm font-semibold text-sky-400 hover:text-sky-300 flex items-center gap-1.5 transition-colors"
          >
            <span>View All Reports ({stats?.totalItems || 0})</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-72 glass-panel rounded-2xl bg-slate-800/40 animate-pulse" />
            ))}
          </div>
        ) : recentItems.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center border border-slate-800">
            <p className="text-slate-400">No items reported yet. Be the first to submit a report!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
