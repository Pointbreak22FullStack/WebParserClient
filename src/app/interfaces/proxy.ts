import {ProxyType} from './proxy-type';

export interface Proxy {
  id: number;
  ipAddress: string;
  port: number;
  login: string;
  password: string;
  type: ProxyType;
  isActive: boolean;
  hasError: boolean;
  isWarming: boolean;
  isFree: boolean;
  latencyMs?: number;
  accountsCount: number;
}

export interface ProxyRequest {
  ipAddress: string;
  port: number;
  login: string;
  password: string;
  type: ProxyType;
}
