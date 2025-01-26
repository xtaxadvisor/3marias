import React from 'react';
import { Select } from '../../ui/Select';

interface FilingStatusSectionProps {
  value: string;
  onChange: (value: string) => void;
}

export function FilingStatusSection({ value, onChange }: FilingStatusSectionProps) {
  const filingStatuses = [
    { value: 'single', label: 'Single' },
    { value: 'married_joint', label: 'Married Filing Jointly' },
    { value: 'married_separate', label: 'Married Filing Separately' },
    { value: 'head_household', label: 'Head of Household' }
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Filing Status</h2>
      <Select
        label="Select your filing status"
        options={filingStatuses}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}