import {Component, inject, input, OnInit, output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {ProxyStore} from '../../stores/proxy.store';
import {Proxy, ProxyRequest} from '../../interfaces/proxy';
import {ProxyType} from '../../interfaces/proxy-type';

@Component({
  selector: 'app-proxy-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './proxy-modal.html',
  styleUrl: './proxy-modal.css',
})
export class ProxyModal implements OnInit {
  private fb = inject(FormBuilder);
  protected store = inject(ProxyStore);

  isEditMode = input<boolean>(false);
  proxyData = input<Proxy | null>(null);
  closeModal = output<void>();

  proxyForm = this.fb.group({
    ipAddress: ['', [Validators.required]],
    port: [null as number | null, [Validators.required, Validators.min(1)]],
    login: ['', [Validators.required]],
    password: ['', [Validators.required]],
    type: [ProxyType.Http, [Validators.required]]
  });

  ngOnInit() {
    if (this.isEditMode() && this.proxyData()) {
      const data = this.proxyData()!;
      const rawType = data.type as unknown;
      const n = Number(rawType);
      const type: ProxyType = Number.isNaN(n)
        ? (((ProxyType as Record<string, unknown>)[rawType as string] as ProxyType) ?? ProxyType.Http)
        : n as ProxyType;

      // Сервер не отдаёт пароль: при редактировании пустое поле = оставить текущий
      this.proxyForm.patchValue({ ...data, password: '', type });
      this.proxyForm.controls.password.clearValidators();
      this.proxyForm.controls.password.updateValueAndValidity();
    }
  }

  onSubmit() {
    if (this.proxyForm.valid) {
      const payload: ProxyRequest = {
        ipAddress: this.proxyForm.value.ipAddress!,
        port: this.proxyForm.value.port!,
        login: this.proxyForm.value.login!,
        password: this.proxyForm.value.password ?? '',
        type: Number(this.proxyForm.value.type) as ProxyType,
      };
      this.store.saveProxy(payload, this.proxyData()?.id);
      this.closeModal.emit();
    }
  }
}
