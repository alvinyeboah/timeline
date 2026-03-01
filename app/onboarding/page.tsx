'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ACCOUNTS, NET_WORTH } from '@/lib/mock-data';
import { calculateTax, CANADIAN_PROVINCES } from '@/lib/tax';
import { addExtraAccount, getExtraAccounts, removeExtraAccount, ExtraAccount } from '@/lib/accounts-storage';
import { saveProfile } from '@/lib/profile-storage';
import AccountCard from '@/components/accounts/AccountCard';
import OnboardingStep from '@/components/ui/OnboardingStep';
import { TrendUpIcon, LayoutIcon, CompassIcon, UsersIcon, PlusIcon, XIcon } from '@/components/ui/icons';

const TYPE_MAP: Record<string, ExtraAccount['type']> = {
  Chequing: 'chequing',
  Savings: 'spend',
  Investment: 'invest',
  RRSP: 'invest',
  TFSA: 'invest',
  Pension: 'pension',
  RESP: 'invest',
};

const TOTAL_STEPS = 4;

const INSTITUTIONS = ['RBC', 'TD', 'CIBC', 'BMO', 'Scotiabank', 'National Bank', 'Credit Union', 'Pension Fund'];
const ACCOUNT_TYPES = ['Chequing', 'Savings', 'Investment', 'RRSP', 'TFSA', 'Pension', 'RESP'];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // ── Step 3 — Accounts ──────────────────────────────────────────────────────
  const [extraAccounts, setExtraAccounts] = useState<ExtraAccount[]>([]);
  const [addingAccount, setAddingAccount] = useState(false);
  const [newInstitution, setNewInstitution] = useState('');
  const [newAccountType, setNewAccountType] = useState('');
  const [newBalance, setNewBalance] = useState('');

  useEffect(() => {
    setExtraAccounts(getExtraAccounts());
  }, []);

  const handleAddAccount = () => {
    if (!newInstitution || !newAccountType || !newBalance) return;
    const account: ExtraAccount = {
      id: `extra-${Date.now()}`,
      institution: newInstitution,
      type: TYPE_MAP[newAccountType] ?? 'invest',
      name: `${newInstitution} ${newAccountType}`,
      balance: parseFloat(newBalance.replace(/,/g, '')) || 0,
      connected: true,
      addedAt: new Date().toISOString(),
    };
    addExtraAccount(account);
    setExtraAccounts(getExtraAccounts());
    setNewInstitution('');
    setNewAccountType('');
    setNewBalance('');
    setAddingAccount(false);
  };

  // ── Step 4 — Profile ───────────────────────────────────────────────────────
  const [age, setAge] = useState(28);
  const [income, setIncome] = useState(95000);
  const [province, setProvince] = useState('Ontario');
  const [monthlyExpenses, setMonthlyExpenses] = useState(3800);
  const [totalDebt, setTotalDebt] = useState(12000);
  const [debtPriority, setDebtPriority] = useState<'ignore' | 'minimums_first' | 'debt_first' | 'custom'>('minimums_first');

  const taxInfo = useMemo(() => calculateTax(income, province), [income, province]);
  const savingsCapacity = Math.max(0, Math.round(taxInfo.afterTaxMonthly - monthlyExpenses - (totalDebt / 60)));

  // ── Navigation ─────────────────────────────────────────────────────────────
  const next = () => {
    if (step === TOTAL_STEPS) {
      // Save profile to localStorage before continuing
      saveProfile({
        fullName: 'Sarah Chen',
        phone: '+1 (416) 555-0142',
        email: 'sarah.chen@email.com',
        age,
        income,
        province,
        monthlyExpenses,
        totalDebt,
        debtPriority,
        taxBracket: taxInfo.marginalRate,
        monthlySavingsCapacity: savingsCapacity,
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

  const totalNetWorth =
    NET_WORTH + extraAccounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <AnimatePresence mode="wait">
      {/* ── Step 1 — Opening ─────────────────────────────────────────────── */}
      {step === 1 && (
        <OnboardingStep key="step1" step={1} totalSteps={TOTAL_STEPS} onBack={back}>
          <div className="flex-1 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-8"
            >
              <div className="w-12 h-12 bg-[#00C896]/10 rounded-2xl flex items-center justify-center mb-6 text-[#00C896]">
                <TrendUpIcon size={22} strokeWidth={1.75} />
              </div>
              <h1 className="text-3xl font-bold text-white leading-tight mb-4">
                Most apps show where your money went.
              </h1>
              <p className="text-[#9CA3AF] text-lg leading-relaxed">
                Timeline shows you where your{' '}
                <span className="text-white font-semibold">life could go</span>.
              </p>
            </motion.div>
          </div>

          <div className="flex gap-3 mt-auto">
            <button
              onClick={() => router.push('/signup')}
              className="flex-1 py-4 bg-[#00C896] text-[#0D0D0D] font-semibold rounded-2xl text-base active:scale-[0.98] transition-all"
            >
              Get Started
            </button>
            <button
              onClick={next}
              className="px-6 py-4 bg-[#1A1A1A] text-[#9CA3AF] font-semibold rounded-2xl text-base border border-[#2A2A2A] active:scale-[0.98] transition-all"
            >
              Sign In
            </button>
          </div>
        </OnboardingStep>
      )}

      {/* ── Step 2 — Value Props ─────────────────────────────────────────── */}
      {step === 2 && (
        <OnboardingStep key="step2" step={2} totalSteps={TOTAL_STEPS} onBack={back}>
          <div className="flex-1 flex flex-col justify-center">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-bold text-white mb-8"
            >
              Your whole financial life, in one place.
            </motion.h2>

            <div className="flex flex-col gap-4">
              {[
                { Icon: LayoutIcon, title: 'See the full picture', desc: 'All accounts, all goals, one timeline from today to retirement.' },
                { Icon: CompassIcon, title: 'Explore your future', desc: 'Drag goals, change years, and watch your net worth update in real time.' },
                { Icon: UsersIcon, title: 'Know when to act', desc: "We'll tell you exactly when to talk to an advisor or make a move." },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 * (i + 1) }}
                  className="flex gap-4 p-4 bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A]"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#00C896]/10 border border-[#00C896]/15 flex items-center justify-center text-[#00C896] shrink-0">
                    <item.Icon size={16} strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-white font-semibold mb-0.5">{item.title}</p>
                    <p className="text-[#9CA3AF] text-sm">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <button
            onClick={next}
            className="w-full py-4 bg-[#00C896] text-[#0D0D0D] font-semibold rounded-2xl text-base mt-8 active:scale-[0.98] transition-all"
          >
            Continue
          </button>
        </OnboardingStep>
      )}

      {/* ── Step 3 — Accounts ───────────────────────────────────────────── */}
      {step === 3 && (
        <OnboardingStep key="step3" step={3} totalSteps={TOTAL_STEPS} onBack={back}>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5"
            >
              <h2 className="text-3xl font-bold text-white mb-1">Your accounts</h2>
              <p className="text-[#9CA3AF]">Connected and ready to go</p>
            </motion.div>

            {/* Base accounts */}
            <div className="flex flex-col gap-3 mb-3">
              {ACCOUNTS.map((account, i) => (
                <motion.div
                  key={account.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * (i + 1) }}
                >
                  <AccountCard account={account} />
                </motion.div>
              ))}
            </div>

            {/* Extra accounts */}
            {extraAccounts.map((account) => (
              <motion.div
                key={account.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 p-4 bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] flex justify-between items-center"
              >
                <div>
                  <p className="text-white font-medium text-sm">{account.institution} — {account.type}</p>
                  <p className="text-[#9CA3AF] text-xs mt-0.5">${account.balance.toLocaleString('en-CA')}</p>
                </div>
                <button
                  onClick={() => {
                    removeExtraAccount(account.id);
                    setExtraAccounts(getExtraAccounts());
                  }}
                  className="w-7 h-7 rounded-lg border border-[#2A2A2A] flex items-center justify-center text-[#6B7280] hover:text-red-400 transition-colors"
                >
                  <XIcon size={12} strokeWidth={2} />
                </button>
              </motion.div>
            ))}

            {/* Add account form */}
            <AnimatePresence>
              {addingAccount ? (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mb-3 p-4 bg-[#1A1A1A] rounded-2xl border border-[#00C896]/30"
                >
                  <p className="text-white font-semibold text-sm mb-3">Add an account</p>

                  {/* Institution */}
                  <p className="text-[#9CA3AF] text-xs mb-1.5">Institution</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {INSTITUTIONS.map((inst) => (
                      <button
                        key={inst}
                        onClick={() => setNewInstitution(inst)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          newInstitution === inst
                            ? 'bg-[#00C896]/20 border-[#00C896]/50 text-[#00C896]'
                            : 'bg-[#242424] border-[#2A2A2A] text-[#9CA3AF] hover:border-[#3A3A3A]'
                        }`}
                      >
                        {inst}
                      </button>
                    ))}
                  </div>

                  {/* Account type */}
                  <p className="text-[#9CA3AF] text-xs mb-1.5">Account type</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {ACCOUNT_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => setNewAccountType(type)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          newAccountType === type
                            ? 'bg-[#00C896]/20 border-[#00C896]/50 text-[#00C896]'
                            : 'bg-[#242424] border-[#2A2A2A] text-[#9CA3AF] hover:border-[#3A3A3A]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  {/* Balance */}
                  <p className="text-[#9CA3AF] text-xs mb-1.5">Balance</p>
                  <input
                    type="number"
                    value={newBalance}
                    onChange={(e) => setNewBalance(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2.5 bg-[#242424] border border-[#2A2A2A] rounded-xl text-white text-sm placeholder-[#4B5563] focus:outline-none focus:border-[#00C896]/50 mb-3"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={handleAddAccount}
                      disabled={!newInstitution || !newAccountType || !newBalance}
                      className="flex-1 py-2.5 bg-[#00C896] text-[#0D0D0D] font-semibold rounded-xl text-sm disabled:opacity-40 transition-all"
                    >
                      Add Account
                    </button>
                    <button
                      onClick={() => { setAddingAccount(false); setNewInstitution(''); setNewAccountType(''); setNewBalance(''); }}
                      className="px-4 py-2.5 bg-[#242424] text-[#9CA3AF] rounded-xl text-sm border border-[#2A2A2A]"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setAddingAccount(true)}
                  className="mb-4 flex items-center gap-2 px-4 py-3 bg-[#1A1A1A] rounded-2xl border border-dashed border-[#2A2A2A] text-[#9CA3AF] text-sm hover:border-[#00C896]/30 hover:text-white transition-all w-full"
                >
                  <PlusIcon size={14} strokeWidth={2} />
                  Add bank or pension account
                </motion.button>
              )}
            </AnimatePresence>

            {/* Net worth total */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex justify-between items-center p-4 bg-[#00C896]/10 rounded-2xl border border-[#00C896]/20"
            >
              <span className="text-[#9CA3AF] font-medium">Total Net Worth</span>
              <span className="text-[#E8B84B] font-bold text-xl tabular-nums">
                ${totalNetWorth.toLocaleString('en-CA')}
              </span>
            </motion.div>
          </div>

          <button
            onClick={next}
            className="w-full py-4 bg-[#00C896] text-[#0D0D0D] font-semibold rounded-2xl text-base mt-6 active:scale-[0.98] transition-all shrink-0"
          >
            Continue
          </button>
        </OnboardingStep>
      )}

      {/* ── Step 4 — Profile ─────────────────────────────────────────────── */}
      {step === 4 && (
        <OnboardingStep key="step4" step={4} totalSteps={TOTAL_STEPS} onBack={back}>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5"
            >
              <h2 className="text-3xl font-bold text-white mb-1">Your profile</h2>
              <p className="text-[#9CA3AF]">Adjust anything that looks off</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] overflow-hidden mb-4"
            >
              {/* Age */}
              <div className="flex justify-between items-center px-5 py-3.5 border-b border-[#2A2A2A]">
                <span className="text-[#9CA3AF] text-sm">Age</span>
                <select
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="bg-transparent text-white text-sm font-medium text-right focus:outline-none cursor-pointer"
                >
                  {Array.from({ length: 63 }, (_, i) => i + 18).map((a) => (
                    <option key={a} value={a} className="bg-[#1A1A1A]">{a} years old</option>
                  ))}
                </select>
              </div>

              {/* Income */}
              <div className="flex justify-between items-center px-5 py-3.5 border-b border-[#2A2A2A]">
                <span className="text-[#9CA3AF] text-sm">Annual Income</span>
                <div className="flex items-center gap-1">
                  <span className="text-white text-sm font-medium">$</span>
                  <input
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(Number(e.target.value))}
                    className="w-28 bg-transparent text-white text-sm font-medium text-right focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              {/* Province */}
              <div className="flex justify-between items-center px-5 py-3.5 border-b border-[#2A2A2A]">
                <span className="text-[#9CA3AF] text-sm">Province</span>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="bg-transparent text-white text-sm font-medium text-right focus:outline-none cursor-pointer max-w-[55%]"
                >
                  {CANADIAN_PROVINCES.map((p) => (
                    <option key={p} value={p} className="bg-[#1A1A1A]">{p}</option>
                  ))}
                </select>
              </div>

              {/* Tax Bracket — auto-calculated */}
              <div className="flex justify-between items-center px-5 py-3.5 border-b border-[#2A2A2A]">
                <span className="text-[#9CA3AF] text-sm">Tax Bracket</span>
                <span className="text-[#00C896] text-sm font-medium">
                  {taxInfo.marginalRate.toFixed(2)}% marginal
                </span>
              </div>

              {/* Monthly Expenses */}
              <div className="flex justify-between items-center px-5 py-3.5 border-b border-[#2A2A2A]">
                <span className="text-[#9CA3AF] text-sm">Monthly Expenses</span>
                <div className="flex items-center gap-1">
                  <span className="text-white text-sm font-medium">$</span>
                  <input
                    type="number"
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                    className="w-24 bg-transparent text-white text-sm font-medium text-right focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              {/* Total Debt */}
              <div className="flex justify-between items-center px-5 py-3.5 border-b border-[#2A2A2A]">
                <span className="text-[#9CA3AF] text-sm">Total Debt</span>
                <div className="flex items-center gap-1">
                  <span className="text-white text-sm font-medium">$</span>
                  <input
                    type="number"
                    value={totalDebt}
                    onChange={(e) => setTotalDebt(Number(e.target.value))}
                    className="w-24 bg-transparent text-white text-sm font-medium text-right focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>

              {/* Debt Priority */}
              <div className="flex justify-between items-center px-5 py-3.5 border-b border-[#2A2A2A]">
                <span className="text-[#9CA3AF] text-sm">Debt Priority</span>
                <select
                  value={debtPriority}
                  onChange={(e) => setDebtPriority(e.target.value as typeof debtPriority)}
                  className="bg-transparent text-white text-sm font-medium text-right focus:outline-none cursor-pointer"
                >
                  <option value="minimums_first" className="bg-[#1A1A1A]">Minimums first</option>
                  <option value="debt_first" className="bg-[#1A1A1A]">Pay debt first</option>
                  <option value="custom" className="bg-[#1A1A1A]">Custom split</option>
                  <option value="ignore" className="bg-[#1A1A1A]">Ignore debt</option>
                </select>
              </div>

              {/* Savings Capacity — derived */}
              <div className="flex justify-between items-center px-5 py-3.5">
                <span className="text-[#9CA3AF] text-sm">Savings Capacity</span>
                <span className="text-[#E8B84B] text-sm font-bold">
                  ~${savingsCapacity.toLocaleString('en-CA')}/mo
                </span>
              </div>
            </motion.div>

            <p className="text-[#4B5563] text-xs text-center">
              These are your starting assumptions — you can always update them later.
            </p>
          </div>

          <button
            onClick={next}
            className="w-full py-4 bg-[#00C896] text-[#0D0D0D] font-semibold rounded-2xl text-base mt-6 active:scale-[0.98] transition-all shrink-0"
          >
            Continue →
          </button>
        </OnboardingStep>
      )}
    </AnimatePresence>
  );
}
