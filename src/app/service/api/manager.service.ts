import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Constants } from '../../config/contants';
@Injectable({
  providedIn: 'root',
})
export class ManagerService {
  constructor(
    private http: HttpClient,
    private constants: Constants,
  ) {}
  public getAllEmployees() {
    const url = this.constants.API_ENDPOINT + '/Manager/getAllEmployees';
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    };
    const response = this.http.get<any>(url, httpOptions);
    return response;
  }

  public getEmployeesNotApproved() {
    const url = this.constants.API_ENDPOINT + '/Manager/getEmployeesNotApproved';
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    };
    const response = this.http.get<any>(url, httpOptions);
    return response;
  }
  public approveEmployee(employeeId: number) {
    const url = this.constants.API_ENDPOINT + `/Manager/approveEmployee?empId=${employeeId}`;
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    console.log(url);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    };
    const response = this.http.post<any>(url, {}, httpOptions);
    return response;
  }
  public rejectEmployee(employeeId: number) {
    const url = this.constants.API_ENDPOINT + `/Manager/rejectEmployee?empId=${employeeId}`;
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    console.log(url);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    };
    const response = this.http.post<any>(url, {}, httpOptions);
    return response;
  }
}
