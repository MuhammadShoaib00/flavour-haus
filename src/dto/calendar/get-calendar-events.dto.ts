import { ApiProperty } from '@nestjs/swagger';

export class GetCalendarEventsRequestDto {}

export class GetCalendarEventsResponseDto {
  @ApiProperty({
    example: [
      {
        id: '507x1x77xxf86xx799439011',
        title: 'Hi Tea',
        date: '2022-07-06',
        start: '2022-07-06T08:00:00',
        end: '2022-07-06T10:30:00',
        className: 'orange-bg',
        bookingId: '507x1x77xxf86xx799439011',
        userId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
      },
    ],
  })
  data: any;
}
