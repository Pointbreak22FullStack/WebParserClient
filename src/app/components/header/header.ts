import {Component, signal} from '@angular/core';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
// Signal для хранения названия текущей страницы
  currentPage = signal<string>('Дашборд');

  constructor() {
    // Здесь в будущем можно подписаться на события роутера
  }
}
