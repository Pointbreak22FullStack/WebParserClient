import { Component, computed, input, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { UserTaskDto, TaskAccountStatus } from '../../../../interfaces/task';

const ACCOUNT_STATUS_LABEL: Record<number, string> = {
  1: 'active',
  2: 'cooldown',
  3: 'in work',
  4: 'banned',
  5: 'resting',
  6: 'captcha',
  7: 'verification',
};

const TASK_ACCOUNT_STATUS_LABEL: Record<number, string> = {
  [TaskAccountStatus.InQueue]:   'в очереди',
  [TaskAccountStatus.Active]:    'активен',
  [TaskAccountStatus.InWork]:    'в работе',
  [TaskAccountStatus.Completed]: 'выполнено',
  [TaskAccountStatus.Error]:     'ошибка',
};

@Component({
  selector: 'app-task-details',
  imports: [NgClass],
  templateUrl: './task-details.html',
  styleUrl: './task-details.css',
})
export class TaskDetails {
  task = input<UserTaskDto | null>(null);

  readonly activeFilter = signal('Все');

  readonly stats = computed(() => {
    const t = this.task();
    if (!t) return { total: 0, done: 0, active: 0, queue: 0, errors: 0, progress: 0 };
    const total  = t.accounts.length;
    const done   = t.accounts.filter(a => a.status === TaskAccountStatus.Completed).length;
    const active = t.accounts.filter(a => a.status === TaskAccountStatus.Active || a.status === TaskAccountStatus.InWork).length;
    const queue  = t.accounts.filter(a => a.status === TaskAccountStatus.InQueue).length;
    const errors = t.accounts.filter(a => a.status === TaskAccountStatus.Error).length;
    return { total, done, active, queue, errors, progress: t.progress };
  });

  readonly filteredAccounts = computed(() => {
    const f = this.activeFilter();
    const t = this.task();
    if (!t) return [];
    const accs = t.accounts;
    if (f === 'Готово')    return accs.filter(a => a.status === TaskAccountStatus.Completed);
    if (f === 'В работе')  return accs.filter(a => a.status === TaskAccountStatus.Active || a.status === TaskAccountStatus.InWork);
    if (f === 'В очереди') return accs.filter(a => a.status === TaskAccountStatus.InQueue);
    if (f === 'Ошибка')    return accs.filter(a => a.status === TaskAccountStatus.Error);
    return accs;
  });

  getStatusDot(status: TaskAccountStatus): string {
    return ({
      [TaskAccountStatus.InQueue]:   'bg-zinc-600',
      [TaskAccountStatus.Active]:    'bg-blue-400',
      [TaskAccountStatus.InWork]:    'bg-blue-400',
      [TaskAccountStatus.Completed]: 'bg-emerald-500',
      [TaskAccountStatus.Error]:     'bg-red-500',
    } as Record<number, string>)[status] ?? 'bg-zinc-600';
  }

  getStatusClass(status: TaskAccountStatus): string {
    return ({
      [TaskAccountStatus.InQueue]:   'text-zinc-500',
      [TaskAccountStatus.Active]:    'text-blue-400',
      [TaskAccountStatus.InWork]:    'text-blue-400',
      [TaskAccountStatus.Completed]: 'text-[#9eff00]',
      [TaskAccountStatus.Error]:     'text-red-400',
    } as Record<number, string>)[status] ?? 'text-zinc-500';
  }

  getStatusLabel(status: TaskAccountStatus): string {
    return TASK_ACCOUNT_STATUS_LABEL[status] ?? 'неизвестно';
  }

  getAccountStatusLabel(status: number): string {
    return ACCOUNT_STATUS_LABEL[status] ?? 'unknown';
  }

  formatTime(iso?: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  formatDuration(seconds?: number): string {
    if (!seconds) return '—';
    return seconds < 60 ? `${seconds}с` : `${Math.floor(seconds / 60)}м ${seconds % 60}с`;
  }
}
