import { inject, Injectable, signal, computed } from '@angular/core';
import { filter } from 'rxjs';
import { TaskService } from '../services/task.service';
import { HubService } from '../services/hub.service';
import { UserTaskDto } from '../interfaces/task';
import { HubNotification } from '../interfaces/hub-notification';

@Injectable({ providedIn: 'root' })
export class TaskStore {
  private taskService = inject(TaskService);
  private hub = inject(HubService);

  private _tasks = signal<UserTaskDto[]>([]);
  private _isLoading = signal(false);

  readonly tasks = computed(() => this._tasks());
  readonly isLoading = computed(() => this._isLoading());

  constructor() {
    this.hub.subscribe('tasks');
    this.hub.entityChanged$
      .pipe(filter(n => n.group === 'tasks'))
      .subscribe(n => this.applyChange(n));
  }

  loadTasks(): void {
    this._isLoading.set(true);
    this.taskService.getAll().subscribe({
      next: data => { this._tasks.set(data); this._isLoading.set(false); },
      error: () => this._isLoading.set(false),
    });
  }

  deleteTask(id: string): void {
    this.taskService.deleteTask(id).subscribe();
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
