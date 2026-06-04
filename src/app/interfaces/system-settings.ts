export interface SystemSettings {
  delayBetweenActionsMs: number;
  maxParallelTasks: number;
  retryOnError: boolean;
  headlessMode: boolean;
  fingerprintEngine: string;
  rotateUserAgent: boolean;
  simulateHumanBehavior: boolean;
  generationMode: string;
  checkIntervalMinutes: number;
  autoLikeEnabled: boolean;
  reportCompetitors: boolean;
  telegramBotToken: string;
  telegramChatId: string;
}
