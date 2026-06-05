import { IUser } from '../../interfaces/user.interface';

export class CreateUserDto implements IUser {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  defaultRole: string;
  password?: string;
  isActive?: boolean;
  isHostConfirmed?: boolean;
  isAssignedForAudit?: boolean;
  isEligibleForAudit?: boolean;
  aboutMe?: string;
  profileCompletion?: {
    personalInfo: { required: boolean; percentage: number; completed: boolean };
    idVerification: { required: boolean; percentage: number; completed: boolean };
    kitchenDetails: { required: boolean; percentage: number; completed: boolean };
    trainings: { required: boolean; percentage: number; completed: boolean };
    ribbons: { required: boolean; percentage: number; completed: boolean };
    badges: { required: boolean; percentage: number; completed: boolean };
    facilities: { required: boolean; percentage: number; completed: boolean };
    houseRules: { required: boolean; percentage: number; completed: boolean };
  };
  overalProfileCompletion?: number;
}
