import { supabase } from '../../lib/supabase/client';
import { useNotificationStore } from '../../lib/store';

export class SyncManager {
  private static instance: SyncManager;
  private subscriptions: Array<{ unsubscribe: () => void }> = [];

  private constructor() {
    this.setupRealtime();
  }

  public static getInstance(): SyncManager {
    if (!SyncManager.instance) {
      SyncManager.instance = new SyncManager();
    }
    return SyncManager.instance;
  }

  private setupRealtime() {
    // Subscribe to bookings changes
    const bookingSubscription = supabase
      .channel('bookings')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'consultations'
      }, payload => {
        this.handleBookingChange(payload);
      })
      .subscribe();

    // Subscribe to payments changes
    const paymentSubscription = supabase
      .channel('payments')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'payments'
      }, payload => {
        this.handlePaymentChange(payload);
      })
      .subscribe();

    this.subscriptions.push(bookingSubscription, paymentSubscription);
  }

  private handleBookingChange(payload: any) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    
    switch (eventType) {
      case 'INSERT':
        this.syncNewBooking(newRecord);
        break;
      case 'UPDATE':
        this.syncBookingUpdate(newRecord, oldRecord);
        break;
      case 'DELETE':
        this.syncBookingDeletion(oldRecord);
        break;
    }
  }

  private handlePaymentChange(payload: any) {
    const { eventType, new: newRecord } = payload;
    
    if (eventType === 'UPDATE' && newRecord.status === 'succeeded') {
      this.syncPaymentConfirmation(newRecord);
    }
  }

  private async syncNewBooking(booking: any) {
    try {
      // Sync with calendar
      await this.syncWithCalendar(booking);
      
      // Send notifications
      await this.sendBookingNotifications(booking);
      
      useNotificationStore.getState().addNotification(
        'Booking synchronized successfully',
        'success'
      );
    } catch (error) {
      console.error('Booking sync failed:', error);
      useNotificationStore.getState().addNotification(
        'Failed to synchronize booking',
        'error'
      );
    }
  }

  private async syncBookingUpdate(newBooking: any, oldBooking: any) {
    try {
      // Update calendar event
      await this.updateCalendarEvent(newBooking);
      
      // Send update notifications
      await this.sendUpdateNotifications(newBooking, oldBooking);
    } catch (error) {
      console.error('Booking update sync failed:', error);
    }
  }

  private async syncBookingDeletion(booking: any) {
    try {
      // Remove from calendar
      await this.removeFromCalendar(booking);
      
      // Send cancellation notifications
      await this.sendCancellationNotifications(booking);
    } catch (error) {
      console.error('Booking deletion sync failed:', error);
    }
  }

  private async syncPaymentConfirmation(payment: any) {
    try {
      // Update booking status
      await this.updateBookingStatus(payment.bookingId, 'confirmed');
      
      // Send payment confirmation
      await this.sendPaymentConfirmation(payment);
    } catch (error) {
      console.error('Payment sync failed:', error);
    }
  }

  private async syncWithCalendar(booking: any) {
    // Implementation for calendar sync
  }

  private async updateCalendarEvent(booking: any) {
    // Implementation for calendar event update
  }

  private async removeFromCalendar(booking: any) {
    // Implementation for calendar event removal
  }

  private async sendBookingNotifications(booking: any) {
    // Implementation for booking notifications
  }

  private async sendUpdateNotifications(newBooking: any, oldBooking: any) {
    // Implementation for update notifications
  }

  private async sendCancellationNotifications(booking: any) {
    // Implementation for cancellation notifications
  }

  private async sendPaymentConfirmation(payment: any) {
    // Implementation for payment confirmation
  }

  private async updateBookingStatus(bookingId: string, status: string) {
    // Implementation for booking status update
  }

  public cleanup() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }
}

export const syncManager = SyncManager.getInstance();