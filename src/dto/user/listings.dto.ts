import { Prop } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsMongoId, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { isArray } from 'lodash';
import { Types } from 'mongoose';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class GetListingsResponse extends ApiResponseDto {
  @ApiProperty({
    example: {
      "collections": [
        {
          "_id": "635bff0968d911697c7616fd",
          "hostId": "cb59cbdf-fa0a-41c3-8590-99118409b4c1",
          "kichtenId": "6356c8f168f8dce71e175924",
          "menuId": "637268136ae3f6024a13c2ab",
          "foodItems": [
            {
              "itemId": "6356c8f168f8dce71e275924",
              "itemName": "Saag"
            },
            {
              "itemId": "6356c8f168f8dce71e175924",
              "itemName": "Daal"
            }
          ],
          "noOfGuests": 2,
          "houseRules": [
            "pets_allowed",
            "children_allowed",
            "dress_code"
          ],
          "sharedDinning": true,
          "price": 20.45,
          "description": "lorem ipsum dolor sit ameut...",
          "timings": [
            {
              "startDate": "2022-01-10",
              "endDate": "2022-01-20",
              "timeRanges": [
                {
                  "startTime": "05:00:00",
                  "endTime": "08:00:00"
                }
              ]
            }
          ],
          "createdAt": "2022-10-28T16:10:49.496Z",
          "updatedAt": "2022-10-28T16:41:25.036Z",
          "menus": {
            "_id": "637268136ae3f6024a13c2ab",
            "category": "arsasls3123",
            "description": "arsal123123 312"
          }
        }
      ],
      "total": 8,
      "offset": "0",
      "limit": "1"
    }
  })
  @IsArray()
  data: Array<any>;
  @ApiProperty({
    example: "All Listings",
  })
  message: string;
}

export class CreateListingsRequest {
  @ApiProperty({
    example: 'Weekend special',
    required: true,
  })
  @Prop({ type: String, required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: '6356c8f168f8dce71e175924',
    required: true,
  })
  @Prop({ type: String, required: true })
  menuId: string;

  @ApiProperty({
    example: [
      { itemId: '6356c8f168f8dce71e275924', itemName: 'Saag' },
      { itemId: '6356c8f168f8dce71e175924', itemName: 'Daal' },
    ],
    required: true,
  })
  @Prop({ type: Array<{ itemId: string; itemName: string }>, required: true })
  @IsArray()
  foodItems: Array<{ itemId: string; itemName: string }>;

  @ApiProperty({
    example: 2,
    required: true,
  })
  @Prop({ type: Number, required: true })
  @IsNumber()
  @IsNotEmpty()
  noOfGuests: number;

  @ApiProperty({
    example: ['smokingRestrictionApplied', 'dressCodeRestrictionApplied'],
    required: false,
  })
  @Prop({ type: [String], default: [], required: false })
  @IsArray()

  houseRules?: string[];

  @ApiProperty({
    example: true,
    required: false,
  })
  @Prop({ type: Boolean, required: false })
  @IsBoolean()
  @IsNotEmpty()
  isChildrenAllowed?: boolean;

  @ApiProperty({
    example: true,
    required: false,
  })
  @Prop({ type: Boolean, required: false })
  @IsBoolean()
  @IsNotEmpty()
  sharedDinning?: boolean;

  @ApiProperty({
    example: 20.45,
    required: false,
  })
  @Prop({ type: Number, required: true, default: 0 })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({
    example: 'lorem ipsum dolor sit ameut...',
    required: false,
  })
  @Prop({ type: String, required: false })
  @IsString()
  @IsNotEmpty()
  description?: string;

  @ApiProperty({
    example: [
      {
        startDate: '2022-01-10',
        endDate: '2022-01-20',
        timeRanges: [
          {
            startTime: '05:00:00',
            endTime: '08:00:00',
          },
        ],
      },
    ],
    required: true,
  })
  @Prop({
    type: Array<{
      startDate: string;
      endDate: string;
      timeRanges: [
        {
          startTime: string;
          endTime: string;
        },
      ];
    }>,
    required: true,
  })
  timings: Array<{
    startDate: string;
    endDate: string;
    timeRanges: [
      {
        startTime: string;
        endTime: string;
      },
    ];
  }>;
}

export class CreateListingsResponse extends ApiResponseDto {
  @ApiProperty({
    example: 'Listing created successfully.',
  })
  message: string;

  @ApiProperty({
    example: {
      "name": "Weekend special",
      "hostId": "cb59cbdf-fa0a-41c3-8590-99118409b4c1",
      "kichtenId": "6356c8f168f8dce71e175924",
      "menuId": "637268136ae3f6024a13c2ab",
      "foodItems": [
        {
          "itemId": "6356c8f168f8dce71e275924",
          "itemName": "Saag"
        },
        {
          "itemId": "6356c8f168f8dce71e175924",
          "itemName": "Daal"
        }
      ],
      "noOfGuests": 2,
      "houseRules": [
        "smokingRestrictionApplied",
        "dressCodeRestrictionApplied"
      ],
      "sharedDinning": true,
      "isChildrenAllowed": true,
      "price": 20.45,
      "description": "lorem ipsum dolor sit ameut...",
      "timings": [
        {
          "startDate": "2022-01-10",
          "endDate": "2022-01-20",
          "timeRanges": [
            {
              "startTime": "05:00:00",
              "endTime": "08:00:00"
            }
          ]
        }
      ],
      "isListed": false,
      "_id": "63639d8e2ac05350edacf473",
      "createdAt": "2022-11-03T10:53:02.632Z",
      "updatedAt": "2022-11-03T10:53:02.632Z"
    }
  })
  data: object
}

export class UpdatingListingsRequest extends ApiResponseDto {
  @ApiProperty({
    example: {
      "name": "Weekend special",
      "menuId": "637268136ae3f6024a13c2ab",
      "foodItems": [
        {
          "itemId": "6356c8f168f8dce71e275924",
          "itemName": "Saag"
        },
        {
          "itemId": "6356c8f168f8dce71e175924",
          "itemName": "Daal"
        }
      ],
      "noOfGuests": 2,
      "houseRules": [
        "smokingRestrictionApplied",
        "dressCodeRestrictionApplied"
      ],
      "sharedDinning": true,
      "isChildrenAllowed": true,
      "price": 20.45,
      "description": "lorem ipsum dolor sit ameut...",
      "timings": [
        {
          "startDate": "2022-01-10",
          "endDate": "2022-01-20",
          "timeRanges": [
            {
              "startTime": "05:00:00",
              "endTime": "08:00:00"
            }
          ]
        }
      ]
    }
  })
  data: object;

  @ApiProperty({
    example: 'Listing updated successfully.',
  })
  message: string;
}

export class UpdatingListingsResponse extends ApiResponseDto {
  @ApiProperty({
    example: 'Listing updated successfully.',
  })
  @IsString()
  message: string;
}

export class DeletingListingsRequest {
  @ApiProperty({
    example: ['635bfe229856daef3b884992'],
    required: true,
  })
  @Prop({ type: Array<Types.ObjectId>, required: true })
  @IsArray()
  listingIds: Array<Types.ObjectId>;
}

export class DeletingListingsResponse extends ApiResponseDto {
  @ApiProperty({
    example: 'Listing deleted successfully.',
  })
  @IsString()
  message: string;
}

export class ChangingListingsRequest {
  @ApiProperty({
    example: '63639d8e2ac05350edacf473',
    required: true,
  })
  @Prop({ type: Types.ObjectId, required: true })
  @IsMongoId()
  listingId: Types.ObjectId;

  @ApiProperty({
    example: 'true',
    required: true,
  })
  @Prop({ type: Boolean, required: true })
  @IsBoolean()
  @IsNotEmpty()
  isListed: boolean;
}
export class ChangingListingsResponse extends ApiResponseDto {
  @ApiProperty({
    example: 'Listing status changed successfully.',
  })
  @IsString()
  message: string;
}

export class GetSingleListingsResponse extends ApiResponseDto {
  @ApiProperty({
    example: {
      "listing": {
        "listing_object": "...listing object details"
      },
      "kitchen": {
        "kitchen_object": "... kitchen object details"
      }
    }
  })
  data: Array<any>;
  @ApiProperty({
    example: "Single Listing",
  })
  message: string;
}