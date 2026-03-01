const EXTRA_ACCOUNTS_KEY = 'timeline_extra_accounts';

export interface ExtraAccount {
  id: string;
  institution: string; // user-entered, e.g. "RBC", "TD"
  type: 'invest' | 'spend' | 'chequing' | 'pension';
  name: string;
  balance: number;
  connected: boolean;
  addedAt: string; // ISO 8601
}

export function getExtraAccounts(): ExtraAccount[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EXTRA_ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as ExtraAccount[]) : [];
  } catch {
    return [];
  }
}

export function addExtraAccount(account: ExtraAccount): void {
  if (typeof window === 'undefined') return;
  try {
    const accounts = getExtraAccounts();
    const existingIndex = accounts.findIndex((a) => a.id === account.id);
    if (existingIndex >= 0) {
      accounts[existingIndex] = account;
    } else {
      accounts.push(account);
    }
    localStorage.setItem(EXTRA_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // Storage may be unavailable; fail silently.
  }
}

export function removeExtraAccount(id: string): void {
  if (typeof window === 'undefined') return;
  try {
    const accounts = getExtraAccounts().filter((a) => a.id !== id);
    localStorage.setItem(EXTRA_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // Storage may be unavailable; fail silently.
  }
}

export function clearExtraAccounts(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(EXTRA_ACCOUNTS_KEY);
  } catch {
    // Storage may be unavailable; fail silently.
  }
}
