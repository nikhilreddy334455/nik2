import React, { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Compass,
  Search,
  PlusCircle,
  HelpCircle,
  Database,
  CheckCircle2,
  Menu,
  X,
  ExternalLink,
  Shield
} from 'lucide-react';
import { seedDatabase } from '../lib/api.js';

export const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedNotification, setSeedNotification] = useState<string | null>(null);
  const location = useLocation();

  const handleQuickSeed = async () => {
    setSeeding(true);
    try {
      const res = await seedDatabase();
      setSeedNotification(`Sample campus items populated! (${res.createdCount} items loaded)`);
      setTimeout(() => {
        setSeedNotification(null);
        window.location.reload();
      }, 1500);
    } catch (err) {
      setSeedNotification('Failed to seed data. Please check backend connection.');
      setTimeout(() => setSeedNotification(null), 3000);
    } finally {
      setSeeding(false);
    }
  };

  const navLinks = [
    { name: 'Dashboard', path: '/' },
    { name: 'Search & Explore', path: '/search', icon: Search },
    { name: 'Report Lost', path: '/report/lost', highlight: 'lost' },
    { name: 'Report Found', path: '/report/found', highlight: 'found' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-sky-500 selection:text-white">
      {/* Toast Notification for Seeding */}
      {seedNotification && (
        <div className="fixed top-20 right-6 z-50 glass-panel border border-emerald-500/40 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-sm text-emerald-300 animate-slide-up">
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{seedNotification}</span>
        </div>
      )}

      {/* Main Header / Navigation */}
      <header className="sticky top-0 z-40 glass-panel border-b border-slate-800/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Campus Logo & Title */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center shadow-glow-primary group-hover:scale-105 transition-transform">
                <Compass size={22} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-extrabold text-lg text-slate-100 tracking-tight">
                    CampusFind<span className="text-sky-400">.AI</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30">
                    <Sparkles size={10} /> Gemini 2.5 Flash
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                  Smart Campus Lost & Found System
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                let activeStyle = 'bg-slate-800/90 text-white font-semibold border-slate-700 shadow-sm';
                let defaultStyle = 'text-slate-300 hover:bg-slate-900 hover:text-white border-transparent';

                if (link.highlight === 'lost') {
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                          : 'text-rose-400 hover:bg-rose-500/10 border-rose-500/20'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                      Report Lost
                    </Link>
                  );
                }

                if (link.highlight === 'found') {
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-all flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                          : 'text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/20'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Report Found
                    </Link>
                  );
                }

                return (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${
                      isActive ? activeStyle : defaultStyle
                    }`}
                  >
                    {link.name}
                  </NavLink>
                );
              })}

              {/* Seed Demo Button */}
              <button
                onClick={handleQuickSeed}
                disabled={seeding}
                title="Populate realistic campus lost & found demo records"
                className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 transition-colors disabled:opacity-50"
              >
                <Database size={13} className={seeding ? 'animate-spin text-sky-400' : 'text-slate-400'} />
                <span>{seeding ? 'Seeding...' : 'Load Demo Data'}</span>
              </button>
            </nav>

            {/* Mobile Hamburger Menu */}
            <div className="flex md:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-300 hover:text-white bg-slate-900 border border-slate-800"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden glass-panel border-b border-slate-800 px-4 pt-2 pb-4 space-y-2 animate-fadeIn">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium ${
                  location.pathname === link.path
                    ? 'bg-sky-600 text-white font-bold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleQuickSeed();
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800 flex items-center gap-2"
            >
              <Database size={16} /> Load Campus Demo Data
            </button>
          </div>
        )}
      </header>

      {/* Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-900 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-sky-600 flex items-center justify-center text-white font-bold text-[10px]">
              CF
            </div>
            <span>CampusFind AI — Powered by Google Gemini 2.5 Flash & PostgreSQL</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5">
              <Shield size={13} className="text-sky-400" /> Strict Server-Side Key Isolation
            </span>
            <span>Multimodal Reasoning Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
