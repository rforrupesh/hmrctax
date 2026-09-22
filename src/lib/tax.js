// Shared UK Income Tax + NI calculation logic — 2025/26 tax year
// Used by both the interactive calculator and the static salary pages.

export function calcIncomeTax(taxable, scottish = false) {
  let bands;
  if (scottish) {
    bands = [
      { limit: 2827, rate: 0.19, name: 'Starter rate' },
      { limit: 14921 - 2827, rate: 0.20, name: 'Basic rate' },
      { limit: 31092 - 14921, rate: 0.21, name: 'Intermediate rate' },
      { limit: 62430 - 31092, rate: 0.42, name: 'Higher rate' },
      { limit: 75000 - 62430, rate: 0.45, name: 'Advanced rate' },
      { limit: Infinity, rate: 0.48, name: 'Top rate' },
    ];
  } else {
    bands = [
      { limit: 37700, rate: 0.20, name: 'Basic rate' },
      { limit: 112500 - 37700, rate: 0.40, name: 'Higher rate' },
      { limit: Infinity, rate: 0.45, name: 'Additional rate' },
    ];
  }
  let remaining = taxable, rows = [], total = 0;
  for (const b of bands) {
    if (remaining <= 0) break;
    const amt = Math.min(remaining, b.limit);
    if (amt > 0) {
      const tax = amt * b.rate;
      rows.push({ name: b.name, rate: b.rate, amount: amt, tax });
      total += tax;
    }
    remaining -= amt;
  }
  return { rows, total };
}

export function calcNI(gross) {
  const PT = 12570, UEL = 50270;
  let ni = 0, rows = [];
  if (gross > PT) {
    const mainBand = Math.min(gross, UEL) - PT;
    if (mainBand > 0) {
      const t = mainBand * 0.08;
      ni += t;
      rows.push({ name: 'National Insurance', rate: 0.08, amount: mainBand, tax: t });
    }
  }
  if (gross > UEL) {
    const upperBand = gross - UEL;
    const t = upperBand * 0.02;
    ni += t;
    rows.push({ name: 'National Insurance (upper)', rate: 0.02, amount: upperBand, tax: t });
  }
  return { rows, total: ni };
}

export function calculateTax(salary, { scottish = false, studentLoan = false, pensionPct = 0 } = {}) {
  const pensionAmt = salary * (pensionPct / 100);
  const grossForTax = salary - pensionAmt;

  let PA = 12570;
  if (grossForTax > 100000) PA = Math.max(0, 12570 - (grossForTax - 100000) / 2);
  const taxableIncome = Math.max(0, grossForTax - PA);

  const incomeTaxRes = calcIncomeTax(taxableIncome, scottish);
  const niRes = calcNI(grossForTax);

  let studentLoanAmt = 0;
  const SL_THRESHOLD = 27295;
  if (studentLoan && grossForTax > SL_THRESHOLD) {
    studentLoanAmt = (grossForTax - SL_THRESHOLD) * 0.09;
  }

  const totalDeductions = incomeTaxRes.total + niRes.total + studentLoanAmt + pensionAmt;
  const net = salary - totalDeductions;

  return {
    salary,
    pensionAmt: Math.round(pensionAmt),
    tax: Math.round(incomeTaxRes.total),
    ni: Math.round(niRes.total),
    studentLoan: Math.round(studentLoanAmt),
    net: Math.round(net),
    monthly: Math.round(net / 12),
    weekly: Math.round(net / 52),
    daily: Math.round((net / 52 / 5) * 100) / 100,
    taxRows: incomeTaxRes.rows,
    niRows: niRes.rows,
    personalAllowance: Math.round(PA),
  };
}

export function fmt(n) {
  return '£' + Math.round(n).toLocaleString('en-GB');
}

// The master salary list — used by getStaticPaths for BOTH the salary pages
// and the OG image generator script, so they always stay in sync.
export function getSalaryList() {
  const salaries = new Set();
  for (let s = 10000; s <= 50000; s += 1000) salaries.add(s);
  for (let s = 52000; s <= 100000; s += 2000) salaries.add(s);
  for (let s = 110000; s <= 250000; s += 10000) salaries.add(s);
  [1000, 1200, 1500, 2000, 5000, 125140].forEach((s) => salaries.add(s));
  return Array.from(salaries).sort((a, b) => a - b);
}
