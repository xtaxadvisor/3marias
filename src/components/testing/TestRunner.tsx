import React, { useState } from 'react';
import { Play, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Button } from '../ui/Button';
import { runAllTests } from '../../services/testing';
import { useNotificationStore } from '../../lib/store';

export function TestRunner() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { addNotification } = useNotificationStore();

  const handleRunTests = async () => {
    setIsRunning(true);
    try {
      const testResults = await runAllTests();
      setResults(testResults);
      
      // Check for failures and notify
      const failures = Object.entries(testResults)
        .filter(([_, result]: [string, any]) => !result.success)
        .map(([service]: [string, any]) => service);
      
      if (failures.length > 0) {
        addNotification(
          `Tests failed for: ${failures.join(', ')}. Check console for details.`,
          'error'
        );
      } else {
        addNotification('All tests passed successfully', 'success');
      }
    } catch (error) {
      console.error('Test execution failed:', error);
      addNotification('Test execution failed', 'error');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Infrastructure Tests</h2>
        <Button
          variant="primary"
          onClick={handleRunTests}
          disabled={isRunning}
          icon={isRunning ? Loader : Play}
        >
          {isRunning ? 'Running Tests...' : 'Run Tests'}
        </Button>
      </div>

      {results && (
        <div className="space-y-6">
          {Object.entries(results).map(([service, result]: [string, any]) => (
            <div key={service} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 capitalize">{service} Test</h3>
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
              {!result.success && result.error && (
                <div className="text-sm text-red-600">
                  Error: {result.error}
                </div>
              )}
              {result.details && (
                <pre className="mt-2 text-sm text-gray-600 overflow-auto">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}