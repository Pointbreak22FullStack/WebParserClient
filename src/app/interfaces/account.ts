import { AccountStatus } from './account-status';

export enum LoginMethod {
  MailRu = 0,
  YandexMail = 1,
  YandexPhone = 2,
  VK = 3,
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
