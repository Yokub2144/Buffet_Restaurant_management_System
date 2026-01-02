import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Constants } from '../../config/contants';
import { HttpHeaders } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient, private constants: Constants) {}
  public registerEmployee(options?: any) {
    const url = this.constants.API_ENDPOINT + '/Auth/register-employee';
    const response = this.http.post<any>(url, options);
    return response;
  }

  public registerMember(options?: any) {
    const url = this.constants.API_ENDPOINT + '/Auth/register-member';
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
      }),
    };
    const response = this.http.post<any>(url, options, httpOptions);
    return response;
  }

  public loginEmployee(options?: any) {
    const url = this.constants.API_ENDPOINT + '/Auth/login-employee';
    const response = this.http.post<any>(url, options);
    return response;
  }
}
