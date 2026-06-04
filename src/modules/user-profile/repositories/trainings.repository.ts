import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '../shared/classes/abstract.repository';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Trainings } from '../schemas/trainings.schema';

@Injectable()
export class TrainingsRepository extends AbstractRepository<Trainings> {
  protected readonly logger = new Logger(TrainingsRepository.name);

  constructor(
    @InjectModel(Trainings.name) trainingModel: Model<Trainings>,
    @InjectConnection() connection: Connection,
  ) {
    super(trainingModel, connection);
  }

  public async getTrainingsWithUserTraining(userId){
    const query = [
      {
        $project: {
          _id: 0,
          trainings: "$$ROOT",
        },
      },
      {
        $lookup: {
          localField: "trainings._id",
          from: "user_trainings",
          foreignField: "trainingId",
          as: "user_trainings",
        },
      },
      {
        $addFields: {
          user_trainings: {
            $arrayElemAt: [
              {
                $filter: {
                  input: "$user_trainings",
                  as: "ut",
                  cond: {
                    $eq: ["$$ut.userId", userId],
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $unwind: {
          path: "$user_trainings",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: "$$ROOT.trainings._id",
          name: "$$ROOT.trainings.name",
          url: "$$ROOT.trainings.url",
          heading: "$$ROOT.trainings.heading",
          image: "$$ROOT.trainings.image",
          content: "$$ROOT.trainings.content",
          is_optional: "$$ROOT.trainings.is_optional",
          user_training: "$$ROOT.user_trainings",
        },
      },
    ];
    return await this.aggregate(query);
  }
}
