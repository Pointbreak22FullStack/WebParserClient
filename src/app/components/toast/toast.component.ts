import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { ToastService, ToastType } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [NgClass],
  templateUrl: './toast.component.html',
})
export class ToastComponent {
  protected toast = inject(ToastService);

  dismiss(id: number): void {
    this.toast.dismiss(id);
  }

  protected toastClass(type: ToastType): string {
    const map: Record<ToastType, string> = {
      error:   'bg-red-600 text-white',
      success: 'bg-green-600 text-white',
      warning: 'bg-yellow-500 text-white',
      info:    'bg-blue-600 text-white',
    };
    return map[type];
  }
}
