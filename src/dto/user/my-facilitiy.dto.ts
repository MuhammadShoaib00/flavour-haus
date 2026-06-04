import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class MyFacilityRequestDto {
  @ApiProperty({ example: '1' })
  @IsNumber()
  @IsNotEmpty()
  numberOfGuest: number;

  @ApiProperty({
    example: [
      {
        id: 'xxxxxxxxxx',
        icon: 'icons/facilties/conditioning.png',
        imageName: 'Indoor Fireplace',
        category: 'Standout Facilities',
      },
    ],
  })
  @IsArray()
  icons: [
    {
      id: string;
      icon: string;
      imageName: string;
      category: string;
    },
  ];
}

export class MyFacilityResponceDto {
  @ApiProperty({
    nullable: true,
  })
  errors: string | object | null;
  @ApiProperty({
    nullable: true,
  })
  message: string;
  @ApiProperty({
    nullable: true,
  })
  data: any;
}
