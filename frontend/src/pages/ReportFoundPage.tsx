import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, HeartHandshake } from 'lucide-react';
import { ReportForm } from '../components/ReportForm.js';

export const ReportFoundPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/20">
        <div className="flex items-center gap-3 mb-2">
          <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-lg">
            ✨
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Found Item Registration
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-100">
          Turn In or Report a Found Item
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
          Thank you for helping keep our campus honest and connected. Submit details and a photo so our AI
          can automatically notify the searching student.
        </p>
      </div>

      {/* Form Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <ReportForm initialReportType="found" />
      </div>
    </div>
  );
};
