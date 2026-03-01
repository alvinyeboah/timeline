'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useProfileStore } from '@/store/profile';
import { ArrowLeftIcon } from '@/components/ui/icons';

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

const inputClass =
  'w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#00C896]/50 transition-colors placeholder:text-[#4B5563]';

const labelClass = 'block text-xs text-[#9CA3AF] uppercase tracking-widest mb-1.5';

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

  const handleChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'agreedToTerms' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Persist name/contact into profile store (income/province set in onboarding step 4)
    patchProfile({ fullName: form.fullName, phone: form.phone, email: form.email });

    // Brief pause to let the loading state register visually
    await new Promise((resolve) => setTimeout(resolve, 600));
    router.push('/onboarding?step=2');
  };

  const textFields: Array<{
    key: keyof Omit<FormData, 'agreedToTerms'>;
    type: string;
    autoComplete: string;
  }> = [
    { key: 'fullName', type: 'text', autoComplete: 'name' },
    { key: 'phone', type: 'tel', autoComplete: 'tel' },
    { key: 'email', type: 'email', autoComplete: 'email' },
    { key: 'address', type: 'text', autoComplete: 'street-address' },
  ];

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-6 py-14">
      {/* Subtle background glow */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-[#00C896]/4 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Back button */}
        <motion.button
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-[#9CA3AF] hover:text-white hover:border-[#3A3A3A] active:scale-95 transition-all mb-8"
          aria-label="Go back"
        >
          <ArrowLeftIcon size={15} strokeWidth={2} />
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2 leading-tight">
            Create your account
          </h1>
          <p className="text-[#9CA3AF] text-sm leading-relaxed">
            Takes 30 seconds. Already pre-filled for you.
          </p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-3">
            {textFields.map(({ key, type, autoComplete }, index) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  ease: 'easeOut',
                  delay: 0.05 * index,
                }}
              >
                <label htmlFor={key} className={labelClass}>
                  {FIELD_LABELS[key]}
                </label>
                <input
                  id={key}
                  type={type}
                  autoComplete={autoComplete}
                  value={form[key] as string}
                  onChange={handleChange(key)}
                  className={inputClass}
                  required
                />
              </motion.div>
            ))}

            {/* Terms checkbox */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                ease: 'easeOut',
                delay: 0.05 * textFields.length,
              }}
              className="pt-1"
            >
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5 shrink-0">
                  <input
                    id="agreedToTerms"
                    type="checkbox"
                    checked={form.agreedToTerms}
                    onChange={handleChange('agreedToTerms')}
                    className="sr-only peer"
                    required
                  />
                  {/* Custom checkbox */}
                  <div className="w-5 h-5 rounded-md border border-[#2A2A2A] bg-[#1A1A1A] peer-checked:bg-[#00C896] peer-checked:border-[#00C896] transition-all flex items-center justify-center">
                    {form.agreedToTerms && (
                      <svg
                        width="11"
                        height="9"
                        viewBox="0 0 11 9"
                        fill="none"
                        className="text-[#0D0D0D]"
                      >
                        <path
                          d="M1 4.5L4 7.5L10 1"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-sm text-[#9CA3AF] leading-snug group-hover:text-white transition-colors">
                  I agree to the{' '}
                  <span className="text-[#00C896] underline underline-offset-2">
                    Terms of Service
                  </span>{' '}
                  and{' '}
                  <span className="text-[#00C896] underline underline-offset-2">
                    Privacy Policy
                  </span>
                </span>
              </label>
            </motion.div>
          </div>

          {/* Submit CTA */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              ease: 'easeOut',
              delay: 0.05 * (textFields.length + 1),
            }}
            className="mt-8"
          >
            <button
              type="submit"
              disabled={loading || !form.agreedToTerms}
              className="w-full py-4 bg-[#00C896] text-[#0D0D0D] font-semibold rounded-2xl text-base hover:bg-[#00B386] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span
                    className="w-4 h-4 border-2 border-[#0D0D0D]/30 border-t-[#0D0D0D] rounded-full animate-spin"
                    aria-hidden="true"
                  />
                  <span>Setting up...</span>
                </>
              ) : (
                'Get Started →'
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
