import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private readonly API_URL = 'http://localhost:3000/tasks';

  constructor(private http: HttpClient) {}

  getTasks(): Observable<any[]> {
    return this.http.get<any[]>(this.API_URL);
  }

  createTask(task: any): Observable<any> {
    return this.http.post<any>(this.API_URL, task);
  }

  updateTask(id: number, task: any): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/${id}`, task);
  }

  deleteTask(id: number): Observable<any> {
    return this.http.delete<any>(`${this.API_URL}/${id}`);
  }
}
