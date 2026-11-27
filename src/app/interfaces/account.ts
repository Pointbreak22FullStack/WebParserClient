import { AccountStatus } from './account-status';

export enum LoginMethod {
  VK = 3,
  Google = 4,    // YouTube и Google-аккаунты
  TikTok = 5,
  Instagram = 6,
}

export interface Account {
  id: number;
  login: string;
  password: string;
  description?: string;

  // Поля, соответствующие верстке:
  loginMethod: LoginMethod;
  phoneNumber: string;
  sessionInfo: string;
  sessionExpiresAtUtc?: string;
  riskScore: number;        // Число от 0 до 100

  status: AccountStatus;
  completedTasksCount: number;
  lastUsedAtUtc?: string;
  proxyIp?: string;
  createdAt: string;

  // Добавляем новые поля из верстки:
  firstName?: string;
  lastName?: string;
  proxyId?: number | null; // ID выбранного прокси
}
