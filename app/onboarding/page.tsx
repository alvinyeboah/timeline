'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { ACCOUNTS, NET_WORTH, CURRENT_YEAR, PROJECTION_END_YEAR } from '@/lib/mock-data';
import { calculateTax, CANADIAN_PROVINCES } from '@/lib/tax';
import { ExtraAccount } from '@/lib/accounts-storage';
import { useAccountsStore } from '@/store/accounts';
import { useProfileStore } from '@/store/profile';
import AccountCard from '@/components/accounts/AccountCard';
import { TrendUpIcon, LayoutIcon, CompassIcon, UsersIcon, PlusIcon, XIcon } from '@/components/ui/icons';

const TYPE_MAP: Record<string, ExtraAccount['type']> = {
  Chequing: 'chequing', Savings: 'spend', Investment: 'invest',
  RRSP: 'invest', TFSA: 'invest', Pension: 'pension', RESP: 'invest',
};

const TOTAL_STEPS = 4;
const INSTITUTIONS = ['RBC', 'TD', 'CIBC', 'BMO', 'Scotiabank', 'National Bank', 'Credit Union', 'Pension Fund'];
const ACCOUNT_TYPES = ['Chequing', 'Savings', 'Investment', 'RRSP', 'TFSA', 'Pension', 'RESP'];

const STEP_LABELS = ['Intro', 'Features', 'Accounts', 'Profile'];

// Mini timeline preview — now light-themed
function SidebarPreview({ step }: { step: number }) {
  const DEMO_GOALS = [
    { name: 'Emergency', year: CURRENT_YEAR,      color: '#00C896' },
    { name: 'Education', year: CURRENT_YEAR + 2,  color: '#60A5FA' },
    { name: 'Home',      year: CURRENT_YEAR + 4,  color: '#34D399' },
    { name: 'Retire',    year: CURRENT_YEAR + 26, color: '#A78BFA' },
  ];
  const RANGE = PROJECTION_END_YEAR - CURRENT_YEAR;

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div className="absolute top-1/2 left-0 right-0 h-px bg-stone-200" />
      {DEMO_GOALS.map((goal, i) => {
        const xPct = ((goal.year - CURRENT_YEAR) / RANGE) * 90 + 5;
        const active = step >= i + 1;
        return (
          <motion.div
            key={goal.name}
            className="absolute flex flex-col items-center"
            style={{ left: `${xPct}%`, top: '50%', transform: 'translateX(-50%) translateY(-100%)' }}
            animate={{ opacity: active ? 1 : 0.25 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
          >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: goal.color }} />
            <div className="w-px h-4 bg-stone-300" />
            <p className="text-[8px] text-stone-400 whitespace-nowrap mt-0.5">{goal.name}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);

  useEffect(() => {
    const s = Number(searchParams.get('step'));
    if (s >= 1 && s <= TOTAL_STEPS) setStep(s);
  }, [searchParams]);

  const extraAccounts = useAccountsStore((s) => s.extraAccounts);
  const addAccount = useAccountsStore((s) => s.addAccount);
  const removeAccount = useAccountsStore((s) => s.removeAccount);

  const [addingAccount, setAddingAccount] = useState(false);
  const [newInstitution, setNewInstitution] = useState('');
  const [newAccountType, setNewAccountType] = useState('');
  const [newBalance, setNewBalance] = useState('');

  const handleAddAccount = () => {
    if (!newInstitution || !newAccountType || !newBalance) return;
    addAccount({
      id: `extra-${Date.now()}`,
      institution: newInstitution,
      type: TYPE_MAP[newAccountType] ?? 'invest',
      name: `${newInstitution} ${newAccountType}`,
      balance: parseFloat(newBalance.replace(/,/g, '')) || 0,
      connected: true,
      addedAt: new Date().toISOString(),
    });
    setNewInstitution(''); setNewAccountType(''); setNewBalance(''); setAddingAccount(false);
  };

  const storedProfile = useProfileStore((s) => s.profile);
  const setProfile = useProfileStore((s) => s.setProfile);

  const [age, setAge] = useState(storedProfile.age);
  const [income, setIncome] = useState(storedProfile.income);
  const [province, setProvince] = useState(storedProfile.province);
  const [monthlyExpenses, setMonthlyExpenses] = useState(storedProfile.monthlyExpenses);
  const [totalDebt, setTotalDebt] = useState(storedProfile.totalDebt);
  const [debtPriority, setDebtPriority] = useState<'ignore' | 'minimums_first' | 'debt_first' | 'custom'>(storedProfile.debtPriority);

  const taxInfo = useMemo(() => calculateTax(income, province), [income, province]);
  const savingsCapacity = Math.max(0, Math.round(taxInfo.afterTaxMonthly - monthlyExpenses - (totalDebt / 60)));
  const totalNetWorth = NET_WORTH + extraAccounts.reduce((sum, a) => sum + a.balance, 0);

  const next = () => {
    if (step === TOTAL_STEPS) {
      setProfile({
        fullName: storedProfile.fullName, phone: storedProfile.phone, email: storedProfile.email,
        age, income, province, monthlyExpenses, totalDebt, debtPriority,
        taxBracket: taxInfo.marginalRate, monthlySavingsCapacity: savingsCapacity,
      });
      router.push('/what-matters');
    } else {
      setStep((s) => s + 1);
    }
  };

  const back = () => {
    if (step > 1) setStep((s) => s - 1);
    else router.push('/');
  };

  return (
    <div className="min-h-screen bg-[#F5F4F0] flex">
      {/* ── Left sidebar — light ─────────────────────────────────────────────── */}
      <div className="w-72 bg-white border-r border-stone-200 flex flex-col px-8 py-10 shrink-0">
        {/* Wordmark */}
        <div className="mb-12">
          <span className="text-stone-900 font-bold text-base tracking-tight">Timeline</span>
        </div>

        {/* Step progress */}
        <div className="flex flex-col gap-0.5 mb-auto">
          {STEP_LABELS.map((label, i) => {
            const stepNum = i + 1;
            const isActive = step === stepNum;
            const isDone = step > stepNum;
            return (
              <div key={label} className="flex items-start gap-3 py-1.5">
                <div className="flex flex-col items-center mt-1 shrink-0">
                  <div className={`w-2 h-2 rounded-full transition-colors ${
                    isActive ? 'bg-[#00C896]' : isDone ? 'bg-[#00C896]/40' : 'bg-stone-200'
                  }`} />
                  {i < STEP_LABELS.length - 1 && (
                    <div className={`w-px h-7 mt-1 transition-colors ${isDone ? 'bg-[#00C896]/25' : 'bg-stone-200'}`} />
                  )}
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <span className={`text-sm leading-none transition-colors ${
                    isActive ? 'text-stone-900 font-semibold' : isDone ? 'text-stone-400' : 'text-stone-300'
                  }`}>
                    {label}
                  </span>
                  {isDone && (
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="text-[#00C896] shrink-0">
                      <path d="M2 5.5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mini timeline preview */}
        <div className="h-16 mt-8 mb-2">
          <SidebarPreview step={step} />
        </div>

        {/* Live savings callout on step 4 */}
        {step >= 4 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3.5 bg-[#D97706]/5 border border-[#D97706]/15 rounded-xl"
          >
            <p className="text-stone-400 text-[10px] uppercase tracking-wide mb-1">Savings capacity</p>
            <p className="text-[#D97706] font-bold text-lg tabular-nums leading-none">
              ${savingsCapacity.toLocaleString('en-CA')}
              <span className="text-stone-400 text-xs font-normal">/mo</span>
            </p>
          </motion.div>
        )}
      </div>

      {/* ── Right content area ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">

          {/* ── Step 1: Opening ───────────────────────────────────────────── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35 }}
              className="flex-1 flex flex-col justify-center px-16 py-14 bg-white"
            >
              <div className="w-12 h-12 bg-[#00C896]/10 rounded-2xl flex items-center justify-center mb-8 text-[#00C896]">
                <TrendUpIcon size={22} strokeWidth={1.75} />
              </div>
              <h1 className="text-5xl font-bold text-stone-900 leading-tight mb-6 max-w-lg">
                Most apps show where your money went.
              </h1>
              <p className="text-stone-500 text-xl leading-relaxed mb-14 max-w-md">
                Timeline shows you where your{' '}
                <span className="text-stone-900 font-semibold">life could go</span>.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => router.push('/signup')}
                  className="px-10 py-4 bg-stone-900 text-white font-semibold rounded-xl text-base hover:bg-stone-800 active:scale-[0.98] transition-all"
                >
                  Get Started →
                </button>
                <button
                  onClick={next}
                  className="px-10 py-4 bg-stone-100 text-stone-600 font-semibold rounded-xl text-base hover:bg-stone-200 active:scale-[0.98] transition-all"
                >
                  Sign In
                </button>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Value Props ─────────────────────────────────────── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35 }}
              className="flex-1 flex flex-col justify-center px-16 py-14 bg-white"
            >
              <h2 className="text-4xl font-bold text-stone-900 mb-3">
                Your whole financial life,<br />in one place.
              </h2>
              <p className="text-stone-400 text-lg mb-12">Connect your goals to your money — and see what it actually takes.</p>

              <div className="grid grid-cols-3 gap-5 mb-14">
                {[
                  {
                    Icon: LayoutIcon,
                    title: 'One timeline',
                    desc: 'Every account, every goal, from today to retirement. All in one view.',
                  },
                  {
                    Icon: CompassIcon,
                    title: 'Drag to explore',
                    desc: 'Move goals forward or back and watch your net worth update instantly.',
                  },
                  {
                    Icon: UsersIcon,
                    title: 'Know when to act',
                    desc: 'We flag when professional guidance makes the most impact.',
                  },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * (i + 1) }}
                    className="p-6 bg-[#F5F4F0] rounded-2xl"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-stone-600 mb-5 shadow-sm">
                      <item.Icon size={18} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-stone-900 font-semibold text-base mb-2">{item.title}</h3>
                    <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={back} className="px-5 py-3 rounded-xl border border-stone-200 text-stone-500 text-sm hover:bg-stone-50 transition">← Back</button>
                <button onClick={next} className="px-10 py-3 bg-stone-900 text-white font-semibold rounded-xl text-sm hover:bg-stone-800 transition">Continue →</button>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Accounts ───────────────────────────────────────── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35 }}
              className="flex-1 flex flex-col overflow-y-auto px-16 py-14 bg-white"
            >
              <h2 className="text-4xl font-bold text-stone-900 mb-2">Your accounts</h2>
              <p className="text-stone-400 mb-10">Connected and ready to go</p>

              <div className="grid grid-cols-2 gap-4 mb-5 max-w-2xl">
                {ACCOUNTS.map((account, i) => (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * (i + 1) }}
                  >
                    <AccountCard account={account} />
                  </motion.div>
                ))}
                {extraAccounts.map((account) => (
                  <div key={account.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex justify-between items-center">
                    <div>
                      <p className="text-stone-900 font-medium text-sm">{account.institution} — {account.type}</p>
                      <p className="text-stone-400 text-xs mt-0.5">${account.balance.toLocaleString('en-CA')}</p>
                    </div>
                    <button onClick={() => removeAccount(account.id)} className="w-7 h-7 rounded-lg border border-stone-200 flex items-center justify-center text-stone-400 hover:text-red-500 transition-colors">
                      <XIcon size={12} strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>

              <AnimatePresence>
                {addingAccount ? (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                    className="mb-5 p-5 bg-stone-50 rounded-2xl border border-[#00C896]/25 max-w-2xl">
                    <p className="text-stone-900 font-semibold text-sm mb-4">Add an account</p>
                    <div className="mb-3">
                      <p className="text-stone-400 text-xs mb-2">Institution</p>
                      <div className="flex flex-wrap gap-2">
                        {INSTITUTIONS.map((inst) => (
                          <button key={inst} onClick={() => setNewInstitution(inst)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${newInstitution === inst ? 'bg-[#00C896]/10 border-[#00C896]/40 text-[#00C896]' : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'}`}>
                            {inst}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-3">
                      <p className="text-stone-400 text-xs mb-2">Account type</p>
                      <div className="flex flex-wrap gap-2">
                        {ACCOUNT_TYPES.map((type) => (
                          <button key={type} onClick={() => setNewAccountType(type)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${newAccountType === type ? 'bg-[#00C896]/10 border-[#00C896]/40 text-[#00C896]' : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300'}`}>
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mb-4">
                      <p className="text-stone-400 text-xs mb-2">Balance</p>
                      <input type="number" value={newBalance} onChange={(e) => setNewBalance(e.target.value)} placeholder="0"
                        className="w-48 px-3 py-2.5 bg-white border border-stone-200 rounded-xl text-stone-900 text-sm placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-[#00C896]/30 focus:border-[#00C896]/50" />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleAddAccount} disabled={!newInstitution || !newAccountType || !newBalance}
                        className="px-5 py-2 bg-[#00C896] text-white font-semibold rounded-xl text-sm disabled:opacity-40">Add</button>
                      <button onClick={() => { setAddingAccount(false); setNewInstitution(''); setNewAccountType(''); setNewBalance(''); }}
                        className="px-4 py-2 bg-white text-stone-500 rounded-xl text-sm border border-stone-200">Cancel</button>
                    </div>
                  </motion.div>
                ) : (
                  <button onClick={() => setAddingAccount(true)}
                    className="mb-6 flex items-center gap-2 px-4 py-3 bg-stone-50 rounded-2xl border border-dashed border-stone-300 text-stone-500 text-sm hover:border-[#00C896]/40 hover:text-stone-700 transition-all max-w-2xl w-full">
                    <PlusIcon size={14} strokeWidth={2} />
                    Add bank or pension account
                  </button>
                )}
              </AnimatePresence>

              <div className="p-4 bg-[#00C896]/5 rounded-2xl border border-[#00C896]/20 flex justify-between items-center mb-10 max-w-2xl">
                <span className="text-stone-600 font-medium">Total Net Worth</span>
                <span className="text-[#D97706] font-bold text-xl tabular-nums">${totalNetWorth.toLocaleString('en-CA')}</span>
              </div>

              <div className="flex gap-3">
                <button onClick={back} className="px-5 py-3 rounded-xl border border-stone-200 text-stone-500 text-sm hover:bg-stone-50 transition">← Back</button>
                <button onClick={next} className="px-10 py-3 bg-stone-900 text-white font-semibold rounded-xl text-sm hover:bg-stone-800 transition">Continue →</button>
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Profile ─────────────────────────────────────────── */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.35 }}
              className="flex-1 flex flex-col overflow-y-auto px-16 py-14 bg-white"
            >
              <div className="flex items-start justify-between mb-10 max-w-3xl">
                <div>
                  <h2 className="text-4xl font-bold text-stone-900 mb-2">Your profile</h2>
                  <p className="text-stone-400">Adjust anything that looks off</p>
                </div>
                <div className="bg-[#D97706]/5 border border-[#D97706]/15 rounded-2xl p-4 text-right shrink-0 ml-8">
                  <p className="text-stone-400 text-xs mb-1">Monthly savings capacity</p>
                  <p className="text-[#D97706] font-bold text-2xl tabular-nums leading-none">${savingsCapacity.toLocaleString('en-CA')}<span className="text-stone-400 text-sm font-normal">/mo</span></p>
                </div>
              </div>

              <div className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden mb-8 max-w-xl">
                {[
                  {
                    label: 'Age',
                    content: (
                      <select value={age} onChange={(e) => setAge(Number(e.target.value))} className="bg-transparent text-stone-900 text-sm font-medium text-right focus:outline-none cursor-pointer">
                        {Array.from({ length: 63 }, (_, i) => i + 18).map((a) => <option key={a} value={a}>{a} years old</option>)}
                      </select>
                    ),
                  },
                  {
                    label: 'Annual Income',
                    content: (
                      <div className="flex items-center gap-1">
                        <span className="text-stone-900 text-sm font-medium">$</span>
                        <input type="number" value={income} onChange={(e) => setIncome(Number(e.target.value))} className="w-28 bg-transparent text-stone-900 text-sm font-medium text-right focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                      </div>
                    ),
                  },
                  {
                    label: 'Province',
                    content: (
                      <select value={province} onChange={(e) => setProvince(e.target.value)} className="bg-transparent text-stone-900 text-sm font-medium text-right focus:outline-none cursor-pointer max-w-[55%]">
                        {CANADIAN_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    ),
                  },
                  {
                    label: 'Tax Bracket',
                    content: <span className="text-[#00C896] text-sm font-medium">{taxInfo.marginalRate.toFixed(2)}% marginal</span>,
                  },
                  {
                    label: 'Monthly Expenses',
                    content: (
                      <div className="flex items-center gap-1">
                        <span className="text-stone-900 text-sm font-medium">$</span>
                        <input type="number" value={monthlyExpenses} onChange={(e) => setMonthlyExpenses(Number(e.target.value))} className="w-24 bg-transparent text-stone-900 text-sm font-medium text-right focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                      </div>
                    ),
                  },
                  {
                    label: 'Total Debt',
                    content: (
                      <div className="flex items-center gap-1">
                        <span className="text-stone-900 text-sm font-medium">$</span>
                        <input type="number" value={totalDebt} onChange={(e) => setTotalDebt(Number(e.target.value))} className="w-24 bg-transparent text-stone-900 text-sm font-medium text-right focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                      </div>
                    ),
                  },
                  {
                    label: 'Debt Priority',
                    content: (
                      <select value={debtPriority} onChange={(e) => setDebtPriority(e.target.value as typeof debtPriority)} className="bg-transparent text-stone-900 text-sm font-medium text-right focus:outline-none cursor-pointer">
                        <option value="minimums_first">Minimums first</option>
                        <option value="debt_first">Pay debt first</option>
                        <option value="custom">Custom split</option>
                        <option value="ignore">Ignore debt</option>
                      </select>
                    ),
                  },
                ].map((row, i, arr) => (
                  <div key={row.label} className={`flex justify-between items-center px-5 py-3.5 ${i < arr.length - 1 ? 'border-b border-stone-200' : ''}`}>
                    <span className="text-stone-500 text-sm">{row.label}</span>
                    {row.content}
                  </div>
                ))}
              </div>

              <p className="text-stone-400 text-xs mb-10 max-w-xl">Starting assumptions — update them anytime from your profile.</p>

              <div className="flex gap-3">
                <button onClick={back} className="px-5 py-3 rounded-xl border border-stone-200 text-stone-500 text-sm hover:bg-stone-50 transition">← Back</button>
                <button onClick={next} className="px-10 py-3 bg-stone-900 text-white font-semibold rounded-xl text-sm hover:bg-stone-800 transition">Continue →</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function OnboardingPageWrapper() {
  return (
    <Suspense>
      <OnboardingPage />
    </Suspense>
  );
}
