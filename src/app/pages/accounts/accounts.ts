import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { Account, LoginMethod } from '../../interfaces/account';
import { AccountStatus } from '../../interfaces/account-status';
import { CommonModule, DatePipe } from '@angular/common';
import { AccountModal } from '../../modal-windows/account-modal/account-modal';
import { AccountStore } from '../../stores/account.store';
import { TabFilter } from '../../interfaces/tab-filter';
import { SortIconComponent } from '../../components/sort-icon/sort-icon';

type SortField = 'login' | 'sessionInfo' | 'riskScore' | 'status';
type SortDir   = 'asc' | 'desc' | null;

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, AccountModal, DatePipe, SortIconComponent],
  templateUrl: './accounts.html',
  styleUrl: './accounts.css',
})
export class Accounts implements OnInit {
  readonly store = inject(AccountStore);
  readonly LoginMethod = LoginMethod;

  readonly loginMethodLabels: Record<LoginMethod, string> = {
    [LoginMethod.Google]: 'Google / YouTube',
    [LoginMethod.TikTok]: 'TikTok',
    [LoginMethod.Instagram]: 'Instagram',
    [LoginMethod.VK]: 'VK',
  };

  readonly loginMethodColors: Record<LoginMethod, string> = {
    [LoginMethod.Google]: '#ff0033',
    [LoginMethod.TikTok]: '#25f4ee',
    [LoginMethod.Instagram]: '#dd2a7b',
    [LoginMethod.VK]: '#0077ff',
  };

  readonly tabs: TabFilter<Account>[];
  readonly activeFilter = signal<TabFilter<Account> | null>(null);
  readonly sortField = signal<SortField | null>(null);
  readonly sortDir   = signal<SortDir>(null);

  readonly filteredAccounts = computed(() => {
    const pred  = this.activeFilter()?.predicate ?? null;
    const field = this.sortField();
    const dir   = this.sortDir();
    let list    = this.store.accounts();

    if (pred) list = list.filter(pred);

    if (field && dir) {
      list = [...list].sort((a, b) => {
        let cmp = 0;
        switch (field) {
          case 'login':
            cmp = (a.login ?? '').localeCompare(b.login ?? '');
            break;
          case 'sessionInfo':
            cmp = (a.sessionInfo ?? '').localeCompare(b.sessionInfo ?? '');
            break;
          case 'riskScore':
            cmp = (a.riskScore ?? 0) - (b.riskScore ?? 0);
            break;
          case 'status':
            cmp = Accounts.normalizeStatus(a.status) - Accounts.normalizeStatus(b.status);
            break;
        }
        return dir === 'asc' ? cmp : -cmp;
      });
    }

    return list;
  });

  selectedAccount = signal<Account | null>(null);
  isAccountModalOpen = signal(false);
  currentModeIsEdit = signal(false);

  constructor() {
    this.tabs = [
      { label: 'Все', predicate: null },
      ...Object.values(AccountStatus)
        .filter((v): v is AccountStatus => typeof v === 'number')
        .map(status => ({
          label: this.store.getStatusConfig(status).label,
          predicate: (a: Account) => Accounts.normalizeStatus(a.status) === status,
        })),
      { label: 'Без session', predicate: (a: Account) => !a.sessionInfo },
      { label: 'Высокий риск', predicate: (a: Account) => (a.riskScore ?? 0) >= 75 },
    ];
  }

  ngOnInit() {
    this.store.loadAccounts();
  }

  toggleSort(field: SortField) {
    if (this.sortField() !== field) {
      this.sortField.set(field);
      this.sortDir.set('asc');
    } else {
      const next: SortDir = this.sortDir() === 'asc' ? 'desc' : this.sortDir() === 'desc' ? null : 'asc';
      this.sortDir.set(next);
      if (!next) this.sortField.set(null);
    }
  }

  dirFor(field: SortField): SortDir {
    return this.sortField() === field ? this.sortDir() : null;
  }

  setFilter(tab: TabFilter<Account>) {
    this.activeFilter.set(tab.predicate === null && this.activeFilter()?.label === tab.label ? null : tab);
  }

  isActiveTab(tab: TabFilter<Account>): boolean {
    return this.activeFilter()?.label === tab.label;
  }

  deleteAccount(id: number) {
    if (confirm('Удалить этот аккаунт?')) {
      this.store.deleteAccount(id);
    }
  }

  openAddModal() {
    this.selectedAccount.set(null);
    this.currentModeIsEdit.set(false);
    this.isAccountModalOpen.set(true);
  }

  openEditModal(account: Account) {
    this.selectedAccount.set(account);
    this.currentModeIsEdit.set(true);
    this.isAccountModalOpen.set(true);
  }

  formatSessionExpiry(isoDate?: string): string {
    if (!isoDate) return '';
    const d = new Date(isoDate);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${dd}.${mm} · ${hh}:${min}`;
  }

  normalizeLoginMethod(raw: unknown): LoginMethod {
    const n = Number(raw);
    if (!Number.isNaN(n)) return n as LoginMethod;
    return ((LoginMethod as Record<string, unknown>)[raw as string] as LoginMethod) ?? LoginMethod.Google;
  }

  private static normalizeStatus(raw: unknown): AccountStatus {
    const n = Number(raw);
    if (!Number.isNaN(n)) return n as AccountStatus;
    return ((AccountStatus as Record<string, unknown>)[raw as string] as AccountStatus) ?? AccountStatus.Active;
  }
}
