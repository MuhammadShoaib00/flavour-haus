import { boolean, string } from 'joi';

export interface IUser {
  userId: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  dob?: string;
  gender?: string;
  country?: string;
  city?: string;
  address?: string;
  languages?: [
    {
      languageName: string;
      proficiencyLevel: string;
    },
  ];
  defaultRole: string;
  isActive?: boolean;
  isHostConfirmed?: boolean;
  isAssignedForAudit?: boolean;
  isEligibleForAudit?: boolean;
  license?: {
    haveUTRNumber: boolean;
    UTRNumber: string;
    havePremisesPermission: boolean;
    premisesPermissionFile: string;
  };
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
