import { useNotificationStore } from '../lib/store';

export const AWS_CONFIG = {
  region: import.meta.env.VITE_AWS_REGION,
  accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
  secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  sesFromEmail: 'info@protaxadvisors.tax'
};

// Validate AWS configuration
export const validateAWSConfig = () => {
  const required = [
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY'
  ];

  const missing = required.filter(key => !import.meta.env[`VITE_${key}`]);

  if (missing.length > 0) {
    console.error('Missing AWS configuration:', missing);
    useNotificationStore.getState().addNotification(
      'Email service configuration incomplete',
      'error'
    );
    return false;
  }

  return true;
};