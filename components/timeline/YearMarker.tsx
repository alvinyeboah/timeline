'use client';

interface Props {
  year: number;
  isNow?: boolean;
}

export default function YearMarker({ year, isNow }: Props) {
  return (
    <div className="flex flex-col items-center shrink-0">
      <div
        className={`w-px h-4 mb-1 ${isNow ? 'bg-[#00C896]' : 'bg-[#2A2A2A]'}`}
      />
      <span
        className={`text-xs font-medium tabular-nums ${
          isNow ? 'text-[#00C896]' : 'text-[#4B5563]'
        }`}
      >
        {year}
      </span>
    </div>
  );
}
