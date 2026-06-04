
export class UpdateHouseRulesDto {
   
  userId: string;
 
  houseRules: {
  
    foodRestrictionApplied?: boolean;
    smokingRestrictionApplied?: boolean;
    dressCodeRestrictionApplied?: boolean;
    dressCodeRestriction?: string;
    petsRestrictionApplied?: boolean;
  };
}
