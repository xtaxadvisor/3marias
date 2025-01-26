import React from 'react';
import { DollarSign } from 'lucide-react';
import { Input } from '../../ui/Input';
import { formatCurrency } from '../../../utils/format';

interface IncomeSectionProps {
  values: {
    gross: number;
    w2: number;
    selfEmployment: number;
    investment: number;
  };
  onChange: (values: any) => void;
}

export function IncomeSection({ values, onChange }: IncomeSectionProps) {
  const handleChange = (field: string, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    const amount = numericValue ? parseInt(numericValue, 10) : 0;
    onChange({ ...values, [field]: amount });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900">Income Information</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Annual Gross Income
          </label>
          <input
            type="range"
            min="0"
            max="1000000"
            step="1000"
            value={values.gross}
            onChange={(e) => handleChange('gross', e.target.value)}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="mt-2 text-sm font-medium text-gray-900">
            {formatCurrency(values.gross)}
          </div>
        </div>

        <Input
          label="W-2 Employment Income"
          icon={DollarSign}
          value={formatCurrency(values.w2)}
          onChange={(e) => handleChange('w2', e.target.value)}
          placeholder="0.00"
        />

        <Input
          label="Self-Employment Income"
          icon={DollarSign}
          value={formatCurrency(values.selfEmployment)}
          onChange={(e) => handleChange('selfEmployment', e.target.value)}
          placeholder="0.00"
        />

        <Input
          label="Investment Income"
          icon={DollarSign}
          value={formatCurrency(values.investment)}
          onChange={(e) => handleChange('investment', e.target.value)}
          placeholder="0.00"
        />
      </div>
    </div>
  );
}