import { inject, Injectable, signal, computed } from '@angular/core';
import { filter } from 'rxjs';
import { TaskService } from '../services/task.service';
import { HubService } from '../services/hub.service';
import { ToastService } from '../services/toast.service';
import { UserTaskDto } from '../interfaces/task';
import { HubNotification } from '../interfaces/hub-notification';

@Injectable({ providedIn: 'root' })
export class TaskStore {
  private taskService = inject(TaskService);
  private hub   = inject(HubService);
  private toast = inject(ToastService);

  private _tasks = signal<UserTaskDto[]>([]);
  private _isLoading = signal(false);

  readonly tasks = computed(() => this._tasks());
  readonly isLoading = computed(() => this._isLoading());

  constructor() {
    this.hub.subscribe('tasks');
    this.hub.entityChanged$
      .pipe(filter(n => n.group === 'tasks'))
      .subscribe(n => this.applyChange(n));

    this.hub.taskNotification$.subscribe(n => this.toast.show(n.message, n.level, 6000));
  }

  loadTasks(): void {
    this._isLoading.set(true);
    this.taskService.getAll().subscribe({
      next: data => { this._tasks.set(data); this._isLoading.set(false); },
      error: () => { this._isLoading.set(false); this.toast.error('Не удалось загрузить задачи'); },
    });
  }

  cancelTask(id: string): void {
    this.taskService.cancelTask(id).subscribe({
      next: () => this.toast.info('Отмена задачи запрошена'),
      error: err => this.toast.error(err?.status === 409 ? 'Задача уже завершена' : 'Не удалось отменить задачу'),
    });
  }

  deleteTask(id: string): void {
    this.taskService.deleteTask(id).subscribe({
      error: err => this.toast.error(err?.status === 409
        ? 'Сначала отмените задачу, выполняющуюся задачу удалить нельзя'
        : 'Не удалось удалить задачу'),
    });
  }

  private applyChange(n: HubNotification): void {
    switch (n.changeType) {
      case 'Created':
        this._tasks.update(list => [...list, n.payload as UserTaskDto]);
        break;
      case 'Updated': {
        const updated = n.payload as UserTaskDto;
        this._tasks.update(list =>
          list.map(t => t.id === updated.id ? updated : t)
        );
        break;
      }
      case 'Deleted':
        this._tasks.update(list =>
          list.filter(t => t.id !== (n.payload as string))
        );
        break;
    }
  }
}
