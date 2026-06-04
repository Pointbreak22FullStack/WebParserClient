import {Component, inject, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {SettingsStore} from '../../stores/settings.store';
import {SystemSettings} from '../../interfaces/system-settings';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  store = inject(SettingsStore);

  // Геттер для удобного доступа в шаблоне
  get settings() { return this.store.state(); }


  toggle(key: keyof SystemSettings) {
    if (this.settings) {
      this.store.update({ [key]: !this.settings[key] } as Partial<SystemSettings>);
    }
  }

  onInputChange(key: keyof SystemSettings, value: any) {
    this.store.update({ [key]: value });
  }

  save() {
    this.store.save();
  }
}
