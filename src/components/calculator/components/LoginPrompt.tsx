import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '../../ui/Button';

interface LoginPromptProps {
  onClose: () => void;
  feature: string;
}

export function LoginPrompt({ onClose, feature }: LoginPromptProps) {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Login Required
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            Please log in or create an account to {feature}.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => navigate('/login')}
          >
            Log In
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/register')}
          >
            Create Account
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            onClick={onClose}
          >
            Continue as Guest
          </Button>
        </div>
      </div>
    </div>
  );
}