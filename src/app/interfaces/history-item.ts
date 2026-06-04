export interface HistoryItem {
  id: number;
  user: string;
  questionId: number;
  time: string;
  statusText: string;
  statusIcon: string;
  statusColor: string;
  retry?: string;
}
