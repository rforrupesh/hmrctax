// UK Tax Year 2024/25 rates — update every April
export const TAX_YEAR = '2024/25';

export const RULES = {
  personalAllowance: 12570,
  personalAllowanceTaperStart: 100000, // £1 lost per £2 above this
  bands: [
    { name: 'Basic rate', upTo: 50270, rate: 0.20 },
    { name: 'Higher rate', upTo: 125140, rate: 0.40 },
    { name: 'Additional rate', upTo: Infinity, rate: 0.45 }
  ],
  ni: {
    primaryThreshold: 12570,
    upperEarningsLimit: 50270,
    mainRate: 0.08,
    upperRate: 0.02
  }
};

function taperedAllowance(salary) {
  if (salary <= RULES.personalAllowanceTaperStart) return RULES.personalAllowance;
  const reduction = Math.floor((salary - RULES.personalAllowanceTaperStart) / 2);
  return Math.max(0, RULES.personalAllowance - reduction);
}

export function calculateTax(salaryInput) {
  const salary = Number(salaryInput) || 0;
  const allowance = taperedAllowance(salary);
  let taxable = Math.max(0, salary - allowance);

  let incomeTax = 0;
  let lastCap = 0;
  for (const band of RULES.bands) {
    const bandCeiling = band.upTo === Infinity ? Infinity : band.upTo - allowance;
    const bandFloor = lastCap;
    if (taxable > bandFloor) {
      const amountInBand = Math.min(taxable, bandCeiling) - bandFloor;
      if (amountInBand > 0) incomeTax += amountInBand * band.rate;
    }
    lastCap = bandCeiling;
  }

  // National Insurance (Class 1, employee)
  let ni = 0;
  if (salary > RULES.ni.primaryThreshold) {
    const uelSlice = Math.min(salary, RULES.ni.upperEarningsLimit) - RULES.ni.primaryThreshold;
    ni += Math.max(0, uelSlice) * RULES.ni.mainRate;
    if (salary > RULES.ni.upperEarningsLimit) {
      ni += (salary - RULES.ni.upperEarningsLimit) * RULES.ni.upperRate;
    }
  }

  const takeHome = salary - incomeTax - ni;

  return {
    salary,
    taxYear: TAX_YEAR,
    personalAllowance: allowance,
    incomeTax: round2(incomeTax),
    nationalInsurance: round2(ni),
    takeHomeAnnual: round2(takeHome),
    takeHomeMonthly: round2(takeHome / 12),
    takeHomeWeekly: round2(takeHome / 52),
    effectiveRate: salary > 0 ? round2(((incomeTax + ni) / salary) * 100) : 0
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

// Salary points that get their own static page — round numbers people actually search.
export function getSalaryPoints() {
  const points = [];
  for (let s = 10000; s <= 50000; s += 1000) points.push(s);
  for (let s = 52000; s <= 100000; s += 2000) points.push(s);
  for (let s = 105000; s <= 200000; s += 5000) points.push(s);
  return [...new Set(points)];
}

export function formatGBP(n) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(n);
}
