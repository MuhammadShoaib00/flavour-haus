import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../common/ApiResponse.dto';

export class ListTrainingsDto extends ApiResponseDto {
  @ApiProperty({ example: 'training_data_success' })
  message;
  @ApiProperty({
    example: {
      optional: [
        {
          _id: "6372662a73676f5725d10afd",
          name: "Safeguarding of Vulnerable Adults",
          heading: "Safeguarding of Vulnerable Adults",
          url: "https://www.highspeedtraining.co.uk/courses/safeguarding/safeguarding-vulnerable-adults-training-course/",
          image: "/icons/trainings/speed-logo.png",
          content: {
            coveredArea: ['...'],
            outcome: ''
          },
          is_optional: true,
          user_training: {
            _id: "6364fd2b5b837f21e73322fa",
            trainingId: "6372662a73676f5725d10afd",
            userId: "cb59cbdf-fa0a-41c3-8590-99118409b4c1",
            completedAt: "2022-11-04T11:53:15.771Z",
            createdAt: "2022-11-04T11:53:15.772Z",
            updatedAt: "2022-11-04T11:53:15.772Z"
          }
        },
      ],
      mandotary: [
        {
          _id: "6372662a73676f5725d10afd",
          name: "Safeguarding of Vulnerable Adults",
          heading: "Safeguarding of Vulnerable Adults",
          url: "https://www.highspeedtraining.co.uk/courses/safeguarding/safeguarding-vulnerable-adults-training-course/",
          image: "/icons/trainings/speed-logo.png",
          content: {
            coveredArea: ['...'],
            outcome: ''
          },
          is_optional: false,
        },
      ],
      totals: {
        mandotary: { total: 1, completed: 1 },
        optional: { total: 2, completed: 1 },
      },
    },
  })
  data: {
    optional: Array<any>;
    mandotary: Array<any>;
    totals: {
      mandotary: { total: number; completed: number };
      optional: { total: number; completed: number };
    };
  };
  @ApiProperty({ example: 'null' })
  errors;
}
