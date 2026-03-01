export const CANADIAN_PROVINCES: string[] = [
  'Alberta',
  'British Columbia',
  'Manitoba',
  'New Brunswick',
  'Newfoundland and Labrador',
  'Nova Scotia',
  'Ontario',
  'Prince Edward Island',
  'Quebec',
  'Saskatchewan',
  'Northwest Territories',
  'Nunavut',
  'Yukon',
];

interface TaxBracket {
  upTo: number; // Infinity for the top bracket
  rate: number; // combined marginal rate as a percentage
  label: string; // human-readable bracket label
}

const BRACKETS: Record<string, TaxBracket[]> = {
  Ontario: [
    { upTo: 51446,   rate: 20.05, label: '20.05% (Federal + Ontario)' },
    { upTo: 102894,  rate: 29.65, label: '29.65% (Federal + Ontario)' },
    { upTo: 150000,  rate: 37.91, label: '37.91% (Federal + Ontario)' },
    { upTo: 220000,  rate: 43.41, label: '43.41% (Federal + Ontario)' },
    { upTo: Infinity, rate: 46.41, label: '46.41% (Federal + Ontario)' },
  ],
  'British Columbia': [
    { upTo: 45654,   rate: 20.06, label: '20.06% (Federal + BC)' },
    { upTo: 91310,   rate: 28.20, label: '28.20% (Federal + BC)' },
    { upTo: 104835,  rate: 31.00, label: '31.00% (Federal + BC)' },
    { upTo: 127299,  rate: 33.71, label: '33.71% (Federal + BC)' },
    { upTo: 172602,  rate: 38.34, label: '38.34% (Federal + BC)' },
    { upTo: Infinity, rate: 43.70, label: '43.70% (Federal + BC)' },
  ],
  Alberta: [
    { upTo: 57375,   rate: 25.00, label: '25.00% (Federal + Alberta)' },
    { upTo: 114750,  rate: 30.50, label: '30.50% (Federal + Alberta)' },
    { upTo: 155625,  rate: 33.00, label: '33.00% (Federal + Alberta)' },
    { upTo: Infinity, rate: 36.00, label: '36.00% (Federal + Alberta)' },
  ],
  Quebec: [
    { upTo: 51780,   rate: 27.53, label: '27.53% (Federal + Quebec)' },
    { upTo: 103545,  rate: 37.12, label: '37.12% (Federal + Quebec)' },
    { upTo: 126000,  rate: 42.37, label: '42.37% (Federal + Quebec)' },
    { upTo: Infinity, rate: 49.97, label: '49.97% (Federal + Quebec)' },
  ],
  Manitoba: [
    { upTo: 36842,   rate: 25.80, label: '25.80% (Federal + Manitoba)' },
    { upTo: 79625,   rate: 37.90, label: '37.90% (Federal + Manitoba)' },
    { upTo: Infinity, rate: 43.80, label: '43.80% (Federal + Manitoba)' },
  ],
  Saskatchewan: [
    { upTo: 49720,   rate: 25.50, label: '25.50% (Federal + Saskatchewan)' },
    { upTo: 142058,  rate: 33.50, label: '33.50% (Federal + Saskatchewan)' },
    { upTo: Infinity, rate: 38.50, label: '38.50% (Federal + Saskatchewan)' },
  ],
  'Nova Scotia': [
    { upTo: 29590,   rate: 23.79, label: '23.79% (Federal + Nova Scotia)' },
    { upTo: 59180,   rate: 31.79, label: '31.79% (Federal + Nova Scotia)' },
    { upTo: 93000,   rate: 33.95, label: '33.95% (Federal + Nova Scotia)' },
    { upTo: 150000,  rate: 43.50, label: '43.50% (Federal + Nova Scotia)' },
    { upTo: Infinity, rate: 54.00, label: '54.00% (Federal + Nova Scotia)' },
  ],
  'New Brunswick': [
    { upTo: 47715,   rate: 24.68, label: '24.68% (Federal + New Brunswick)' },
    { upTo: 95431,   rate: 33.06, label: '33.06% (Federal + New Brunswick)' },
    { upTo: 176756,  rate: 37.02, label: '37.02% (Federal + New Brunswick)' },
    { upTo: Infinity, rate: 42.84, label: '42.84% (Federal + New Brunswick)' },
  ],
  'Prince Edward Island': [
    { upTo: 32656,   rate: 24.80, label: '24.80% (Federal + PEI)' },
    { upTo: 64313,   rate: 37.50, label: '37.50% (Federal + PEI)' },
    { upTo: Infinity, rate: 46.25, label: '46.25% (Federal + PEI)' },
  ],
  'Newfoundland and Labrador': [
    { upTo: 43198,   rate: 22.70, label: '22.70% (Federal + Newfoundland)' },
    { upTo: 86395,   rate: 32.70, label: '32.70% (Federal + Newfoundland)' },
    { upTo: 154244,  rate: 39.30, label: '39.30% (Federal + Newfoundland)' },
    { upTo: Infinity, rate: 51.30, label: '51.30% (Federal + Newfoundland)' },
  ],
};

function getBrackets(province: string): TaxBracket[] {
  return BRACKETS[province] ?? BRACKETS['Ontario'];
}

export function calculateTax(
  income: number,
  province: string,
): { marginalRate: number; bracketLabel: string; afterTaxMonthly: number } {
  const brackets = getBrackets(province);

  const bracket = brackets.find((b) => income <= b.upTo) ?? brackets[brackets.length - 1];

  const marginalRate = bracket.rate;
  const bracketLabel = bracket.label;
  const afterTaxMonthly = (income * (1 - marginalRate / 100)) / 12;

  return { marginalRate, bracketLabel, afterTaxMonthly };
}
