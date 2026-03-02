'use client';

interface Props {
  year: number;
  isNow?: boolean;
}

export default function YearMarker({ year, isNow }: Props) {
  return (
    <div className="flex flex-col items-center shrink-0">
      <div className={`w-px h-3 mb-1 ${isNow ? 'bg-[#00C896]' : 'bg-stone-300'}`} />
      <span className={`text-[10px] font-medium tabular-nums ${isNow ? 'text-[#00C896]' : 'text-stone-400'}`}>
        {year}
      </span>
    </div>
  );
}
