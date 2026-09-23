---
title: "About salary-calc.co.uk"
description: "salary-calc.co.uk is a free, independent UK take-home pay calculator built on confirmed 2026/27 HMRC rates and thresholds."
heroLead: "salary-calc.co.uk is a free, independent UK take-home pay calculator built on confirmed 2026/27 HMRC rates and thresholds."
image: "https://cdn.pixabay.com/photo/2017/03/27/12/11/boy-2178303_1280.jpg"
takeaways:
  - "Free UK take-home pay calculator for the 2026/27 tax year (6 April 2026 – 5 April 2027)."
  - "Covers England, Wales, Northern Ireland and Scotland, including all six Scottish tax bands."
  - "Every rate and threshold is taken directly from HMRC and GOV.UK — nothing is estimated."
  - "Runs entirely in your browser — the salary you enter is never sent to our servers."
---

## What we do

salary-calc.co.uk is a free UK take-home pay calculator for the **2026/27 tax year** (6 April 2026 – 5 April 2027). It works out what you actually keep after Income Tax, National Insurance, pension contributions and student loan repayments — covering England, Wales, Northern Ireland and Scotland. No sign-up, no email capture, just a number you can trust.

## The numbers behind the calculator

Every calculation is built from the confirmed 2026/27 rates and thresholds:

| Threshold / Rate | 2026/27 figure |
|---|---|
| Personal Allowance | £12,570 (frozen until April 2031) |
| Basic Rate | 20% on £12,570–£50,270 |
| Higher Rate | 40% on £50,271–£125,140 |
| Additional Rate | 45% above £125,140 |
| Personal Allowance taper | Reduced £1 per £2 earned over £100,000, gone by £125,140 |
| Employee National Insurance | 8% on £12,570–£50,270, then 2% above |
| Employer National Insurance | 15% above £5,000, no upper limit |
| Scottish Income Tax | Separate six-band structure, 19%–48% |
| Student Loan Plans | 1, 2, 4, 5 and Postgraduate |

Following the Autumn Budget on 26 November 2025, the Personal Allowance, higher-rate threshold and main National Insurance thresholds are now frozen until April 2031, rather than ending in 2027/28. Because these thresholds have been fixed since 2021/22, more income is pulled into higher bands each year as wages rise — this is often called fiscal drag, and it's a big part of why take-home pay feels harder to predict than it used to.

The taper between £100,000 and £125,140 is worth flagging on its own: losing £1 of Personal Allowance for every £2 earned, on top of 40% Higher Rate tax and 2% National Insurance, produces a marginal rate of around 60% — often called the "60% tax trap." It affects roughly 1.2 million people in that income band, and our calculator shows it explicitly rather than just labelling it "Higher Rate."

## Why we built it

Most salary calculators are black boxes — you put in a number, a result appears, and there's no way to check the working. We wanted something different: a calculator where every rate and threshold traces back to an official HMRC source, and where the logic behind the number is written down in plain English rather than buried in a spreadsheet.

## How the calculator works

The engine follows HMRC's published order of operations for PAYE — gross pay, pension contributions (salary sacrifice or relief at source), Personal Allowance, Income Tax, National Insurance, then student loan repayments. It supports:

- Income Tax across all UK regions, including the full set of Scottish bands
- Employee and Employer National Insurance
- Student Loan Plans 1, 2, 4, 5 and Postgraduate
- Both salary sacrifice and relief-at-source pensions
- Breakdown by hour, day, week, month and year

We update the site whenever HMRC publishes new figures — typically at the Spring or Autumn Budget, effective from the following 6 April. See our [Methodology](/methodology/) page for the full calculation logic.

## Accuracy

We test the calculator against real payroll scenarios, including the edge cases that trip up simpler tools: the Personal Allowance taper between £100,000 and £125,140, the Scottish Intermediate Rate boundary, and interactions between student loan deductions and other thresholds.

## Privacy

The calculator runs entirely in your browser. The salary figures you enter aren't sent to our servers or stored anywhere.

## Not financial advice

salary-calc.co.uk is an informational tool. It's built to be accurate, but it isn't a substitute for advice from a qualified accountant or tax adviser, particularly if your situation involves self-employment, multiple income sources, or benefits in kind. We are not affiliated with HM Revenue & Customs, HM Government, or gov.uk.

## Sources

- [GOV.UK — Income Tax rates and Personal Allowances](https://www.gov.uk/income-tax-rates)
- [GOV.UK — National Insurance rates](https://www.gov.uk/national-insurance/how-much-you-pay)
- [GOV.UK — Scottish Income Tax](https://www.gov.uk/scottish-income-tax)
- [House of Commons Library — Direct taxes: rates and allowances 2026/27](https://commonslibrary.parliament.uk/research-briefings/cbp-10618/)
