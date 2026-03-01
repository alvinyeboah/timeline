import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ExtraAccount } from '@/lib/accounts-storage';

interface AccountsState {
  extraAccounts: ExtraAccount[];
  addAccount: (account: ExtraAccount) => void;
  removeAccount: (id: string) => void;
  clearAccounts: () => void;
}

export const useAccountsStore = create<AccountsState>()(
  persist(
    (set) => ({
      extraAccounts: [],
      addAccount: (account) =>
        set((s) => {
          const exists = s.extraAccounts.findIndex((a) => a.id === account.id);
          if (exists >= 0) {
            const updated = [...s.extraAccounts];
            updated[exists] = account;
            return { extraAccounts: updated };
          }
          return { extraAccounts: [...s.extraAccounts, account] };
        }),
      removeAccount: (id) =>
        set((s) => ({ extraAccounts: s.extraAccounts.filter((a) => a.id !== id) })),
      clearAccounts: () => set({ extraAccounts: [] }),
    }),
    { name: 'timeline_extra_accounts' }
  )
);
