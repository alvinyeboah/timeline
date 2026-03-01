'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ACCOUNTS } from '@/lib/mock-data';
import { Account } from '@/lib/types';
import AccountCard from '@/components/accounts/AccountCard';
import { ArrowLeftIcon, PlusIcon, XIcon } from '@/components/ui/icons';

// ─── Types ────────────────────────────────────────────────────────────────────

type AccountType = 'invest' | 'chequing' | 'pension';

interface ExtraAccount extends Omit<Account, 'institution' | 'type'> {
  institution: string;
  type: AccountType | Account['type'];
}

interface AddAccountForm {
  institution: string;
  accountType: string;
  balance: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LS_KEY = 'timeline_extra_accounts';

const NET_WORTH = 53500;
const BASE_ACCOUNT_COUNT = 3;

const ACCOUNT_TYPE_OPTIONS: Array<{ label: string; value: AccountType }> = [
  { label: 'Savings / Investment', value: 'invest' },
  { label: 'Chequing / Spending', value: 'chequing' },
  { label: 'Pension / Work', value: 'pension' },
];

const TYPE_MAP: Record<string, AccountType> = {
  'Savings / Investment': 'invest',
  'Chequing / Spending': 'chequing',
  'Pension / Work': 'pension',
};

const inputClass =
  'w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#00C896]/50 transition-colors placeholder:text-[#4B5563] text-sm';

const selectClass =
  'w-full bg-[#1A1A1A] border border-[#2A2A2A] text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#00C896]/50 transition-colors text-sm appearance-none cursor-pointer';

// ─── Helper: load extra accounts from localStorage ────────────────────────────

function loadExtraAccounts(): ExtraAccount[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AccountsPage() {
  const router = useRouter();

  const [extraAccounts, setExtraAccounts] = useState<ExtraAccount[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<AddAccountForm>({
    institution: '',
    accountType: 'Savings / Investment',
    balance: '',
  });
  const [addLoading, setAddLoading] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  // Hydrate from localStorage after mount
  useEffect(() => {
    setExtraAccounts(loadExtraAccounts());
  }, []);

  // Scroll form into view when it opens
  useEffect(() => {
    if (showAddForm && formRef.current) {
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 150);
    }
  }, [showAddForm]);

  const totalAccountCount = BASE_ACCOUNT_COUNT + extraAccounts.length;

  const handleAddFormChange = (field: keyof AddAccountForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setAddForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleConnectAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.institution.trim()) return;

    setAddLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    const rawBalance = parseFloat(addForm.balance.replace(/[^0-9.]/g, '')) || 0;
    const resolvedType = TYPE_MAP[addForm.accountType] ?? 'invest';

    const newAccount: ExtraAccount = {
      id: Math.random().toString(36).slice(2, 10),
      institution: addForm.institution.trim(),
      type: resolvedType,
      name: `${addForm.institution.trim()} ${
        ACCOUNT_TYPE_OPTIONS.find((o) => o.value === resolvedType)?.label.split(' / ')[0] ?? 'Account'
      }`,
      balance: rawBalance,
      connected: true,
    };

    const updated = [...extraAccounts, newAccount];
    setExtraAccounts(updated);

    try {
      localStorage.setItem(LS_KEY, JSON.stringify(updated));
    } catch {
      // Fail silently if localStorage is unavailable
    }

    setAddForm({ institution: '', accountType: 'Savings / Investment', balance: '' });
    setAddLoading(false);
    setShowAddForm(false);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setAddForm({ institution: '', accountType: 'Savings / Investment', balance: '' });
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col">
      {/* Subtle background accent */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-[#00C896]/3 rounded-full blur-3xl pointer-events-none" />

      {/* ── Scrollable content area ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pb-32">
        <div className="max-w-md mx-auto px-5 pt-14 pb-4 relative z-10">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex items-start justify-between mb-8"
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="w-9 h-9 rounded-full bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-[#9CA3AF] hover:text-white hover:border-[#3A3A3A] active:scale-95 transition-all shrink-0"
                aria-label="Go back"
              >
                <ArrowLeftIcon size={15} strokeWidth={2} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white leading-tight">Your Accounts</h1>
                <p className="text-[#9CA3AF] text-xs mt-0.5">
                  All connected · Last synced just now
                </p>
              </div>
            </div>
          </motion.div>

          {/* Net Worth Banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.05 }}
            className="bg-[#00C896]/5 border border-[#00C896]/10 rounded-2xl p-5 mb-6"
          >
            <p className="text-[#9CA3AF] text-xs uppercase tracking-widest mb-1.5">
              Total Net Worth
            </p>
            <p className="text-[#E8B84B] text-4xl font-bold tabular-nums leading-none mb-2">
              ${NET_WORTH.toLocaleString('en-CA')}
            </p>
            <p className="text-[#9CA3AF] text-sm">
              across {totalAccountCount} {totalAccountCount === 1 ? 'account' : 'accounts'}
            </p>
          </motion.div>

          {/* Account list */}
          <div className="flex flex-col gap-3 mb-4">
            {/* Base (Sarah's) accounts */}
            {ACCOUNTS.map((account, index) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut', delay: 0.08 * (index + 1) }}
              >
                <AccountCard account={account} />
              </motion.div>
            ))}

            {/* Extra accounts from localStorage */}
            <AnimatePresence initial={false}>
              {extraAccounts.map((account, index) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  transition={{
                    duration: 0.35,
                    ease: 'easeOut',
                    delay: index * 0.04,
                  }}
                >
                  <AccountCard
                    account={account as Account}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Add another account trigger */}
          <AnimatePresence mode="wait">
            {!showAddForm ? (
              <motion.button
                key="add-trigger"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 border border-dashed border-[#2A2A2A] rounded-2xl text-[#9CA3AF] text-sm font-medium hover:text-white hover:border-[#3A3A3A] active:scale-[0.99] transition-all"
              >
                <PlusIcon size={15} strokeWidth={2} />
                Add another account
              </motion.button>
            ) : null}
          </AnimatePresence>

          {/* ── Inline add-account form (slide-down) ─────────────────── */}
          <AnimatePresence>
            {showAddForm && (
              <motion.div
                ref={formRef}
                key="add-form"
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                style={{ overflow: 'hidden' }}
              >
                <form
                  onSubmit={handleConnectAccount}
                  className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-2xl p-4 flex flex-col gap-3"
                >
                  {/* Form header */}
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white text-sm font-semibold">Add an account</p>
                    <button
                      type="button"
                      onClick={handleCancelAdd}
                      className="w-7 h-7 rounded-full bg-[#242424] border border-[#2A2A2A] flex items-center justify-center text-[#9CA3AF] hover:text-white transition-colors"
                      aria-label="Cancel"
                    >
                      <XIcon size={13} strokeWidth={2} />
                    </button>
                  </div>

                  {/* Institution name */}
                  <div>
                    <label
                      htmlFor="new-institution"
                      className="block text-xs text-[#9CA3AF] uppercase tracking-widest mb-1.5"
                    >
                      Institution
                    </label>
                    <input
                      id="new-institution"
                      type="text"
                      value={addForm.institution}
                      onChange={handleAddFormChange('institution')}
                      placeholder="e.g. TD, CIBC, BMO, Scotiabank"
                      className={inputClass}
                      required
                      autoFocus
                    />
                  </div>

                  {/* Account type */}
                  <div>
                    <label
                      htmlFor="new-account-type"
                      className="block text-xs text-[#9CA3AF] uppercase tracking-widest mb-1.5"
                    >
                      Account Type
                    </label>
                    <div className="relative">
                      <select
                        id="new-account-type"
                        value={addForm.accountType}
                        onChange={handleAddFormChange('accountType')}
                        className={selectClass}
                      >
                        {ACCOUNT_TYPE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.label}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {/* Chevron */}
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#9CA3AF]">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path
                            d="M2 4l4 4 4-4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Balance */}
                  <div>
                    <label
                      htmlFor="new-balance"
                      className="block text-xs text-[#9CA3AF] uppercase tracking-widest mb-1.5"
                    >
                      Current Balance
                    </label>
                    <input
                      id="new-balance"
                      type="text"
                      inputMode="decimal"
                      value={addForm.balance}
                      onChange={handleAddFormChange('balance')}
                      placeholder="$0.00"
                      className={inputClass}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={addLoading || !addForm.institution.trim()}
                      className="flex-1 py-3 bg-[#00C896] text-[#0D0D0D] font-semibold rounded-xl text-sm hover:bg-[#00B386] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {addLoading ? (
                        <>
                          <span
                            className="w-3.5 h-3.5 border-2 border-[#0D0D0D]/30 border-t-[#0D0D0D] rounded-full animate-spin"
                            aria-hidden="true"
                          />
                          Connecting…
                        </>
                      ) : (
                        'Connect Account'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelAdd}
                      className="px-4 py-3 bg-transparent text-[#9CA3AF] text-sm font-medium hover:text-white transition-colors rounded-xl"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Sticky footer CTA ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.35 }}
        className="fixed bottom-0 left-0 right-0 bg-[#0D0D0D]/90 backdrop-blur-md border-t border-[#1A1A1A] px-5 py-4 z-20"
      >
        <div className="max-w-md mx-auto">
          <button
            onClick={() => router.push('/timeline')}
            className="w-full py-4 bg-[#00C896] text-[#0D0D0D] font-semibold rounded-2xl text-base hover:bg-[#00B386] active:scale-[0.98] transition-all"
          >
            Continue to Timeline →
          </button>
        </div>
      </motion.div>
    </div>
  );
}
