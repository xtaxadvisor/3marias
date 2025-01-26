import { api } from '../api';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'succeeded' | 'failed';
  clientSecret: string;
}

export interface CreatePaymentDTO {
  amount: number;
  currency: string;
  description: string;
  metadata?: Record<string, string>;
}

export const paymentService = {
  createPaymentIntent: (data: CreatePaymentDTO) =>
    api.post<PaymentIntent>('/payments/create-intent', data),

  confirmPayment: (paymentIntentId: string) =>
    api.post<PaymentIntent>(`/payments/${paymentIntentId}/confirm`),

  getPaymentStatus: (paymentIntentId: string) =>
    api.get<PaymentIntent>(`/payments/${paymentIntentId}`),

  refundPayment: (paymentIntentId: string, amount?: number) =>
    api.post<PaymentIntent>(`/payments/${paymentIntentId}/refund`, { amount }),

  getPaymentMethods: () =>
    api.get<Array<{
      id: string;
      type: string;
      last4: string;
      expiryMonth: number;
      expiryYear: number;
    }>>('/payments/methods'),

  attachPaymentMethod: (paymentMethodId: string) =>
    api.post<void>('/payments/methods', { paymentMethodId }),

  detachPaymentMethod: (paymentMethodId: string) =>
    api.delete<void>(`/payments/methods/${paymentMethodId}`)
};