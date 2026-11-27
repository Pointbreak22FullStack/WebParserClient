import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  LucideActivity,
  LucideDynamicIcon,
  LucideMessageSquare,
  LucideThumbsUp,
} from '@lucide/angular';
import { UserTaskDto, UserTaskType, UserTaskStatus, TaskAccountStatus } from '../../interfaces/task';
import { SortIconComponent } from '../../components/sort-icon/sort-icon';
import { TaskDetails } from './components/task-details/task-details';
import { TaskSidebar } from './components/task-sidebar/task-sidebar';
import { TaskStore } from '../../stores/task.store';

type SortField = 'type' | 'url' | 'account' | 'status' | 'duration' | 'created';
type SortDir = 'asc' | 'desc' | null;

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

const TYPE_FILTER_MAP: Record<string, UserTaskType> = {
  'Комментарий': UserTaskType.Comment,
  'Лайки':       UserTaskType.Like,
  'Авто-ответ':  UserTaskType.AutoReply,
  'Мониторинг':  UserTaskType.Monitoring,
};

const STATUS_FILTER_MAP: Record<string, UserTaskStatus> = {
  'В очереди': UserTaskStatus.Pending,
  'В работе':  UserTaskStatus.Processing,
  'Выполнено': UserTaskStatus.Completed,
  'Ошибка':    UserTaskStatus.Failed,
  'Отменено':  UserTaskStatus.Canceled,
};

const TASK_ACCOUNT_STATUS_LABEL: Record<number, string> = {
  [TaskAccountStatus.InQueue]:   'в очереди',
  [TaskAccountStatus.Active]:    'активен',
  [TaskAccountStatus.InWork]:    'в работе',
  [TaskAccountStatus.Completed]: 'выполнено',
  [TaskAccountStatus.Error]:     'ошибка',
};

@Component({
  selector: 'app-tasks',
  imports: [NgClass, RouterLink, LucideDynamicIcon, SortIconComponent, TaskDetails, TaskSidebar],
  templateUrl: './tasks.html',
  styleUrl: './tasks.css',
})
export class Tasks implements OnInit {
  private taskStore = inject(TaskStore);

  ngOnInit(): void {
    this.taskStore.loadTasks();
  }

  getTaskIcon(type: UserTaskType) {
    switch (type) {
      case UserTaskType.Like:       return LucideThumbsUp;
      case UserTaskType.Monitoring: return LucideActivity;
      default:                      return LucideMessageSquare;
    }
  }

  getTypeLabel(type: number): string {
    return TYPE_LABEL[type] ?? 'Неизвестно';
  }

  getTaskAccountStatusLabel(status: number): string {
    return TASK_ACCOUNT_STATUS_LABEL[status] ?? '';
  }

  formatDuration(seconds: number): string {
    if (!seconds) return '—';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}м ${s}с` : `${s}с`;
  }

  formatCreated(iso: string): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  }

  getResultItems(task: UserTaskDto): { count: number; type: 'success' | 'pending' | 'error' }[] {
    if (!task.result) return [];
    const items: { count: number; type: 'success' | 'pending' | 'error' }[] = [];
    if (task.result.completedCount)  items.push({ count: task.result.completedCount,  type: 'success' });
    if (task.result.inProgressCount) items.push({ count: task.result.inProgressCount, type: 'pending' });
    if (task.result.errorCount)      items.push({ count: task.result.errorCount,      type: 'error' });
    return items;
  }

  readonly typeFilters = ['Все', 'Комментарий', 'Лайки', 'Авто-ответ', 'Мониторинг'];
  readonly statusFilters = ['Все', 'В очереди', 'В работе', 'Выполнено', 'Ошибка', 'Отменено'];

  readonly searchQuery = signal('');
  readonly typeFilter = signal('Все');
  readonly statusFilter = signal('Все');
  readonly sortField = signal<SortField | null>('created');
  readonly sortDir = signal<SortDir>('desc');
  readonly selectedIds = signal(new Set<string>());
  readonly expandedIds = signal(new Set<string>());
  readonly drawerTaskId = signal<string | null>(null);

  readonly filteredTasks = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const type = this.typeFilter();
    const status = this.statusFilter();
    const field = this.sortField();
    const dir = this.sortDir();

    let list = this.taskStore.tasks();

    if (query) {
      list = list.filter(t =>
        t.targetUrl.toLowerCase().includes(query) ||
        this.getTypeLabel(t.type).toLowerCase().includes(query) ||
        t.accounts.some(a => a.accountSiteNick.toLowerCase().includes(query))
      );
    }

    if (type !== 'Все') {
      const typeVal = TYPE_FILTER_MAP[type];
      if (typeVal !== undefined) list = list.filter(t => t.type === typeVal);
    }

    if (status !== 'Все') {
      const statusVal = STATUS_FILTER_MAP[status];
      if (statusVal !== undefined) list = list.filter(t => t.status === statusVal);
    }

    if (field && dir) {
      list = [...list].sort((a, b) => {
        let cmp = 0;
        switch (field) {
          case 'type':     cmp = a.type - b.type; break;
          case 'url':      cmp = a.targetUrl.localeCompare(b.targetUrl); break;
          case 'account':  cmp = a.accounts.length - b.accounts.length; break;
          case 'status':   cmp = a.status - b.status; break;
          case 'duration': cmp = a.durationSeconds - b.durationSeconds; break;
          case 'created':  cmp = a.createdAt.localeCompare(b.createdAt); break;
        }
        return dir === 'asc' ? cmp : -cmp;
      });
    }

    return list;
  });

  readonly drawerTask = computed(() => {
    const id = this.drawerTaskId();
    return id !== null ? (this.taskStore.tasks().find(t => t.id === id) ?? null) : null;
  });

  readonly selectedCount = computed(() => this.selectedIds().size);

  readonly allSelected = computed(() => {
    const filtered = this.filteredTasks();
    return filtered.length > 0 && filtered.every(t => this.selectedIds().has(t.id));
  });

  readonly someSelected = computed(() => this.selectedIds().size > 0);

  toggleSort(field: SortField): void {
    if (this.sortField() === field) {
      if (this.sortDir() === 'asc') {
        this.sortDir.set('desc');
      } else if (this.sortDir() === 'desc') {
        this.sortField.set(null);
        this.sortDir.set(null);
      }
    } else {
      this.sortField.set(field);
      this.sortDir.set('asc');
    }
  }

  dirFor(field: SortField): 'asc' | 'desc' | null {
    return this.sortField() === field ? this.sortDir() : null;
  }

  toggleExpand(id: string): void {
    this.expandedIds.update(set => {
      const next = new Set(set);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  toggleSelect(id: string): void {
    const set = new Set(this.selectedIds());
    set.has(id) ? set.delete(id) : set.add(id);
    this.selectedIds.set(set);
  }

  toggleSelectAll(): void {
    if (this.allSelected()) {
      this.selectedIds.set(new Set());
    } else {
      this.selectedIds.set(new Set(this.filteredTasks().map(t => t.id)));
    }
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  openDrawer(task: UserTaskDto): void {
    if (task.accounts.length === 1) {
      this.drawerTaskId.set(task.id);
    }
  }

  closeDrawer(): void {
    this.drawerTaskId.set(null);
  }

  getStatusLabel(status: number): string {
    return STATUS_LABEL[status] ?? 'Неизвестно';
  }

  getStatusClass(status: number): string {
    return ({
      [UserTaskStatus.Pending]:    'text-zinc-400',
      [UserTaskStatus.Processing]: 'text-blue-400',
      [UserTaskStatus.Completed]:  'text-[#9eff00]',
      [UserTaskStatus.Failed]:     'text-red-400',
      [UserTaskStatus.Canceled]:   'text-zinc-500',
    } as Record<number, string>)[status] ?? 'text-zinc-400';
  }

  getResultColor(type: string): string {
    return (
      { success: 'text-[#9eff00]', pending: 'text-zinc-500', error: 'text-red-400' }[type] ?? 'text-zinc-400'
    );
  }

  protected readonly TaskStatus = UserTaskStatus;

  cancelTask(id: string): void {
    this.taskStore.cancelTask(id);
  }

  deleteTask(id: string): void {
    this.taskStore.deleteTask(id);
  }
}
