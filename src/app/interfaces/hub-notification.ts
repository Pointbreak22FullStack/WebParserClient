export type ChangeType = 'Created' | 'Updated' | 'Deleted';

export interface HubNotification<T = unknown> {
  group: string;
  changeType: ChangeType;
  payload: T;
}
