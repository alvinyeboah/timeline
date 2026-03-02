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
    <div className="min-h-screen bg-[#F5F4F0] flex flex-col">
      {/* ── Scrollable content area ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto pb-28">
        <div className="max-w-3xl mx-auto px-8 pt-12 pb-4">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex items-center justify-between mb-10"
          >
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="w-9 h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:border-stone-300 active:scale-95 transition-all shrink-0 shadow-sm"
                aria-label="Go back"
              >
                <ArrowLeftIcon size={15} strokeWidth={2} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-stone-900 leading-tight">Your Accounts</h1>
                <p className="text-stone-400 text-sm mt-0.5">All connected · Last synced just now</p>
              </div>
            </div>
          </motion.div>

          {/* Two-column layout */}
          <div className="grid grid-cols-3 gap-8">
            {/* Left: account list */}
            <div className="col-span-2 flex flex-col gap-4">
              {/* Base (Sarah's) accounts */}
              {ACCOUNTS.map((account, index) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut', delay: 0.06 * index }}
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
                    transition={{ duration: 0.35, ease: 'easeOut', delay: index * 0.04 }}
                  >
                    <AccountCard account={account as Account} />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add another account trigger */}
              <AnimatePresence mode="wait">
                {!showAddForm ? (
                  <motion.button
                    key="add-trigger"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.15 } }}
                    onClick={() => setShowAddForm(true)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 border border-dashed border-stone-300 rounded-2xl text-stone-400 text-sm font-medium hover:text-stone-700 hover:border-stone-400 hover:bg-white active:scale-[0.99] transition-all"
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
                      className="bg-white border border-stone-200 rounded-2xl p-5 flex flex-col gap-4 shadow-sm"
                    >
                      {/* Form header */}
                      <div className="flex items-center justify-between">
                        <p className="text-stone-900 text-sm font-semibold">Add an account</p>
                        <button
                          type="button"
                          onClick={handleCancelAdd}
                          className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:text-stone-700 transition-colors"
                          aria-label="Cancel"
                        >
                          <XIcon size={13} strokeWidth={2} />
                        </button>
                      </div>

                      {/* Institution name */}
                      <div>
                        <label htmlFor="new-institution" className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">
                          Institution
                        </label>
                        <input
                          id="new-institution"
                          type="text"
                          value={addForm.institution}
                          onChange={handleAddFormChange('institution')}
                          placeholder="e.g. TD, CIBC, BMO, Scotiabank"
                          className="w-full bg-[#F5F4F0] border border-stone-200 text-stone-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C896]/25 focus:border-[#00C896]/50 transition placeholder:text-stone-300 text-sm"
                          required
                          autoFocus
                        />
                      </div>

                      {/* Account type */}
                      <div>
                        <label htmlFor="new-account-type" className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">
                          Account Type
                        </label>
                        <div className="relative">
                          <select
                            id="new-account-type"
                            value={addForm.accountType}
                            onChange={handleAddFormChange('accountType')}
                            className="w-full bg-[#F5F4F0] border border-stone-200 text-stone-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C896]/25 focus:border-[#00C896]/50 transition text-sm appearance-none cursor-pointer"
                          >
                            {ACCOUNT_TYPE_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.label}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Balance */}
                      <div>
                        <label htmlFor="new-balance" className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">
                          Current Balance
                        </label>
                        <input
                          id="new-balance"
                          type="text"
                          inputMode="decimal"
                          value={addForm.balance}
                          onChange={handleAddFormChange('balance')}
                          placeholder="$0.00"
                          className="w-full bg-[#F5F4F0] border border-stone-200 text-stone-900 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C896]/25 focus:border-[#00C896]/50 transition placeholder:text-stone-300 text-sm"
                        />
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-1">
                        <button
                          type="submit"
                          disabled={addLoading || !addForm.institution.trim()}
                          className="flex-1 py-3 bg-stone-900 text-white font-semibold rounded-xl text-sm hover:bg-stone-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {addLoading ? (
                            <>
                              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                              Connecting…
                            </>
                          ) : 'Connect Account'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelAdd}
                          className="px-4 py-3 bg-stone-100 text-stone-500 text-sm font-medium hover:bg-stone-200 transition-colors rounded-xl"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: Net Worth summary sidebar */}
            <div className="col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sticky top-4"
              >
                <p className="text-stone-400 text-xs font-semibold uppercase tracking-widest mb-2">Net Worth</p>
                <p className="text-[#D97706] text-4xl font-bold tabular-nums leading-none mb-1">
                  ${NET_WORTH.toLocaleString('en-CA')}
                </p>
                <p className="text-stone-400 text-sm mb-6">
                  across {totalAccountCount} {totalAccountCount === 1 ? 'account' : 'accounts'}
                </p>

                <div className="border-t border-stone-100 pt-4">
                  <p className="text-stone-400 text-xs font-semibold uppercase tracking-widest mb-3">Breakdown</p>
                  <div className="flex flex-col gap-2">
                    {ACCOUNTS.map((account) => (
                      <div key={account.id} className="flex items-center justify-between">
                        <span className="text-stone-500 text-xs">{account.name.split(' ').slice(-1)[0]}</span>
                        <span className="text-stone-700 text-xs font-semibold tabular-nums">${account.balance.toLocaleString('en-CA')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Sticky footer CTA ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.35 }}
        className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-stone-200 px-8 py-4 z-20"
      >
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => router.push('/timeline')}
            className="px-8 py-3.5 bg-stone-900 text-white font-semibold rounded-xl text-base hover:bg-stone-800 active:scale-[0.98] transition-all"
          >
            Continue to Timeline →
          </button>
        </div>
      </motion.div>
    </div>
  );
}
