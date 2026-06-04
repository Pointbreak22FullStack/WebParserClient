import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';
import {Account} from '../interfaces/account';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/accounts`;

  getAll(): Observable<Account[]> {
    return this.http.get<Account[]>(this.baseUrl);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  create(account: Partial<Account>): Observable<number> {
    return this.http.post<number>(this.baseUrl, account);
  }

  update(id: number, account: Partial<Account>): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, { id, ...account });
  }
}
