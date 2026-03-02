'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useProfileStore } from '@/store/profile';

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  agreedToTerms: boolean;
}

const FIELD_LABELS: Record<keyof Omit<FormData, 'agreedToTerms'>, string> = {
  fullName: 'Full Name',
  phone: 'Phone Number',
  email: 'Email Address',
  address: 'Home Address',
};

const STEPS = ['Account', 'Profile', 'Goals'];

export default function SignupPage() {
  const router = useRouter();
  const patchProfile = useProfileStore((s) => s.patchProfile);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<FormData>({
    fullName: 'Sarah Chen',
    phone: '+1 (416) 555-0142',
    email: 'sarah.chen@email.com',
    address: '42 King Street West, Toronto, ON',
    agreedToTerms: true,
  });

  const handleChange = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'agreedToTerms' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    patchProfile({ fullName: form.fullName, phone: form.phone, email: form.email });
    await new Promise((resolve) => setTimeout(resolve, 600));
    router.push('/onboarding?step=2');
  };

  const textFields: Array<{ key: keyof Omit<FormData, 'agreedToTerms'>; type: string; autoComplete: string }> = [
    { key: 'fullName', type: 'text', autoComplete: 'name' },
    { key: 'phone', type: 'tel', autoComplete: 'tel' },
    { key: 'email', type: 'email', autoComplete: 'email' },
    { key: 'address', type: 'text', autoComplete: 'street-address' },
  ];

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* ── Left: brand panel ────────────────────────────────────────────────── */}
      <div className="w-1/2 bg-[#111] flex flex-col justify-between px-16 py-14 relative overflow-hidden">
        {/* Accent lines */}
        <div className="absolute top-0 left-16 w-px h-32 bg-[#00C896]/40" />
        <div className="absolute bottom-0 right-24 w-px h-48 bg-[#00C896]/20" />
        <div className="absolute top-1/2 -right-8 w-48 h-px bg-[#00C896]/10" />

        {/* Wordmark */}
        <div>
          <span className="text-white font-bold text-lg tracking-tight">Timeline</span>
        </div>

        {/* Main copy */}
        <div>
          <p className="text-[#00C896] text-xs font-semibold uppercase tracking-widest mb-4">Financial Planning</p>
          <h2 className="text-4xl font-bold text-white leading-tight mb-6">
            Your future,<br />mapped out.
          </h2>
          <p className="text-[#6B7280] text-lg leading-relaxed mb-10">
            Timeline connects your finances to your goals — and shows you exactly what it takes to get there.
          </p>

          <div className="space-y-5">
            {[
              { title: 'See every goal on one timeline', desc: 'From emergency fund to retirement — all in one view.' },
              { title: 'Drag to explore tradeoffs', desc: 'Move goals forward or back and watch your net worth update.' },
              { title: 'Know when to talk to an advisor', desc: 'We flag when professional guidance makes the most impact.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00C896] mt-2 shrink-0" />
                <div>
                  <p className="text-white font-medium text-sm">{item.title}</p>
                  <p className="text-[#6B7280] text-sm mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-[#2A2A2A] text-xs">Demo account · Sarah Chen</p>
      </div>

      {/* ── Right: form panel ────────────────────────────────────────────────── */}
      <div className="w-1/2 bg-white flex flex-col justify-center px-16 py-14">
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 ${i === 0 ? 'text-stone-900' : 'text-stone-300'}`}>
                <div className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${i === 0 ? 'bg-stone-900 text-white' : 'border border-stone-200 text-stone-400'}`}>
                  {i + 1}
                </div>
                <span className="text-xs font-medium">{step}</span>
              </div>
              {i < STEPS.length - 1 && <div className="w-6 h-px bg-stone-200" />}
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#00C896]/10 border border-[#00C896]/20 rounded-full mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00C896]" />
            <span className="text-[#00C896] text-xs font-medium">Demo account pre-filled for you</span>
          </div>

          <h1 className="text-3xl font-bold text-stone-900 mb-2 leading-tight">Create your account</h1>
          <p className="text-stone-500 text-sm mb-8">Takes 30 seconds. Everything's already filled in.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-4">
              {textFields.map(({ key, type, autoComplete }, index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut', delay: 0.04 * index }}
                >
                  <label htmlFor={key} className="block text-xs font-semibold text-stone-500 uppercase tracking-widest mb-1.5">
                    {FIELD_LABELS[key]}
                  </label>
                  <input
                    id={key}
                    type={type}
                    autoComplete={autoComplete}
                    value={form[key] as string}
                    onChange={handleChange(key)}
                    className="w-full bg-white border border-stone-200 text-stone-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896]/50 transition placeholder:text-stone-300"
                    required
                  />
                </motion.div>
              ))}

              {/* Terms */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut', delay: 0.04 * textFields.length }}
                className="pt-1"
              >
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5 shrink-0">
                    <input
                      type="checkbox"
                      checked={form.agreedToTerms}
                      onChange={handleChange('agreedToTerms')}
                      className="sr-only peer"
                      required
                    />
                    <div className="w-5 h-5 rounded-md border border-stone-300 bg-white peer-checked:bg-[#00C896] peer-checked:border-[#00C896] transition-all flex items-center justify-center">
                      {form.agreedToTerms && (
                        <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                          <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-stone-500 leading-snug">
                    I agree to the{' '}
                    <span className="text-[#00C896] underline underline-offset-2">Terms of Service</span>{' '}
                    and{' '}
                    <span className="text-[#00C896] underline underline-offset-2">Privacy Policy</span>
                  </span>
                </label>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut', delay: 0.04 * (textFields.length + 1) }}
              className="mt-8"
            >
              <button
                type="submit"
                disabled={loading || !form.agreedToTerms}
                className="w-full py-3.5 bg-stone-900 text-white font-semibold rounded-xl text-base hover:bg-stone-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Setting up…
                  </>
                ) : (
                  'Get Started →'
                )}
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
