import { ApiProperty } from '@nestjs/swagger';
import { IsDataURI, IsDate, IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';

export class AddCalendarBookingRequestDto {
  @ApiProperty({ example: 'Hi Tea' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: '2022-07-06' })
  @IsNotEmpty()
  @IsString()
  @IsDate()
  date: string;

  @ApiProperty({ example: '2022-07-06T08:00:00' })
  @IsNotEmpty()
  @IsDate()
  start: Date;

  @ApiProperty({ example: '2022-07-06T10:30:00' })
  @IsNotEmpty()
  @IsDate()
  end: Date;

  @ApiProperty({ example: 'orange-bg' })
  @IsString()
  @IsNotEmpty()
  className?: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsMongoId()
  @IsNotEmpty()
  bookingId: Types.ObjectId;

  @ApiProperty({ example: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' })
  @IsNotEmpty()
  @IsString()
  userId: string;
}

export class AddCalendarBookingResponseDto {
  @ApiProperty({
    example: {
      id: '507x1x77xxf86xx799439011',
      title: 'Hi Tea',
      date: '2022-07-06',
      start: '2022-07-06T08:00:00',
      end: '2022-07-06T10:30:00',
      className: 'orange-bg',
      bookingId: '507x1x77xxf86xx799439011',
      userId: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    },
  })
  data: any;

  @ApiProperty({ example: 'Updated the calendar successfully.' })
  message: string;
}
