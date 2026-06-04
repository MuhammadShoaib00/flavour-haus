export enum UserAuditStatusEnum {
  UNASSIGNED = 'Unassigned',
  ASSIGNED = 'Assigned',
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  ON_HOLD = 'On Hold',
  COMPLETED = 'Completed',
  ALL = 'All',
}

export enum UserAuditTypeEnum {
  INITIAL_VISIT = 'Initial Visit',
  ANNOUNCED_VISIT = 'Announced Visit',
  UNANNOUNCED_VISIT = 'Unannounced Visit',
}
