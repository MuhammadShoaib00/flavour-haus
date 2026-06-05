export class UpdateUserDto {
  userId: string;
  email?: string;
  phoneNumber?: string;
  defaultRole?: string;
  firstName?: string;
  lastName?: string;
  profileImage?: string;
  dob?: string;
  aboutMe?: string;
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
  profileCompletion?: {
    personalInfo: { required: boolean; percentage: number; completed: boolean };
    trainings: { required: boolean; percentage: number; completed: boolean };
    cuisines: { required: boolean; percentage: number; completed: boolean };
  };
  overalProfileCompletion?: number;

  dbsCheck?: {
    status?: boolean;
    file?: string;
  };

  contractBookData?: {
    id: string;
    title: string;
    state: string;
    userId: string;
    parties: object;
    createdAt: Date;
    updatedAt: Date;
  };

  license?: {
    haveUTRNumber: boolean;
    UTRNumber: string;
    havePremisesPermission: boolean;
    premisesPermissionFile: string;
  };
}
