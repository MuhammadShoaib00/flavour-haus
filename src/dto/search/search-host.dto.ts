import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, isNotEmpty, IsString } from 'class-validator';
import { Types } from 'mongoose';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class SearchByHostRequest {
  @ApiProperty({
    example: {
      name: 'host',
      rating: 5
    },
  })
  host: {
    name: string,
    rating: number
  };
  @ApiProperty({
    example: {
      date: '22 December 2022',
      time: '07 AM - 10 AM'
    },
  })
  date: {
    date: string
    time: string
  }

  @ApiProperty({
    example: {
    noofGuests: 5
  },
  })
  guests: {
    noofGuests: number
  }
  @ApiProperty({
    example: {
        price: {
          startFrom: 5,
          endAt: 15,
        },
        offers: ['All Offers'],
        dietary: ['639758205f5e633dd6cf9cd1'],
        facilities: ['635bc9e2ebbb9193e18c3bb3'],
        facilitiesForDisables: ['Wheel Chair'],
        facilitiesForChildren: ['Play Area'],
        houseRules: ['pets'],
        hostLanguageProficiences: ['English'],
      },
  })
  filter: {
    price: {
      startFrom: number;
      endAt: number;
    };
    offers: string[];
    dietary: string[];
    facilities: string[];
    facilitiesForDisables: string[];
    facilitiesForChildren: string[];
    houseRules: string[];
    hostLanguageProficiences: string[];
  };
}

export class SearchByHostResponseDto extends ApiResponseDto {
  @ApiProperty({ example: 'Search Performed Successfully.' })
  @IsString()
  message: string;
}
