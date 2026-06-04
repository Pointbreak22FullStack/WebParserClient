import {Injectable, signal, computed, inject} from '@angular/core';
import {SettingsService} from '../services/settings.service';
import {SystemSettings} from '../interfaces/system-settings';


@Injectable({ providedIn: 'root' })
export class SettingsStore {
  private service = inject(SettingsService);

  state = signal<SystemSettings | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // ВАЖНО: Храним копию того, что сейчас реально лежит в базе
  private initialRemoteState: SystemSettings | null = null;

  constructor() {
    this.load();
  }

  load() {
    this.isLoading.set(true);
    this.service.getSettings().subscribe({
      next: (data) => {
        this.state.set(data);
        // СОХРАНЯЕМ ЭТАЛОН: делаем глубокую копию через JSON,
        // чтобы изменения в state не задели initialRemoteState
        this.initialRemoteState = JSON.parse(JSON.stringify(data));
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.isLoading.set(false);
      }
    });
  }

  reset() {
    if (this.initialRemoteState) {
      // Клонируем эталон обратно в рабочее состояние
      this.state.set(JSON.parse(JSON.stringify(this.initialRemoteState)));
    }
  }

  update(partial: Partial<SystemSettings>) {
    const current = this.state();
    if (current) {
      this.state.set({ ...current, ...partial });
    }
  }

  save() {
    const data = this.state();
    if (!data) return;

    this.isLoading.set(true);
    this.service.updateSettings(data).subscribe({
      next: () => {
        // ОБНОВЛЯЕМ ЭТАЛОН: теперь сохраненные данные стали официальной версией
        this.initialRemoteState = JSON.parse(JSON.stringify(data));
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.isLoading.set(false);
      }
    });
  }
}
