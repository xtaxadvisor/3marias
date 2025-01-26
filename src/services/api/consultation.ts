import { api } from '../api';
import { addMinutes, format } from 'date-fns';
import type { TimeSlot } from '../../types';

export interface Consultation {
  id: string;
  clientId: string;
  professionalId: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  type: 'tax-planning' | 'financial-review' | 'investment-advisory' | 'general';
  meetingLink?: string;
  notes?: string;
  documents?: string[];
  recording?: string;
  isVirtual: boolean;
}

export interface ScheduleConsultationDTO {
  clientId: string;
  professionalId: string;
  startTime: string;
  endTime: string;
  type: Consultation['type'];
  notes?: string;
  isVirtual?: boolean;
}

export interface UpdateConsultationDTO extends Partial<ScheduleConsultationDTO> {
  id: string;
  status?: Consultation['status'];
}

export const consultationService = {
  getAll: () => 
    api.get<Consultation[]>('/consultations'),

  getById: (id: string) => 
    api.get<Consultation>(`/consultations/${id}`),

  getByClient: (clientId: string) => 
    api.get<Consultation[]>(`/clients/${clientId}/consultations`),

  getByProfessional: (professionalId: string) => 
    api.get<Consultation[]>(`/professionals/${professionalId}/consultations`),

  getAvailability: async (date: string, professionalId: string, duration: number = 60) => {
    const response = await api.get<TimeSlot[]>('/consultations/availability', {
      params: { date, professionalId, duration }
    });

    // Process the slots to ensure they're properly formatted
    return response.map(slot => ({
      ...slot,
      startTime: new Date(slot.startTime).toISOString(),
      endTime: new Date(slot.endTime).toISOString()
    }));
  },

  schedule: async (data: ScheduleConsultationDTO) => {
    // Validate time slot availability before scheduling
    const availability = await consultationService.getAvailability(
      data.startTime,
      data.professionalId
    );

    const requestedSlot = {
      startTime: new Date(data.startTime).toISOString(),
      endTime: new Date(data.endTime).toISOString()
    };

    const isAvailable = availability.some(slot =>
      slot.startTime === requestedSlot.startTime &&
      slot.endTime === requestedSlot.endTime &&
      slot.available
    );

    if (!isAvailable) {
      throw new Error('Selected time slot is no longer available');
    }

    return api.post<Consultation>('/consultations', data);
  },

  update: ({ id, ...data }: UpdateConsultationDTO) => 
    api.put<Consultation>(`/consultations/${id}`, data),

  cancel: (id: string, reason?: string) => 
    api.put<Consultation>(`/consultations/${id}/cancel`, { reason }),

  generateMeetingLink: (id: string) => 
    api.post<{ meetingLink: string }>(`/consultations/${id}/meeting-link`),

  uploadDocument: (id: string, file: File) => {
    const formData = new FormData();
    formData.append('document', file);
    return api.post<{ documentId: string }>(`/consultations/${id}/documents`, formData);
  },

  getRecording: (id: string) => 
    api.get<{ recordingUrl: string }>(`/consultations/${id}/recording`),

  // New helper methods for the booking calendar
  generateTimeSlots: (date: Date, duration: number = 30): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    let currentTime = new Date(date);
    currentTime.setHours(9, 0, 0, 0); // Start at 9 AM

    const endTime = new Date(date);
    endTime.setHours(17, 0, 0, 0); // End at 5 PM

    while (currentTime < endTime) {
      const slotEnd = addMinutes(currentTime, duration);
      slots.push({
        startTime: currentTime.toISOString(),
        endTime: slotEnd.toISOString(),
        available: true
      });
      currentTime = slotEnd;
    }

    return slots;
  },

  checkSlotAvailability: async (
    startTime: string,
    endTime: string,
    professionalId: string
  ): Promise<boolean> => {
    try {
      const response = await api.get<{ available: boolean }>('/consultations/check-availability', {
        params: { startTime, endTime, professionalId }
      });
      return response.available;
    } catch (error) {
      console.error('Error checking slot availability:', error);
      return false;
    }
  }
};