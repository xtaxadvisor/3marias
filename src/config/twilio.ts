import { useNotificationStore } from '../lib/store';

export const TWILIO_CONFIG = {
  accountSid: import.meta.env.VITE_TWILIO_ACCOUNT_SID,
  authToken: import.meta.env.VITE_TWILIO_AUTH_TOKEN,
  phoneNumber: import.meta.env.VITE_TWILIO_PHONE_NUMBER,
  whatsappNumber: import.meta.env.VITE_TWILIO_WHATSAPP_NUMBER,
  messagingServiceSid: import.meta.env.VITE_TWILIO_MESSAGING_SERVICE_SID
};

// Validate Twilio configuration
export const validateTwilioConfig = () => {
  const required = [
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_PHONE_NUMBER'
  ];

  const missing = required.filter(key => !import.meta.env[`VITE_${key}`]);

  if (missing.length > 0) {
    console.error('Missing Twilio configuration:', missing);
    useNotificationStore.getState().addNotification(
      'Communication services configuration incomplete',
      'error'
    );
    return false;
  }

  return true;
};