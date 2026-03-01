import { UserProfile, Account } from './types';

export const SARAH: UserProfile = {
  name: 'Sarah Chen',
  age: 28,
  income: 95000,
  province: 'Ontario',
  taxBracket: 33.89,
  monthlyExpenses: 3800,
  totalDebt: 12000,
  debtPriority: 'minimums_first',
  monthlySavingsCapacity: 1517,
};

export const ACCOUNTS: Account[] = [
  {
    id: 'ws-invest',
    institution: 'Wealthsimple',
    type: 'invest',
    name: 'Wealthsimple Invest',
    balance: 32230,
    connected: true,
  },
  {
    id: 'ws-spend',
    institution: 'Wealthsimple',
    type: 'spend',
    name: 'Wealthsimple Spend',
    balance: 16070,
    connected: true,
  },
  {
    id: 'rbc-chequing',
    institution: 'RBC',
    type: 'chequing',
    name: 'RBC Chequing',
    balance: 5200,
    connected: true,
  },
];

export const NET_WORTH = ACCOUNTS.reduce((sum, a) => sum + a.balance, 0); // 53,500

export const CURRENT_YEAR = 2025;
export const PROJECTION_END_YEAR = 2055;

export const SARAH_SYSTEM_CONTEXT = `
You are a financial goal assistant for Sarah Chen:
- Age: 28, Province: Ontario
- Annual income: $95,000 (tax bracket: ~33.89%)
- Net worth: $53,500 (Wealthsimple Invest: $32,230, Wealthsimple Spend: $16,070, RBC Chequing: $5,200)
- Monthly expenses: $3,800
- Total debt: $12,000 (student loans — paying minimums)
- Monthly savings capacity: ~$1,517/month
- Current year: ${CURRENT_YEAR}
`.trim();
