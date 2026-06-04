import { Injectable } from "@nestjs/common";
import { UserTrainingsRepository } from "../repositories/user_trainings.repository";
import { TrainingsRepository } from "../repositories/trainings.repository";
import mongoose from "mongoose";

@Injectable()
export class UserTrainingsService {
  constructor(
    private trainingRepo: TrainingsRepository,
    private userTrainingRepo: UserTrainingsRepository,
  ) { }

  async listTrainings(userId: string) {
    try {
      const data = await this.trainingRepo.getTrainingsWithUserTraining(userId);

      //to get the percentage of total
      const totals = {
        mandotary: { total: 0, completed: 0 },
        optional: { total: 0, completed: 0 },
      };
      let optional = [],
        mandotary = [];
      data.forEach((element) => {
        if (element.is_optional === true) {
          totals.optional.total++;
          optional.push(element);
        } else {
          totals.mandotary.total++;
          mandotary.push(element);
        }

        if (element.user_training && element.is_optional === true) {
          totals.optional.completed++;
        }

        if (element.user_training && element.is_optional === false) {
          totals.mandotary.completed++;
        }
      });

      return {
        optional,
        mandotary,
        totals,
      };
    } catch (err) {
      throw err;
    }
  }

  async markAsCompleted(payload) {
    try {
      payload = {
        trainingId: new mongoose.Types.ObjectId(payload.trainingId),
        ...payload,
      };
      await this.userTrainingRepo.upsert(payload, {
        completedAt: new Date(),
      });
      return {
        data: null,
        message: "User Training has been successfully marked as completed",
        errors: null,
      };
    } catch (err) {
      throw err;
    }
  }
}

