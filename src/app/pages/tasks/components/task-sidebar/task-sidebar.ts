import { Component, input, output } from '@angular/core';
import { NgClass } from '@angular/common';
import { UserTaskDto, UserTaskType, UserTaskStatus, TaskAccountStatus, TaskHistoryEntry } from '../../../../interfaces/task';

const TYPE_LABEL: Record<number, string> = {
  [UserTaskType.Comment]:    'Комментарий',
  [UserTaskType.Like]:       'Лайки',
  [UserTaskType.AutoReply]:  'Авто-ответ',
  [UserTaskType.Monitoring]: 'Мониторинг',
};

const STATUS_LABEL: Record<number, string> = {
  [UserTaskStatus.Pending]:    'В очереди',
  [UserTaskStatus.Processing]: 'В работе',
  [UserTaskStatus.Completed]:  'Выполнено',
  [UserTaskStatus.Failed]:     'Ошибка',
  [UserTaskStatus.Canceled]:   'Отменено',
};


@Component({
  selector: 'app-task-sidebar',
  imports: [NgClass],
  templateUrl: './task-sidebar.html',
  styleUrl: './task-sidebar.css',
})
export class TaskSidebar {
  task = input<UserTaskDto | null>(null);
  closed = output<void>();
  cancelRequested = output<string>();
  deleteRequested = output<string>();

  getHistory(task: UserTaskDto): TaskHistoryEntry[] {
    return task.history ?? [];
  }

  formatHistoryTime(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  getTypeLabel(type: number): string {
    return TYPE_LABEL[type] ?? 'Задача';
  }

  getStatusLabel(status: number): string {
    return STATUS_LABEL[status] ?? 'Неизвестно';
  }

  getStatusClass(status: number): string {
    return ({
      [UserTaskStatus.Pending]:    'text-zinc-400 border-zinc-700',
      [UserTaskStatus.Processing]: 'text-blue-400 border-blue-500/40',
      [UserTaskStatus.Completed]:  'text-[#9eff00] border-[#9eff00]/40',
      [UserTaskStatus.Failed]:     'text-red-400 border-red-500/40',
      [UserTaskStatus.Canceled]:   'text-zinc-500 border-zinc-600/40',
    } as Record<number, string>)[status] ?? 'text-zinc-400 border-zinc-700';
  }

  getAccountDotClass(status: number): string {
    return ({
      [TaskAccountStatus.InQueue]:   'bg-zinc-600',
      [TaskAccountStatus.Active]:    'bg-blue-400',
      [TaskAccountStatus.InWork]:    'bg-blue-400',
      [TaskAccountStatus.Completed]: 'bg-emerald-400',
      [TaskAccountStatus.Error]:     'bg-red-400',
    } as Record<number, string>)[status] ?? 'bg-zinc-600';
  }

  getAccountStatusLabel(status: number): string {
    return ({
      [TaskAccountStatus.InQueue]:   'в очереди',
      [TaskAccountStatus.Active]:    'активен',
      [TaskAccountStatus.InWork]:    'в работе',
      [TaskAccountStatus.Completed]: 'выполнено',
      [TaskAccountStatus.Error]:     'ошибка',
    } as Record<number, string>)[status] ?? '';
  }

  getResultItems(task: UserTaskDto): { count: number; type: 'success' | 'pending' | 'error' }[] {
    if (!task.result) return [];
    const items: { count: number; type: 'success' | 'pending' | 'error' }[] = [];
    if (task.result.completedCount)  items.push({ count: task.result.completedCount,  type: 'success' });
    if (task.result.inProgressCount) items.push({ count: task.result.inProgressCount, type: 'pending' });
    if (task.result.errorCount)      items.push({ count: task.result.errorCount,      type: 'error' });
    return items;
  }

  getResultLabel(type: string): string {
    return { success: 'Успешно', error: 'Ошибки', pending: 'В обработке' }[type] ?? type;
  }

  getResultIcon(type: string): string {
    return { success: '✓', error: '✕', pending: '⌛' }[type] ?? '';
  }

  getResultColor(type: string): string {
    return { success: 'text-[#9eff00]', error: 'text-red-400', pending: 'text-zinc-500' }[type] ?? 'text-zinc-400';
  }

  getLogClass(level: string): string {
    return (
      { success: 'text-[#9eff00]', error: 'text-red-400', warn: 'text-yellow-500', info: 'text-zinc-400' }[level] ?? 'text-zinc-400'
    );
  }

  formatDuration(seconds: number): string {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}м ${s}с` : `${s}с`;
  }

  formatCreated(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }

  successPercent(): number {
    const t = this.task();
    if (!t || !t.result) return 0;
    const total = t.result.completedCount + t.result.inProgressCount + t.result.errorCount;
    return total ? Math.round((t.result.completedCount / total) * 100) : 0;
  }

  isActive(): boolean {
    const s = this.task()?.status;
    return s === UserTaskStatus.Pending || s === UserTaskStatus.Processing;
  }

  isRetryable(): boolean {
    const s = this.task()?.status;
    return s === UserTaskStatus.Failed || s === UserTaskStatus.Completed;
  }
}
