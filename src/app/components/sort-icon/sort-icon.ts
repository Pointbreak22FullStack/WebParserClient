import { Component, input } from '@angular/core';

@Component({
  selector: 'app-sort-icon',
  standalone: true,
  template: `
    <span class="inline-flex flex-col gap-[2px] ml-1.5 align-middle">
      @if (direction() === null) {
        <svg width="8" height="5" viewBox="0 0 8 5"><path d="M4 0L7.5 4.5H0.5L4 0Z" fill="currentColor"/></svg>
        <svg width="8" height="5" viewBox="0 0 8 5"><path d="M4 5L0.5 0.5H7.5L4 5Z" fill="currentColor"/></svg>
      } @else if (direction() === 'asc') {
        <svg width="8" height="5" viewBox="0 0 8 5"><path d="M4 0L7.5 4.5H0.5L4 0Z" fill="currentColor"/></svg>
      } @else {
        <svg width="8" height="5" viewBox="0 0 8 5"><path d="M4 5L0.5 0.5H7.5L4 5Z" fill="currentColor"/></svg>
      }
    </span>
  `,
})
export class SortIconComponent {
  direction = input<'asc' | 'desc' | null>(null);
}
