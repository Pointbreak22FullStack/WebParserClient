import { inject, Injectable, signal, computed } from '@angular/core';
import { filter } from 'rxjs';

import { ProxyService } from '../services/proxy.service';
import { HubService } from '../services/hub.service';
import { Proxy, ProxyRequest } from '../interfaces/proxy';
import { ProxyType } from '../interfaces/proxy-type';
import { HubNotification } from '../interfaces/hub-notification';

@Injectable({ providedIn: 'root' })
export class ProxyStore {
  private proxyService = inject(ProxyService);
  private hub = inject(HubService);

  private _proxies = signal<Proxy[]>([]);
  readonly proxies = computed(() => this._proxies());

  constructor() {
    this.hub.subscribe('proxies');
    this.hub.entityChanged$
      .pipe(filter(n => n.group === 'proxies'))
      .subscribe(n => this.applyChange(n));
  }

  loadProxies() {
    this.proxyService.getAll().subscribe(data => {
      this._proxies.set(data);
    });
  }

  saveProxy(data: ProxyRequest, id?: number) {
    if (id) {
      this.proxyService.update(id, data).subscribe();
    } else {
      this.proxyService.create(data).subscribe();
    }
  }

  deleteProxy(id: number) {
    this.proxyService.delete(id).subscribe();
  }

  private applyChange(n: HubNotification): void {
    switch (n.changeType) {
      case 'Created':
        this._proxies.update(list => [...list, n.payload as Proxy]);
        break;
      case 'Updated': {
        const updated = n.payload as Proxy;
        this._proxies.update(list =>
          list.map(p => p.id === updated.id ? updated : p)
        );
        break;
      }
      case 'Deleted':
        this._proxies.update(list =>
          list.filter(p => p.id !== (n.payload as number))
        );
        break;
    }
  }

  getProxyTypeLabel(type: ProxyType): string {
    switch (String(type)) {
      case '0':
      case 'Http': return 'Http';
      case '1':
      case 'Socks5': return 'Socks5';
      default: return 'Неизвестно';
    }
  }

  getStatusDot(p: Proxy): string {
    if (p.isActive)   return '#22c55e'; // зелёный  — активен
    if (p.hasError)   return '#ef4444'; // красный  — с ошибкой
    if (p.isWarming)  return '#3b82f6'; // синий    — согревается
    if (p.isFree)     return '#06b6d4'; // голубой  — свободен
    return '#6b7280';                   // серый    — все false
  }
}
