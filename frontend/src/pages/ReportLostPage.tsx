import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, ShieldAlert, CheckCircle } from 'lucide-react';
import { ReportForm } from '../components/ReportForm.js';

export const ReportLostPage: React.FC = () => {
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
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-rose-500/20 bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/20">
        <div className="flex items-center gap-3 mb-2">
          <span className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 text-lg">
            📍
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
            Lost Item Registration
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-100">
          Report a Missing or Lost Possession
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-2xl leading-relaxed">
          Provide as much distinct visual and contextual information as possible. The multimodal Gemini AI
          engine immediately checks your report against all items turned in across campus.
        </p>
      </div>

      {/* Form Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <ReportForm initialReportType="lost" />
      </div>
    </div>
  );
};
