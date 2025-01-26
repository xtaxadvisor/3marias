{`import { useNotificationStore } from '../../lib/store';

export class AuthorizeNetService {
  private static instance: AuthorizeNetService;
  private readonly loginId: string = import.meta.env.VITE_AUTHORIZE_LOGIN_ID;
  private readonly clientKey: string = import.meta.env.VITE_AUTHORIZE_CLIENT_KEY;

  private constructor() {
    if (!this.loginId || !this.clientKey) {
      throw new Error('Authorize.net credentials not configured');
    }
  }

  public static getInstance(): AuthorizeNetService {
    if (!AuthorizeNetService.instance) {
      AuthorizeNetService.instance = new AuthorizeNetService();
    }
    return AuthorizeNetService.instance;
  }

  async processPayment(paymentData: {
    amount: number;
    cardNumber: string;
    expirationDate: string;
    cardCode: string;
  }) {
    try {
      // Implementation would go here
      return {
        success: true,
        transactionId: 'mock_transaction_id'
      };
    } catch (error) {
      useNotificationStore.getState().addNotification(
        'Payment processing failed',
        'error'
      );
      throw error;
    }
  }

  async validateConfiguration(): Promise<boolean> {
    return this.loginId === '5S35UDg3cec8';
  }
}

export const authorizeNetService = AuthorizeNetService.getInstance();`}