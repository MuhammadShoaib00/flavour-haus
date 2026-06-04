import { Injectable, Logger } from '@nestjs/common';
import { CalendarEventRepository } from '../repositories/calendar-event.repository';
import {
  AddCalendarBookingDto,
  AddCalendarReminderDto,
  GetCalendarEventsDto,
} from '../dto/calendar';
import { Types } from 'mongoose';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);

  constructor(private eventRepository: CalendarEventRepository) { }

  async getCalendarEvents({ userId, title }: GetCalendarEventsDto) {
    try {
      let events = [];
      if (!title) {
        const calendarEvents = await this.eventRepository.find(
          { userIds: userId },
          { userIds: 0 },
        );
        events = calendarEvents?.map(({ _id: id, ...calendarEvent }) => ({
          id,
          className: calendarEvent.className,
          allDay: calendarEvent?.allDay,
          title: calendarEvent.title,
          date: calendarEvent.date,
          extendedProps: {
            bookingId: calendarEvent.bookingId
          },
          start: calendarEvent?.start?.toISOString()?.split('.')?.[0],
          end: calendarEvent?.end?.toISOString()?.split('.')?.[0],
        }));
      } else {
        const calendarEvents = await this.eventRepository.find(
          {
            userIds: userId,
            title: { $regex: RegExp(title, 'i') },
          },
          { userIds: 0 },
        );

        events = calendarEvents?.map(({ _id: id, ...calendarEvent }) => ({
          id,
          className: calendarEvent.className,
          allDay: calendarEvent?.allDay,
          title: calendarEvent.title,
          date: calendarEvent.date,
          start: calendarEvent?.start?.toISOString()?.split('.')?.[0],
          end: calendarEvent?.end?.toISOString()?.split('.')?.[0],
          extendedProps: {
            bookingId: calendarEvent.bookingId
          },
        }));
      }

      return {
        data: [...events],
        message: '',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async addCalendarBooking({ hostId, guestId, start, end, date, ...dto }: AddCalendarBookingDto) {
    try {
      let bookingSlot = "parties";
      const timeSlots = {
        breakfast: {
          start: '7:00:00',
          end: '10:00:00'
        },
        lunch: {
          start: '10:00:00',
          end: '12:00:00'
        },
        brunch: {
          start: '12:00:00',
          end: '17:00:00'
        },
        dinner: {
          start: '17:00:00',
          end: '23:59:59'
        }
      };
      if (start !== 'Full Day' && end !== 'Full Day') {
        Object.keys(timeSlots).forEach((slot) => {
          const startTime = new Date(`1970-01-01T${timeSlots[slot].start}`);
          const endTime = new Date(`1970-01-01T${timeSlots[slot].end}`);
          const startBookingTime = new Date(`1970-01-01T${start}`);
          const endBookingTime = new Date(`1970-01-01T${end}`);
          if (startBookingTime >= startTime && endBookingTime <= endTime) {
            bookingSlot = slot
          }
        });
      }

      const {
        _id: id,
        userIds,
        ...calendarEvent
      } = await this.eventRepository.create({
        ...dto,
        className: `${bookingSlot}-bg`,
        date: date,
        ...(start === 'Full Day' && end === 'Full Day' ? { allDay: true } : {
          start: new Date(`${date}T${start}`),
          end: new Date(`${date}T${end}`),
        }),
        bookingId: new Types.ObjectId(dto.bookingId),
        userIds: [guestId, hostId],
      });
      return {
        data: null,
        message: 'Updated the calendar successfully.',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async addCalendarReminder({ userId, time, ...dto }: AddCalendarReminderDto) {
    try {
      const {
        _id: id,
        userIds,
        ...calendarEvent
      } = await this.eventRepository.create({
        ...dto,
        start: new Date(`${dto.date}T${time}`),
        userIds: [userId],
      });

      return {
        data: {
          id,
          ...calendarEvent,
          start: calendarEvent?.start?.toISOString()?.split('.')?.[0],
          end: calendarEvent?.end?.toISOString()?.split('.')?.[0],
        },
        message: 'Added reminder to the calendar successfully.',
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }

  async getAdminReminder(params: { userId: string }) {
    try {

      let query: any = [
        {
          '$match': {
            '$and': [
              {
                'start': {
                  '$gte': new Date()
                }
              }, {
                'userIds': params.userId
              }
            ]
          }
        },
        {
          '$sort': {
            'start': 1
          }
        }, {
          '$limit': 1
        }
      ]
      let [data] = await this.eventRepository.aggregate(query)

      return data ? data : {};
    } catch (err) {
      throw err;
    }
  }
}

