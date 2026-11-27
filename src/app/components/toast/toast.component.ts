import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ToastService, ToastType } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgClass],
  templateUrl: './toast.component.html',
  styles: [`
    .toast {
      display: flex; align-items: flex-start; gap: 0.7rem;
      min-width: 18rem; max-width: 24rem; padding: 0.8rem 0.95rem;
      border-radius: 12px; font-size: 12.5px; font-weight: 500;
      color: var(--color-foreground);
      background: linear-gradient(180deg, #1a1a1e, #131316);
      border: 1px solid var(--color-border-strong);
      box-shadow: 0 20px 50px -16px rgb(0 0 0 / 0.8);
      animation: modal-in 0.25s cubic-bezier(0.22, 1, 0.36, 1) both;
    }
    .toast-success i:first-child { color: var(--color-accent-400); }
    .toast-success { border-color: color-mix(in oklab, var(--color-accent-500) 35%, transparent); }
    .toast-error i:first-child { color: var(--color-destructive); }
    .toast-error { border-color: rgb(255 100 103 / 0.35); }
    .toast-warning i:first-child { color: #fbbf24; }
    .toast-warning { border-color: rgb(245 158 11 / 0.35); }
    .toast-info i:first-child { color: #7dd3fc; }
  `],
})
export class ToastComponent {
  protected toast = inject(ToastService);

  dismiss(id: number): void {
    this.toast.dismiss(id);
  }

  protected toastIcon(type: ToastType): string {
    const map: Record<ToastType, string> = {
      error:   'pi-times-circle',
      success: 'pi-check-circle',
      warning: 'pi-exclamation-triangle',
      info:    'pi-info-circle',
    };
    return map[type];
  }
}
