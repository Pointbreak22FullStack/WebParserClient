import {Component, signal} from '@angular/core';

@Component({
  selector: 'app-monitoring',
  imports: [],
  templateUrl: './monitoring.html',
  styleUrl: './monitoring.css',
})
export class Monitoring {
  stats = signal([
    { label: 'Отслеживается', value: '18', subValue: '5 активных', subColor: 'text-zinc-600' },
    { label: 'На 1-м месте', value: '11', subValue: '+2 с вчера', subColor: 'text-lime-500' },
    { label: 'Позиция упала', value: '4', subValue: 'требуют действий', subColor: 'text-orange-500' },
    { label: 'Удалено', value: '3', subValue: 'за 7 дней', subColor: 'text-red-500' }
  ]);

  items = signal([
    {
      id: 1, article: 'Как похудеть за неделю?', comment: 'Советуем проверить сервис...',
      pos: '1', likes: 47, statusText: 'В ТОП-1', checkTime: '5 мин назад',
      statusClass: 'bg-lime-500/10 border-lime-500/20 text-lime-500'
    },
    {
      id: 2, article: 'Лучший кредит 2024', comment: 'Сравните предложения...',
      pos: '3', likes: 12, statusText: 'УПАЛА', checkTime: '8 мин назад',
      statusClass: 'bg-orange-500/10 border-orange-500/20 text-orange-500'
    },
    {
      id: 3, article: 'Где купить iPhone?', comment: 'Рекомендую проверить...',
      pos: '1', likes: 89, statusText: 'В ТОП-1', checkTime: '12 мин назад',
      statusClass: 'bg-lime-500/10 border-lime-500/20 text-lime-500'
    },
    {
      id: 4, article: 'Как учить английский?', comment: 'Отличный онлайн-метод...',
      pos: '—', likes: 0, statusText: 'УДАЛЁН', checkTime: '1 час назад',
      statusClass: 'bg-red-500/10 border-red-500/20 text-red-500'
    }
  ]);
}
