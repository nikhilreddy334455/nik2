import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Image as ImageIcon,
  MapPin,
  Clock,
  Mail,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Wand2
} from 'lucide-react';
import { TARGET_CATEGORIES, ReportType } from '../lib/types.js';
import { createItem } from '../lib/api.js';

const formSchema = z.object({
  report_type: z.enum(['lost', 'found']),
  category: z.string().min(1, 'Category is required'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z
    .string()
    .min(10, 'Please provide a detailed description (at least 10 characters)')
    .max(1000, 'Description cannot exceed 1000 characters'),
  image_url: z.string().url('Please provide a valid image URL (https://...)'),
  location: z.string().min(2, 'Location is required (min 2 characters)').max(150),
  event_time: z.string().min(1, 'Event date and time is required'),
  contact_info: z.string().min(3, 'Valid contact info (email/phone) is required')
});

type FormValues = z.infer<typeof formSchema>;

interface ReportFormProps {
  initialReportType: ReportType;
}

// Preset examples for quick demo testing
const DEMO_PRESETS = [
  {
    label: '💧 Hydro Flask Bottle',
    category: 'Miscellaneous',
    title: 'Cobalt Blue Hydro Flask 32oz',
    description: 'Dark blue wide-mouth Hydro Flask with a black straw lid. Has a distinct dent on the lower base rim and campus sticker.',
    image_url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80',
    location: 'Main University Library, 3rd Floor Study Lounge',
    contact_info: 'student@university.edu'
  },
  {
    label: '🎧 AirPods Pro 2',
    category: 'Electronics',
    title: 'AirPods Pro 2 in Matte Black Protective Case',
    description: 'Apple AirPods Pro 2nd Gen inside a rugged Spigen black clip case with a mini carabiner. Small scuff on left earbud.',
    image_url: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?auto=format&fit=crop&w=800&q=80',
    location: 'Student Union Cafeteria, Booth 4',
    contact_info: 'alex.campus@university.edu'
  },
  {
    label: '💳 Brown Leather Wallet',
    category: 'IDs & Wallets',
    title: 'Brown Bifold Leather Wallet with Student ID',
    description: 'Distressed brown leather wallet containing university ID card, metro card, and driver license.',
    image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=800&q=80',
    location: 'Engineering Sciences Hall, Lecture Room 101',
    contact_info: 'sarah.j@university.edu'
  },
  {
    label: '🧥 North Face Jacket',
    category: 'Clothing',
    title: 'Black The North Face Puffer Jacket (Size M)',
    description: 'Men medium classic nuptse down black puffer. Red fleece neck warmer left inside the left zip pocket.',
    image_url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
    location: 'Campus Recreation Center Basketball Courts',
    contact_info: 'david.kim@university.edu'
  }
];

export const ReportForm: React.FC<ReportFormProps> = ({ initialReportType }) => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Default to current local datetime formatted for input type="datetime-local"
  const defaultDateTime = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      report_type: initialReportType,
      category: 'Electronics',
      title: '',
      description: '',
      image_url: '',
      location: '',
      event_time: defaultDateTime,
      contact_info: ''
    }
  });

  const watchReportType = watch('report_type');
  const watchImageUrl = watch('image_url');
  const isLost = watchReportType === 'lost';

  const applyPreset = (preset: typeof DEMO_PRESETS[0]) => {
    setValue('category', preset.category);
    setValue('title', preset.title);
    setValue('description', preset.description);
    setValue('image_url', preset.image_url);
    setValue('location', preset.location);
    setValue('contact_info', preset.contact_info);
  };

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Ensure date is valid ISO string
      const isoDate = new Date(data.event_time).toISOString();
      const created = await createItem({
        ...data,
        event_time: isoDate
      });

      // Redirect immediately to the newly created item's match dashboard
      navigate(`/item/${created.id}`);
    } catch (err: any) {
      console.error('Submission error:', err);
      setSubmitError(err.response?.data?.error || 'Failed to submit report. Please check your inputs and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Demo Quick Fill Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-sky-500/20 bg-sky-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-sky-400">
          <Wand2 size={16} />
          <span>Quick Demo Presets:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {DEMO_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyPreset(preset)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-sky-400/50 px-2.5 py-1.5 rounded-lg transition-all"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {submitError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-start gap-3">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Submission Failed</p>
            <p className="text-xs mt-0.5">{submitError}</p>
          </div>
        </div>
      )}

      {/* 1. Report Type Selector */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-200">
          Report Classification <span className="text-rose-400">*</span>
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label
            className={`flex items-center justify-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              isLost
                ? 'bg-rose-500/15 border-rose-500 text-rose-300 font-bold shadow-glow-rose'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <input type="radio" value="lost" {...register('report_type')} className="sr-only" />
            <span className="text-xl">📍</span>
            <div>
              <div className="text-sm">I Lost an Item</div>
              <div className="text-xs font-normal opacity-80">Looking for my possession</div>
            </div>
          </label>

          <label
            className={`flex items-center justify-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
              !isLost
                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold shadow-glow-emerald'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <input type="radio" value="found" {...register('report_type')} className="sr-only" />
            <span className="text-xl">✨</span>
            <div>
              <div className="text-sm">I Found an Item</div>
              <div className="text-xs font-normal opacity-80">Ready to return to owner</div>
            </div>
          </label>
        </div>
      </div>

      {/* 2. Category & Title Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Target Category <span className="text-rose-400">*</span>
          </label>
          <select
            id="category"
            {...register('category')}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {TARGET_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-xs text-rose-400">{errors.category.message}</p>}
        </div>

        {/* Title */}
        <div className="md:col-span-2">
          <label htmlFor="title" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Item Name / Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            id="title"
            placeholder="e.g. Cobalt Blue Hydro Flask 32oz or AirPods Pro with black case"
            {...register('title')}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          {errors.title && <p className="mt-1 text-xs text-rose-400">{errors.title.message}</p>}
        </div>
      </div>

      {/* 3. Description */}
      <div>
        <label htmlFor="description" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Detailed Description & Unique Marks <span className="text-rose-400">*</span>
        </label>
        <textarea
          id="description"
          rows={3}
          placeholder="Describe physical characteristics, scratches, engravings, brand names, stickers, contents, or case color. (Gemini AI utilizes this for precision matching)"
          {...register('description')}
          className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
        {errors.description && <p className="mt-1 text-xs text-rose-400">{errors.description.message}</p>}
      </div>

      {/* 4. Multimodal Image URL with Instant Preview */}
      <div>
        <label htmlFor="image_url" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>
            Item Photo Image URL (Multimodal AI Input) <span className="text-rose-400">*</span>
          </span>
          <span className="text-[11px] font-normal text-sky-400 lowercase">Supports Unsplash / Direct Image URLs</span>
        </label>
        <div className="relative">
          <ImageIcon className="absolute left-4 top-3.5 text-slate-500" size={18} />
          <input
            type="url"
            id="image_url"
            placeholder="https://images.unsplash.com/photo-..."
            {...register('image_url')}
            className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        {errors.image_url && <p className="mt-1 text-xs text-rose-400">{errors.image_url.message}</p>}

        {/* Visual Preview Box */}
        {watchImageUrl && (
          <div className="mt-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center gap-4">
            <img
              src={watchImageUrl}
              alt="Preview"
              className="w-16 h-16 rounded-lg object-cover border border-slate-700 bg-slate-800"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className="text-xs text-slate-400">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 size={13} /> Photo URL active
              </span>
              <p className="mt-0.5 text-slate-500 truncate max-w-sm">{watchImageUrl}</p>
            </div>
          </div>
        )}
      </div>

      {/* 5. Location, Date/Time, and Contact Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Campus Location <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
            <input
              type="text"
              id="location"
              placeholder="e.g. Science Library 2nd Fl"
              {...register('location')}
              className="w-full pl-10 pr-3 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          {errors.location && <p className="mt-1 text-xs text-rose-400">{errors.location.message}</p>}
        </div>

        {/* Date & Time */}
        <div>
          <label htmlFor="event_time" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Date & Approximate Time <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <Clock className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
            <input
              type="datetime-local"
              id="event_time"
              {...register('event_time')}
              className="w-full pl-10 pr-3 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          {errors.event_time && <p className="mt-1 text-xs text-rose-400">{errors.event_time.message}</p>}
        </div>

        {/* Contact Info */}
        <div>
          <label htmlFor="contact_info" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Contact Email / Phone <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 text-slate-500" size={16} />
            <input
              type="text"
              id="contact_info"
              placeholder="student@university.edu"
              {...register('contact_info')}
              className="w-full pl-10 pr-3 py-3 bg-slate-900 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          {errors.contact_info && <p className="mt-1 text-xs text-rose-400">{errors.contact_info.message}</p>}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={submitting}
          className={`w-full py-4 px-6 rounded-xl font-heading font-bold text-white text-base shadow-xl flex items-center justify-center gap-3 transition-all duration-300 ${
            isLost
              ? 'bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 shadow-glow-rose'
              : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-glow-emerald'
          } ${submitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.01]'}`}
        >
          {submitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Saving & Triggering AI Matching Engine...</span>
            </>
          ) : (
            <>
              <Sparkles size={20} />
              <span>Submit {isLost ? 'Lost Item Report' : 'Found Item Report'} & Analyze Matches</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
