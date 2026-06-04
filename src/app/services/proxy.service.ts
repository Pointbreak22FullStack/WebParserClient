import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Observable} from 'rxjs';
import {Proxy, ProxyRequest} from '../interfaces/proxy';

@Injectable({
  providedIn: 'root',
})
export class ProxyService {
  private http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/proxies`;

  getAll(): Observable<Proxy[]> {
    return this.http.get<Proxy[]>(this.apiUrl);
  }

  create(proxy: ProxyRequest): Observable<number> {
    return this.http.post<number>(this.apiUrl, proxy);
  }

  update(id: number, proxy: ProxyRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, { id, ...proxy });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
