export interface CreateTaskRequest {
  type: number; // Comment = 1, Like = 2, Dislike = 3, Report = 4
  targetUrl: string;
  commentText?: string;
  maybeTargetUrl?: string;
  promotionAfterPost: boolean;
  count: number;
  delay: number; // Safe = 1, Normal = 2, Fast = 3
  notifyOnComplete: boolean;
  notifyOnError: boolean;
  notifyTelegram: boolean;
}
