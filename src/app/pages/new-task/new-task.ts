import { Component, inject, signal, OnDestroy } from '@angular/core';
import { TaskType } from '../../interfaces/task-type';
import {
  LucideDynamicIcon,
  LucideFileText,
  LucideFlag, LucideMessageSquare,
  LucideThumbsDown,
  LucideThumbsUp
} from '@lucide/angular';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { TaskService } from '../../services/task.service';
import { HubService } from '../../services/hub.service';
import { AuthService } from '../../services/auth-service';
import { CreateTaskRequest } from '../../interfaces/create-task-request';
import { TaskLogEntry } from '../../interfaces/task';

@Component({
  selector: 'app-new-task',
  standalone: true,
  imports: [LucideFileText, LucideDynamicIcon, FormsModule, NgClass],
  templateUrl: './new-task.html',
  styleUrl: './new-task.css',
})
export class NewTask implements OnDestroy {
  private taskService = inject(TaskService);
  private hub = inject(HubService);
  private auth = inject(AuthService);
  private logSub?: Subscription;

  taskTypes = signal<TaskType[]>([
    { label: 'Комментарий', desc: '+ ссылка', icon: LucideMessageSquare },
    { label: 'Лайки',       desc: '+50',      icon: LucideThumbsUp },
    { label: 'Дизлайки',    desc: '+50',      icon: LucideThumbsDown },
    { label: 'Репорт',      desc: '×4',       icon: LucideFlag }
  ]);

  delayOptions = signal([
    { label: 'Безопасно', desc: '5-10с', value: 1 },
    { label: 'Средне',    desc: '3-5с',  value: 2 },
    { label: 'Быстро',    desc: '1-3с',  value: 3 }
  ]);

  notifications = signal([
    { label: 'При завершении', checked: true },
    { label: 'При ошибке',     checked: true },
    { label: 'Telegram',       checked: false }
  ]);

  // --- СОСТОЯНИЕ ФОРМЫ ---
  selectedTaskType = signal<string>('Комментарий');
  selectedDelay    = signal<number>(1);
  enableLikes      = signal(false);
  urlValue         = signal<string>('');
  commentText      = signal<string>('');
  likesCount       = signal<number>(50);
  maybeTargetUrl   = signal<string>('');

  // --- СОСТОЯНИЕ ЗАДАЧИ ---
  activeTaskId  = signal<string | null>(null);
  isRunning     = signal(false);
  taskProgress  = signal(0);
  taskLogs      = signal<TaskLogEntry[]>([]);

  private typeMapping: Record<string, number> = {
    'Комментарий': 1,
    'Лайки':       2,
    'Дизлайки':    3,
    'Репорт':      4
  };

  onSubmit(event: Event) {
    event.preventDefault();

    const request: CreateTaskRequest = {
      type: this.typeMapping[this.selectedTaskType()] ?? 1,
      targetUrl: this.urlValue(),
      commentText: this.selectedTaskType() === 'Комментарий' ? this.commentText() : undefined,
      maybeTargetUrl: this.maybeTargetUrl() || undefined,
      promotionAfterPost: this.enableLikes(),
      count: this.likesCount(),
      delay: this.selectedDelay(),
      notifyOnComplete: this.notifications().find(n => n.label === 'При завершении')?.checked ?? false,
      notifyOnError:    this.notifications().find(n => n.label === 'При ошибке')?.checked ?? false,
      notifyTelegram:   this.notifications().find(n => n.label === 'Telegram')?.checked ?? false
    };

    if (!request.targetUrl) {
      alert('Введите URL!');
      return;
    }

    this.taskService.createTask(request).subscribe({
      next: (taskId) => {
        this.activeTaskId.set(taskId);
        this.isRunning.set(true);
        this.taskProgress.set(0);
        this.taskLogs.set([]);
        this.subscribeToLogs(taskId);
      },
      error: (err) => {
        console.error('Ошибка создания задачи:', err);
        alert('Произошла ошибка при запуске.');
      }
    });
  }

  private subscribeToLogs(taskId: string): void {
    const userId = this.auth.getUserId();
    this.hub.subscribe(`user-logs:${userId}`);

    this.logSub?.unsubscribe();
    this.logSub = this.hub.taskLog$.subscribe(entry => {
      if (entry.taskId !== taskId) return;
      this.taskLogs.update(logs => [...logs, entry]);
      this.taskProgress.set(entry.progress);
      if (entry.status === 'completed' || entry.status === 'failed') {
        this.isRunning.set(false);
      }
    });
  }

  logColor(status: string): string {
    if (status === 'error' || status === 'failed') return 'text-red-400';
    if (status === 'warning' || status === 'waiting') return 'text-orange-400';
    return 'text-lime-500';
  }

  logIcon(status: string): string {
    if (status === 'success' || status === 'completed') return '✓';
    if (status === 'waiting' || status === 'warning') return '⏳';
    if (status === 'error' || status === 'failed') return '✗';
    return '';
  }

  logIconColor(status: string): string {
    if (status === 'success' || status === 'completed') return 'text-lime-500';
    if (status === 'waiting' || status === 'warning') return 'text-orange-400';
    if (status === 'error' || status === 'failed') return 'text-red-400';
    return '';
  }

  formatLogTime(iso: string): string {
    const d = new Date(iso);
    return [d.getHours(), d.getMinutes(), d.getSeconds()]
      .map(n => String(n).padStart(2, '0'))
      .join(':');
  }

  toggleNotification(label: string) {
    this.notifications.update(list =>
      list.map(n => n.label === label ? { ...n, checked: !n.checked } : n)
    );
  }

  ngOnDestroy(): void {
    this.logSub?.unsubscribe();
  }
}
