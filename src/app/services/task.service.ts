import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { CreateTaskRequest } from '../interfaces/create-task-request';
import { UserTaskDto } from '../interfaces/task';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/tasks`;

  getAll(): Observable<UserTaskDto[]> {
    return this.http.get<UserTaskDto[]>(this.apiUrl);
  }

  createTask(request: CreateTaskRequest): Observable<string> {
    return this.http.post<string>(this.apiUrl, request);
  }

  cancelTask(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/cancel`, {});
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
