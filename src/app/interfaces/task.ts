export enum UserTaskType {
  Comment    = 1,
  Like       = 2,
  AutoReply  = 5,
  Monitoring = 6,
}

export enum UserTaskStatus {
  Pending    = 1,
  Processing = 2,
  Completed  = 3,
  Failed     = 4,
  Canceled   = 5,
}

export enum TaskAccountStatus {
  InQueue   = 1,
  Active    = 2,
  InWork    = 3,
  Completed = 4,
  Error     = 5,
}

export interface UserTaskAccountDto {
  accountId: number;
  accountSiteNick: string;
  accountStatus: number;
  status: TaskAccountStatus;
  completedAt?: string;
  durationSeconds?: number;
}

export interface UserTaskResultDto {
  completedCount: number;
  inProgressCount: number;
  errorCount: number;
}

export interface TaskHistoryEntry {
  time: string;
  message: string;
  level: 'info' | 'success' | 'error' | 'warn';
}

export interface TaskLogEntry {
  taskId: string;
  userId: string;
  accountLogin: string;
  progress: number;
  elapsed: string;
  status: string;
  message: string;
  timestamp: string;
}

export interface UserTaskDto {
  id: string;
  type: UserTaskType;
  targetUrl: string;
  status: UserTaskStatus;
  progress: number;
  durationSeconds: number;
  createdAt: string;
  result: UserTaskResultDto;
  accounts: UserTaskAccountDto[];
  history?: TaskHistoryEntry[];
}
