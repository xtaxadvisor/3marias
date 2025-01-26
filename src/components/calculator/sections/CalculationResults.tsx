import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency } from '../../../utils/format';

interface CalculationResultsProps {
  results: {
    refund: number;
    taxesOwed: number;
    effectiveTaxRate: number;
  };
}

export function CalculationResults({ results }: CalculationResultsProps) {
  const isRefund = results.refund > 0;

  return (
    <div className="bg-gray-50 rounded-xl p-6 mt-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Calculation Results</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`rounded-lg p-4 ${
          isRefund ? 'bg-green-100' : 'bg-red-100'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">
              {isRefund ? 'Expected Refund' : 'Taxes Owed'}
            </span>
            {isRefund ? (
              <ArrowUp className="h-5 w-5 text-green-600" />
            ) : (
              <ArrowDown className="h-5 w-5 text-red-600" />
            )}
          </div>
          <div className={`text-2xl font-bold mt-2 ${
            isRefund ? 'text-green-700' : 'text-red-700'
          }`}>
            {formatCurrency(isRefund ? results.refund : results.taxesOwed)}
          </div>
        </div>

        <div className="bg-blue-100 rounded-lg p-4">
          <span className="text-sm font-medium text-gray-600">
            Effective Tax Rate
          </span>
          <div className="text-2xl font-bold text-blue-700 mt-2">
            {results.effectiveTaxRate.toFixed(1)}%
          </div>
        </div>

        <div className="bg-purple-100 rounded-lg p-4">
          <span className="text-sm font-medium text-gray-600">
            Total Tax Liability
          </span>
          <div className="text-2xl font-bold text-purple-700 mt-2">
            {formatCurrency(results.taxesOwed)}
          </div>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        * These calculations are estimates based on the information provided and current tax rates.
        For a detailed analysis, please consult with our tax professionals.
      </div>
    </div>
  );
}