import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constants } from '../../config/contants';

@Injectable({ providedIn: 'root' })
export class ConfigService {
  constructor(
    private http: HttpClient,
    private constants: Constants,
  ) {}

  private getAuthHeaders() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    };
  }

  // GET /api/ResConfig
  getConfig(): Observable<any[]> {
    return this.http.get<any[]>(`${this.constants.API_ENDPOINT}/ResConfig`);
  }

  // PUT /api/ResConfig/updateConfig
  updateConfig(data: any): Observable<any> {
    return this.http.put(
      `${this.constants.API_ENDPOINT}/ResConfig/updateConfig`,
      data,
      this.getAuthHeaders(),
    );
  }
}
