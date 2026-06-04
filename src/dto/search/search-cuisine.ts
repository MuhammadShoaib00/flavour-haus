import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";
import { ApiResponseDto } from "../common/ApiResponse.dto";

export class SearchByCuisineRequest {
  @ApiProperty({
    example: ['Asian','Vegan'],
  })
  cuisine: string[];

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
      noOfGuests: 5
    },
  })
  guests: {
    noOfGuests: number
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

export class SearchByCuisineResponseDto extends ApiResponseDto {
  @ApiProperty({ example: 'Search Performed Successfully.' })
  @IsString()
  message: string;
}
