import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Proxy } from '../../interfaces/proxy';
import { ProxyModal } from '../../modal-windows/proxy-modal/proxy-modal';
import { ProxyStore } from '../../stores/proxy.store';
import { TabFilter } from '../../interfaces/tab-filter';
import { SortIconComponent } from '../../components/sort-icon/sort-icon';

type SortDir = 'asc' | 'desc' | null;

@Component({
  selector: 'app-proxies',
  standalone: true,
  imports: [CommonModule, ProxyModal, SortIconComponent],
  templateUrl: './proxies.html',
  styleUrl: './proxies.css',
})
export class Proxies implements OnInit {
  readonly store = inject(ProxyStore);

  readonly tabs: TabFilter<Proxy>[] = [
    { label: 'Все',       predicate: null },
    { label: 'Активные',  predicate: (p) => p.isActive },
    { label: 'С ошибкой', predicate: (p) => p.hasError },
    { label: 'Согревшие', predicate: (p) => p.isWarming },
    { label: 'Свободные', predicate: (p) => p.isFree },
  ];

  readonly activeFilter = signal<TabFilter<Proxy> | null>(null);
  readonly sortDir = signal<SortDir>(null);

  readonly filteredProxies = computed(() => {
    const pred = this.activeFilter()?.predicate ?? null;
    const dir  = this.sortDir();
    let list   = this.store.proxies();

    if (pred) list = list.filter(pred);

    if (dir) {
      list = [...list].sort((a, b) => {
        const cmp = a.ipAddress.localeCompare(b.ipAddress);
        return dir === 'asc' ? cmp : -cmp;
      });
    }

    return list;
  });

  isProxyModalOpen = signal(false);
  currentModeIsEdit = signal(false);
  selectedProxy = signal<Proxy | null>(null);

  ngOnInit() {
    this.store.loadProxies();
  }

  toggleSort() {
    const next: SortDir = this.sortDir() === null ? 'asc' : this.sortDir() === 'asc' ? 'desc' : null;
    this.sortDir.set(next);
  }

  setFilter(tab: TabFilter<Proxy>) {
    this.activeFilter.set(this.activeFilter()?.label === tab.label ? null : tab);
  }

  isActiveTab(tab: TabFilter<Proxy>): boolean {
    return this.activeFilter()?.label === tab.label;
  }

  openAddModal() {
    this.selectedProxy.set(null);
    this.currentModeIsEdit.set(false);
    this.isProxyModalOpen.set(true);
  }

  openEditModal(proxy: Proxy) {
    this.selectedProxy.set(proxy);
    this.currentModeIsEdit.set(true);
    this.isProxyModalOpen.set(true);
  }

  deleteProxy(id: number) {
    if (confirm('Вы уверены, что хотите удалить этот прокси?')) {
      this.store.deleteProxy(id);
    }
  }
}
