---
title: "Methodology"
description: "How salary-calc.co.uk calculates UK take-home pay — the exact order of operations, sources and testing behind the 2026/27 engine."
heroLead: "The exact order of operations, sources and testing behind our 2026/27 tax engine."
takeaways:
  - "Deductions are calculated in HMRC's published PAYE order: pension, then Personal Allowance, then Income Tax, then National Insurance, then student loan."
  - "Every rate and threshold is sourced directly from GOV.UK and HMRC — never from third-party calculators."
  - "The Personal Allowance taper (£100,000–£125,140) and all six Scottish bands are modelled explicitly."
  - "Figures are updated whenever HMRC publishes new rates, usually following a Spring or Autumn Budget."
---

## Order of operations

HMRC's PAYE guidance specifies a fixed sequence for calculating deductions from gross pay. Our engine follows it exactly:

1. **Gross pay** — your salary before any deductions.
2. **Pension (salary sacrifice)** — if you use salary sacrifice, your contribution is deducted from gross pay first, before tax and National Insurance are calculated. This is what makes salary sacrifice more tax-efficient than a relief-at-source pension.
3. **Personal Allowance** — £12,570 for 2026/27, tapered by £1 for every £2 of adjusted net income over £100,000, and reduced to zero at £125,140.
4. **Income Tax** — applied to income above the Personal Allowance, using either the rest-of-UK bands (20% / 40% / 45%) or the Scottish bands (19% / 20% / 21% / 42% / 45% / 48%), depending on where you're a taxpayer for Income Tax purposes.
5. **National Insurance** — calculated separately from Income Tax, using its own thresholds (aligned with the Personal Allowance and higher-rate threshold, but not identical in how they apply).
6. **Student loan repayments** — calculated last, as a percentage of income above your plan's threshold.
7. **Pension (relief at source)** — if you use a relief-at-source pension instead of salary sacrifice, your contribution is deducted from your take-home pay after tax and NI, with basic-rate tax relief added back into the pension by your provider.

## 2026/27 rates and thresholds used

| Item | Value |
|---|---|
| Personal Allowance | £12,570 |
| Basic Rate | 20% (£12,570–£50,270) |
| Higher Rate | 40% (£50,271–£125,140) |
| Additional Rate | 45% (above £125,140) |
| Personal Allowance taper | £1 lost per £2 earned over £100,000 |
| Employee NI | 8% (£12,570–£50,270), 2% above |
| Employer NI | 15% above £5,000 |
| Scottish Starter Rate | 19% |
| Scottish Basic Rate | 20% |
| Scottish Intermediate Rate | 21% |
| Scottish Higher Rate | 42% |
| Scottish Advanced Rate | 45% |
| Scottish Top Rate | 48% |

Thresholds are frozen at these levels until April 2031, following the extension announced at the Autumn Budget on 26 November 2025.

## Student loan plans

We model all five active repayment plans, each with its own threshold and rate:

- **Plan 1** — repayments above £26,900, at 9%
- **Plan 2** — repayments above £29,385, at 9%
- **Plan 4 (Scotland)** — repayments above £33,795, at 9%
- **Plan 5** — repayments above £25,000, at 9%
- **Postgraduate Loan** — repayments above £21,000, at 6% (payable alongside an undergraduate plan if you have both)

## Scottish Income Tax

Income Tax is devolved to the Scottish Parliament, which sets its own six-band structure, separate from National Insurance, dividend tax and savings tax, which remain UK-wide. Whether you pay Scottish rates depends on where your main home is, not where you work — we apply the Scottish bands only when you select Scotland as your region.

## Sources

Every figure in the calculator traces back to a primary source, never a secondary calculator or aggregator:

- [GOV.UK — Income Tax rates and Personal Allowances](https://www.gov.uk/income-tax-rates)
- [GOV.UK — National Insurance rates](https://www.gov.uk/national-insurance/how-much-you-pay)
- [GOV.UK — Scottish Income Tax](https://www.gov.uk/scottish-income-tax)
- [GOV.UK — Repaying your student loan](https://www.gov.uk/repaying-your-student-loan/what-you-pay)
- [House of Commons Library — Direct taxes: rates and allowances 2026/27](https://commonslibrary.parliament.uk/research-briefings/cbp-10618/)

## How we test it

We run the engine against a set of hand-built payroll scenarios covering the edge cases that most calculators miss — the Personal Allowance taper, the Scottish Intermediate Rate boundary, salary sacrifice combined with a student loan, and combinations of multiple thresholds at once. When HMRC updates a rate, we update the engine and re-run the full test set before publishing.

## Corrections

If you find a figure that doesn't match HMRC's published rates, please [contact us](/contact/) with the salary, tax year and region you used. We investigate every report.
