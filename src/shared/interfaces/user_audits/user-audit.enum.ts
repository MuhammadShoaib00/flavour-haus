export enum UserAuditStatusEnum {
  // PENDING = 'Pending',
  UNASSIGNED = 'Unassigned',
  ASSIGNED = 'Assigned',
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  ON_HOLD = 'On Hold',
  COMPLETED = 'Completed',
}

export enum UserAuditTypeEnum {
  INITIAL_VISIT = 'Initial Visit',
  ANNOUNCED_VISIT = 'Announced Visit',
  UNANNOUNCED_VISIT = 'Unannounced Visit',
}

export enum UserAuditStatusEnumForDto {
  UNASSIGNED = 'Unassigned',
  ASSIGNED = 'Assigned',
  PENDING = 'Pending',
  ON_HOLD = 'On Hold',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
}

export enum UserAuditStatusEnumForCMPDto {
  ALL = 'All',
  ASSIGNED = 'New',
  PENDING = 'Pending',
  ON_HOLD = 'On Hold',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
}

export enum SearchUserAuditDto {
  ALL = 'All',
  ASSIGNED = 'New',
  PENDING = 'Pending',
  COMPLETED = 'Completed',
}