import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StoredProfile } from '@/lib/profile-storage';

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

interface ProfileState {
  profile: StoredProfile;
  setProfile: (profile: StoredProfile) => void;
  patchProfile: (patch: Partial<StoredProfile>) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      profile: SARAH_DEFAULT,
      setProfile: (profile) => set({ profile }),
      patchProfile: (patch) =>
        set((s) => ({ profile: { ...s.profile, ...patch } })),
    }),
    { name: 'timeline_profile' }
  )
);
