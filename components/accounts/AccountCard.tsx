'use client';

import { Account } from '@/lib/types';

interface Props {
  account: Account;
}

const INSTITUTION_COLORS: Record<string, string> = {
  Wealthsimple: '#00C896',
  RBC: '#005DAA',
};

const TYPE_LABELS: Record<string, string> = {
  invest: 'Invest',
  spend: 'Spend',
  chequing: 'Chequing',
};

export default function AccountCard({ account }: Props) {
  const color = INSTITUTION_COLORS[account.institution] ?? '#9CA3AF';

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-stone-200 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Institution dot */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ backgroundColor: color }}
        >
          {account.institution[0]}
        </div>
        <div>
          <p className="text-stone-900 text-sm font-semibold">{account.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-stone-400 text-xs">{TYPE_LABELS[account.type]}</span>
            {account.connected && (
              <span className="inline-flex items-center gap-1 text-[#00C896] text-xs font-medium">
                <span className="w-1.5 h-1.5 bg-[#00C896] rounded-full" />
                Connected
              </span>
            )}
          </div>
        </div>
      </div>
      <span className="text-stone-900 font-bold tabular-nums">
        ${account.balance.toLocaleString('en-CA')}
      </span>
    </div>
  );
}
