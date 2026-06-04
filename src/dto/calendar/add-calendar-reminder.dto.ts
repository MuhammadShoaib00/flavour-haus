import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsString } from 'class-validator';

export class AddCalendarReminderRequestDto {
  @ApiProperty({ example: 'Hi Tea' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: '2022-07-06' })
  @IsNotEmpty()
  @IsString()
  // @IsDate()
  // @Type(() => Date)
  date: string;

  @ApiProperty({ example: '07:00:00' })
  @IsNotEmpty()
  @IsString()
  time: string;
}

export class AddCalendarReminderResponseDto {
  @ApiProperty({
    example: {
      id: '507x1x77xxf86xx799439011',
      title: 'Hi Tea',
      date: '2022-07-06',
      start: '2022-07-06T07:00:00',
      className: 'secondary-bg-color',
      bookingId: null,
    },
  })
  data: any;

  @ApiProperty({ example: 'Added reminder to the calendar successfully.' })
  message: string;
}
