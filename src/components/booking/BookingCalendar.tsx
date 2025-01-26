{`import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay, isToday, isBefore, addMinutes } from 'date-fns';
import { Calendar, Clock, Video, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';
import { useConsultation } from '../../hooks/useConsultation';
import { useNotificationStore } from '../../lib/store';
import type { TimeSlot } from '../../types';

interface BookingCalendarProps {
  professionalId: string;
  serviceType: string;
  duration: number;
  onTimeSelected: (startTime: Date) => void;
}

export function BookingCalendar({
  professionalId,
  serviceType,
  duration,
  onTimeSelected
}: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const { consultation, isLoading } = useConsultation();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    async function fetchAvailability() {
      try {
        const slots = await consultationService.getAvailability(
          selectedDate.toISOString(),
          professionalId
        );
        setAvailableSlots(slots);
      } catch (error) {
        addNotification('Failed to fetch availability', 'error');
      }
    }

    fetchAvailability();
  }, [selectedDate, professionalId]);

  // Rest of the component implementation...
  return (
    <div className="space-y-6">
      {/* Calendar implementation */}
    </div>
  );
}`}