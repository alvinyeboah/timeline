const PROFILE_KEY = 'timeline_profile';

export interface StoredProfile {
  fullName: string;
  phone: string;
  email: string;
  age: number;
  income: number;
  province: string;
  monthlyExpenses: number;
  totalDebt: number;
  debtPriority: 'ignore' | 'minimums_first' | 'debt_first' | 'custom';
  taxBracket: number; // marginalRate from calculateTax
  monthlySavingsCapacity: number; // afterTaxMonthly - monthlyExpenses
}

const SARAH_DEFAULT: StoredProfile = {
  fullName: 'Sarah Chen',
  phone: '+1 (416) 555-0142',
  email: 'sarah.chen@email.com',
  age: 28,
  income: 95000,
  province: 'Ontario',
  monthlyExpenses: 3800,
  totalDebt: 12000,
  debtPriority: 'minimums_first',
  taxBracket: 33.89,
  monthlySavingsCapacity: 1517,
};

export function getProfile(): StoredProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return SARAH_DEFAULT;
    return JSON.parse(raw) as StoredProfile;
  } catch {
    return SARAH_DEFAULT;
  }
}

export function saveProfile(profile: StoredProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Storage may be unavailable (e.g. private browsing quota exceeded); fail silently.
  }
}

export function hasProfile(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(PROFILE_KEY) !== null;
  } catch {
    return false;
  }
}
