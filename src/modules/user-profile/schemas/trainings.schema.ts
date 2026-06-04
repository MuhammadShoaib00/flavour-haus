import { UserTraining } from './user_trainings.schema';
import { AbstractSchema } from '../shared/classes/abstract.schema';
import { TrainingSchema } from '../../../shared/interfaces/reference_data/schemas/trainings.schema';

export class Trainings extends AbstractSchema {
  name: string;

  heading: string;

  url: string;

  image: string;

  content: object;

  is_optional: boolean;

  user_trainings?: UserTraining;
}

export const TrainingsSchema = TrainingSchema;
