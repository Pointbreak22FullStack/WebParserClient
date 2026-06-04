import { inject, Injectable, signal, computed } from '@angular/core';
import { filter } from 'rxjs';

import { AccountService } from '../services/account.service';
import { HubService } from '../services/hub.service';
import { ToastService } from '../services/toast.service';
import { Account } from '../interfaces/account';
import { AccountStatus } from '../interfaces/account-status';
import { HubNotification } from '../interfaces/hub-notification';

@Injectable({ providedIn: 'root' })
export class AccountStore {
  private accountService = inject(AccountService);
  private hub   = inject(HubService);
  private toast = inject(ToastService);

  private _accounts = signal<Account[]>([]);
  private _isLoading = signal<boolean>(false);

  readonly accounts = computed(() => this._accounts());
  readonly isLoading = computed(() => this._isLoading());

  constructor() {
    this.hub.subscribe('accounts');
    this.hub.entityChanged$
      .pipe(filter(n => n.group === 'accounts'))
      .subscribe(n => this.applyChange(n));
  }

  loadAccounts() {
    this._isLoading.set(true);
    this.accountService.getAll().subscribe({
      next: (data) => {
        this._accounts.set(data);
        this._isLoading.set(false);
      },
      error: () => { this._isLoading.set(false); this.toast.error('Не удалось загрузить аккаунты'); }
    });
  }

  deleteAccount(id: number) {
    this.accountService.delete(id).subscribe();
  }

  private applyChange(n: HubNotification): void {
    switch (n.changeType) {
      case 'Created':
        this._accounts.update(list => [...list, n.payload as Account]);
        break;
      case 'Updated': {
        const updated = n.payload as Account;
        this._accounts.update(list =>
          list.map(a => a.id === updated.id ? updated : a)
        );
        break;
      }
      case 'Deleted':
        this._accounts.update(list =>
          list.filter(a => a.id !== (n.payload as number))
        );
        break;
    }
  }

  /** Хелпер для получения конфига статуса (принимает число или строку от API) */
  getStatusConfig(raw: unknown): { label: string; dot: string; class: string } {
    const n = Number(raw);
    const status: AccountStatus = Number.isNaN(n)
      ? (((AccountStatus as Record<string, unknown>)[raw as string] as AccountStatus) ?? AccountStatus.Active)
      : n as AccountStatus;

    const configs: Record<AccountStatus, { label: string; dot: string; class: string }> = {
      [AccountStatus.Active]: {
        label: 'Активен',
        dot: '#22c55e',
        class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      },
      [AccountStatus.Cooldown]: {
        label: 'Кулдаун',
        dot: '#eab308',
        class: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      },
      [AccountStatus.InWork]: {
        label: 'В работе',
        dot: '#60a5fa',
        class: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      },
      [AccountStatus.Banned]: {
        label: 'Заблокирован',
        dot: '#ef4444',
        class: 'bg-red-500/10 text-red-400 border-red-500/20'
      },
      [AccountStatus.Resting]: {
        label: 'Отлежка',
        dot: '#a78bfa',
        class: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      },
      [AccountStatus.CaptchaRequired]: {
        label: 'Капча',
        dot: '#eab308',
        class: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
      },
      [AccountStatus.VerificationRequired]: {
        label: 'Проверка',
        dot: '#818cf8',
        class: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
      }
    };

    return configs[status] ?? { label: 'Неизвестно', dot: '#6b7280', class: 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20' };
  }
  saveAccount(accountData: Partial<Account>, id?: number) {
    if (id) {
      this.accountService.update(id, accountData).subscribe();
    } else {
      this.accountService.create(accountData).subscribe();
    }
  }

}
