import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();
  private nextId = 0;

  show(message: string, type: ToastType = 'info', duration = 4000): void {
    const id = ++this.nextId;
    this._toasts.update(t => [...t, { id, message, type }]);
    setTimeout(() => this.dismiss(id), duration);
  }

  error(message: string): void   { this.show(message, 'error'); }
  success(message: string): void { this.show(message, 'success'); }
  warning(message: string): void { this.show(message, 'warning'); }
  info(message: string): void    { this.show(message, 'info'); }

  dismiss(id: number): void {
    this._toasts.update(t => t.filter(toast => toast.id !== id));
  }
}
