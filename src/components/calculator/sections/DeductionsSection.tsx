import React from 'react';
import { DollarSign } from 'lucide-react';
import { Input } from '../../ui/Input';
import { formatCurrency } from '../../../utils/format';

interface DeductionsSectionProps {
  values: {
    type: 'standard' | 'itemized';
    childTaxCredit: number;
    studentLoanInterest: number;
    mortgageInterest: number;
  };
  onChange: (values: any) => void;
}

export function DeductionsSection({ values, onChange }: DeductionsSectionProps) {
  const handleChange = (field: string, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    const amount = numericValue ? parseInt(numericValue, 10) : 0;
    onChange({ ...values, [field]: amount });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Deductions & Credits</h2>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              checked={values.type === 'standard'}
              onChange={() => onChange({ ...values, type: 'standard' })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Standard Deduction</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="radio"
              checked={values.type === 'itemized'}
              onChange={() => onChange({ ...values, type: 'itemized' })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Itemized Deduction</span>
          </label>
        </div>

        <Input
          label="Child Tax Credit"
          icon={DollarSign}
          value={formatCurrency(values.childTaxCredit)}
          onChange={(e) => handleChange('childTaxCredit', e.target.value)}
          placeholder="0.00"
        />

        <Input
          label="Student Loan Interest"
          icon={DollarSign}
          value={formatCurrency(values.studentLoanInterest)}
          onChange={(e) => handleChange('studentLoanInterest', e.target.value)}
          placeholder="0.00"
        />

        <Input
          label="Mortgage Interest"
          icon={DollarSign}
          value={formatCurrency(values.mortgageInterest)}
          onChange={(e) => handleChange('mortgageInterest', e.target.value)}
          placeholder="0.00"
        />
      </div>
    </div>
  );
}