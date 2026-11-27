import {Component, inject, input, OnInit, output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule} from '@angular/forms';
import {AccountStore} from '../../stores/account.store';
import {ProxyStore} from '../../stores/proxy.store';
import {Account, LoginMethod} from '../../interfaces/account';

@Component({
  selector: 'app-account-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-modal.html',
  styleUrl: './account-modal.css',
})
export class AccountModal implements OnInit {
  private fb = inject(FormBuilder);
  private store = inject(AccountStore);
  protected proxyStore = inject(ProxyStore);

  isEditMode = input<boolean>(false);
  accountData = input<Account | null>(null);
  closeModal = output<void>();

  loginMethods = [
    { value: LoginMethod.Google, label: 'Google / YouTube' },
    { value: LoginMethod.TikTok, label: 'TikTok' },
    { value: LoginMethod.Instagram, label: 'Instagram' },
    { value: LoginMethod.VK, label: 'VK' },
  ];

  accountForm = this.fb.group({
    loginMethod: [LoginMethod.Google],
    login: [''],
    password: [''],
    countryCode: ['+373'],
    phoneBody: [''],
    firstName: [''],
    lastName: [''],
    proxyId: [null as number | null],
    description: [''],
    phoneNumber: ''
  });

  ngOnInit() {
    if (!this.proxyStore.proxies().length) {
      this.proxyStore.loadProxies();
    }

    if (this.isEditMode() && this.accountData()) {
      const data = this.accountData()!;

      let code = '+373';
      let phone = data.phoneNumber || '';
      if (phone.startsWith('+')) {
        code = phone.substring(0, 4);
        phone = phone.substring(4);
      }

      const raw = data.loginMethod as unknown;
      const n = Number(raw);
      const loginMethod: LoginMethod = Number.isNaN(n)
        ? (((LoginMethod as Record<string, unknown>)[raw as string] as LoginMethod) ?? LoginMethod.Google)
        : n as LoginMethod;

      this.accountForm.patchValue({
        loginMethod,
        login: data.login,
        password: data.password,
        description: data.description,
        countryCode: code,
        phoneBody: phone,
        firstName: data.firstName,
        lastName: data.lastName,
        proxyId: data.proxyId
      });
    }
  }

  onSave() {
    if (this.accountForm.valid) {
      const f = this.accountForm.value;

      const payload: Partial<Account> = {
        loginMethod: Number(f.loginMethod) as LoginMethod,
        login: f.login || '',
        password: f.password || '',
        phoneNumber: `${f.countryCode}${f.phoneBody}`,
        firstName: f.firstName || '',
        lastName: f.lastName || '',
        description: f.description || '',
        proxyId: f.proxyId ? Number(f.proxyId) : null,
        sessionInfo: this.isEditMode() ? (this.accountData()?.sessionInfo ?? '') : '',
      };

      this.store.saveAccount(payload, this.accountData()?.id);
      this.closeModal.emit();
    }
  }
}
