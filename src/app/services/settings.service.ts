import { Injectable } from '@angular/core';
import {SystemSettings} from '../interfaces/system-settings';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly apiUrl = `${environment.apiUrl}/settings`; // Укажи свой базовый URL

  constructor(private http: HttpClient) {}

  getSettings(): Observable<SystemSettings> {
    return this.http.get<SystemSettings>(this.apiUrl);
  }

  updateSettings(settings: SystemSettings): Observable<void> {
    return this.http.put<void>(this.apiUrl, settings);
  }
}
