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
    <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg">
        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
          className="text-center mb-10"
        >
          <span className="text-stone-900 font-bold text-xl tracking-tight">Timeline</span>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEPS.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 ${i === 0 ? 'text-stone-900' : 'text-stone-300'}`}>
                <div className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${i === 0 ? 'bg-stone-900 text-white' : 'border border-stone-200 text-stone-300'}`}>
                  {i + 1}
                </div>
                <span className="text-xs font-medium">{step}</span>
              </div>
              {i < STEPS.length - 1 && <div className="w-8 h-px bg-stone-200" />}
            </div>
          ))}
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}
          className="bg-white rounded-3xl border border-stone-200 shadow-sm px-10 py-10"
        >
          {/* Demo badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#00C896]/8 border border-[#00C896]/20 rounded-full mb-7">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00C896]" />
            <span className="text-[#00C896] text-xs font-medium">Demo account pre-filled for you</span>
          </div>

          <h1 className="text-3xl font-bold text-stone-900 mb-2 leading-tight">Create your account</h1>
          <p className="text-stone-400 text-sm mb-8">Takes 30 seconds. Everything&apos;s already filled in.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-4">
              {textFields.map(({ key, type, autoComplete }, index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut', delay: 0.04 * index }}
                >
                  <label htmlFor={key} className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">
                    {FIELD_LABELS[key]}
                  </label>
                  <input
                    id={key}
                    type={type}
                    autoComplete={autoComplete}
                    value={form[key] as string}
                    onChange={handleChange(key)}
                    className="w-full bg-[#F5F4F0] border border-stone-200 text-stone-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C896]/25 focus:border-[#00C896]/50 transition placeholder:text-stone-300"
                    required
                  />
                </motion.div>
              ))}

              {/* Terms */}
              <motion.label
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut', delay: 0.04 * textFields.length }}
                className="flex items-start gap-3 cursor-pointer pt-1"
              >
                <div className="relative mt-0.5 shrink-0">
                  <input type="checkbox" checked={form.agreedToTerms} onChange={handleChange('agreedToTerms')} className="sr-only peer" required />
                  <div className="w-5 h-5 rounded-md border border-stone-300 bg-white peer-checked:bg-[#00C896] peer-checked:border-[#00C896] transition-all flex items-center justify-center">
                    {form.agreedToTerms && (
                      <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                        <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-stone-400 leading-snug">
                  I agree to the <span className="text-[#00C896] underline underline-offset-2">Terms of Service</span> and <span className="text-[#00C896] underline underline-offset-2">Privacy Policy</span>
                </span>
              </motion.label>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut', delay: 0.04 * (textFields.length + 1) }}
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
                ) : 'Get Started →'}
              </button>
            </motion.div>
          </form>
        </motion.div>

        <p className="text-stone-300 text-xs text-center mt-6">Demo · Sarah Chen · Toronto, ON</p>
      </div>
    </div>
  );
}
