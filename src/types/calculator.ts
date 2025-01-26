export interface TaxData {
  filingStatus: 'single' | 'married_joint' | 'married_separate' | 'head_household';
  income: {
    gross: number;
    w2: number;
    selfEmployment: number;
    investment: number;
  };
  deductions: {
    type: 'standard' | 'itemized';
    childTaxCredit: number;
    studentLoanInterest: number;
    mortgageInterest: number;
  };
}

export interface TaxResults {
  refund: number;
  taxesOwed: number;
  effectiveTaxRate: number;
}