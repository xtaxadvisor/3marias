import React, { useState } from 'react';
import { Calculator, Save, Download, Info } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotificationStore } from '../../lib/store';
import { Button } from '../ui/Button';
import { IncomeSection } from './sections/IncomeSection';
import { FilingStatusSection } from './sections/FilingStatusSection';
import { DeductionsSection } from './sections/DeductionsSection';
import { CalculationResults } from './sections/CalculationResults';
import { ProgressBar } from './components/ProgressBar';
import { LoginPrompt } from './components/LoginPrompt';
import { calculateTaxes } from '../../utils/taxCalculations';
import type { TaxData } from '../../types/calculator';

export function TaxCalculator() {
  const { isAuthenticated } = useAuth();
  const { addNotification } = useNotificationStore();
  const [formComplete, setFormComplete] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  
  const [taxData, setTaxData] = useState<TaxData>({
    filingStatus: 'single',
    income: {
      gross: 0,
      w2: 0,
      selfEmployment: 0,
      investment: 0
    },
    deductions: {
      type: 'standard',
      childTaxCredit: 0,
      studentLoanInterest: 0,
      mortgageInterest: 0
    }
  });

  const [results, setResults] = useState<{
    refund: number;
    taxesOwed: number;
    effectiveTaxRate: number;
  } | null>(null);

  const handleInputChange = (section: keyof TaxData, data: any) => {
    setTaxData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
    
    // Calculate form completion percentage
    const totalFields = 8; // Total number of required fields
    const completedFields = Object.values(taxData).flat().filter(Boolean).length;
    setFormComplete((completedFields / totalFields) * 100);
    
    // Recalculate taxes
    const newResults = calculateTaxes(taxData);
    setResults(newResults);
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    
    // Save calculation logic here
    addNotification('Calculation saved successfully', 'success');
  };

  const handleDownload = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
      return;
    }
    
    // Download PDF logic here
    addNotification('PDF generated successfully', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calculator className="h-8 w-8 mr-3" />
              <h1 className="text-2xl font-bold">Tax Return Calculator</h1>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                icon={Save}
                onClick={handleSave}
                className="text-white border-white hover:bg-white hover:text-blue-600"
              >
                Save
              </Button>
              <Button
                variant="outline"
                icon={Download}
                onClick={handleDownload}
                className="text-white border-white hover:bg-white hover:text-blue-600"
              >
                Download PDF
              </Button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <ProgressBar percentage={formComplete} />

          <div className="space-y-8 mt-6">
            <FilingStatusSection
              value={taxData.filingStatus}
              onChange={(value) => handleInputChange('filingStatus', value)}
            />

            <IncomeSection
              values={taxData.income}
              onChange={(values) => handleInputChange('income', values)}
            />

            <DeductionsSection
              values={taxData.deductions}
              onChange={(values) => handleInputChange('deductions', values)}
            />

            {results && <CalculationResults results={results} />}

            <div className="bg-blue-50 rounded-lg p-4 mt-6">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Disclaimer:</p>
                  <p>This calculator provides a rough estimate only and should not be considered an official calculation. For accurate tax planning, please consult with our certified tax professionals.</p>
                  <div className="mt-2">
                    <a href="/services" className="text-blue-600 hover:text-blue-800 font-medium">
                      Learn about our professional tax services →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showLoginPrompt && (
        <LoginPrompt
          onClose={() => setShowLoginPrompt(false)}
          feature={results ? 'save your calculation' : 'access all features'}
        />
      )}
    </div>
  );
}