import type { TaxData, TaxResults } from '../types/calculator';

export function calculateTaxes(data: TaxData): TaxResults {
  // Calculate total income
  const totalIncome = data.income.w2 + 
                     data.income.selfEmployment + 
                     data.income.investment;

  // Calculate deductions
  let totalDeductions = 0;
  if (data.deductions.type === 'standard') {
    // 2024 Standard Deduction amounts
    switch (data.filingStatus) {
      case 'single':
        totalDeductions = 14600;
        break;
      case 'married_joint':
        totalDeductions = 29200;
        break;
      case 'married_separate':
        totalDeductions = 14600;
        break;
      case 'head_household':
        totalDeductions = 21900;
        break;
    }
  } else {
    // Itemized deductions
    totalDeductions = data.deductions.mortgageInterest +
                     data.deductions.studentLoanInterest;
  }

  // Calculate taxable income
  const taxableIncome = Math.max(0, totalIncome - totalDeductions);

  // Calculate base tax using 2024 tax brackets
  let baseTax = 0;
  if (data.filingStatus === 'single' || data.filingStatus === 'married_separate') {
    if (taxableIncome <= 11600) {
      baseTax = taxableIncome * 0.10;
    } else if (taxableIncome <= 47150) {
      baseTax = 1160 + (taxableIncome - 11600) * 0.12;
    } else if (taxableIncome <= 100525) {
      baseTax = 5426 + (taxableIncome - 47150) * 0.22;
    } else if (taxableIncome <= 191950) {
      baseTax = 17168.50 + (taxableIncome - 100525) * 0.24;
    } else if (taxableIncome <= 243725) {
      baseTax = 39110.50 + (taxableIncome - 191950) * 0.32;
    } else if (taxableIncome <= 609350) {
      baseTax = 55678.50 + (taxableIncome - 243725) * 0.35;
    } else {
      baseTax = 183647.25 + (taxableIncome - 609350) * 0.37;
    }
  }
  // Add other filing status tax calculations as needed

  // Apply credits
  const totalCredits = data.deductions.childTaxCredit;
  const finalTax = Math.max(0, baseTax - totalCredits);

  // Calculate effective tax rate
  const effectiveTaxRate = totalIncome > 0 
    ? (finalTax / totalIncome) * 100 
    : 0;

  // Determine refund or amount owed
  // This is a simplified calculation - in reality, would need to consider withholdings
  const estimatedWithholding = data.income.w2 * 0.20; // Assume 20% withholding on W-2 income
  const refundOrOwed = estimatedWithholding - finalTax;

  return {
    refund: Math.max(0, refundOrOwed),
    taxesOwed: Math.max(0, -refundOrOwed),
    effectiveTaxRate
  };
}