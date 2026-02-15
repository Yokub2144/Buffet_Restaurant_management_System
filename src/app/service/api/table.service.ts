import { Injectable } from '@angular/core';
import { Constants } from '../../config/contants';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Table } from '../../models/table.model';
@Injectable({
  providedIn: 'root',
})
export class TableService {
  private readonly TABLE_KEY = 'table_number';
  constructor(
    private http: HttpClient,
    private constants: Constants,
  ) {}
  setTable(tableNumber: string): void {
    localStorage.setItem(this.TABLE_KEY, tableNumber);
  }

  getTable() {
    return localStorage.getItem(this.TABLE_KEY);
  }

  clearTable(): void {
    localStorage.removeItem(this.TABLE_KEY);
  }

  public getAlltables() {
    const url = this.constants.API_ENDPOINT + '/Manager/getTables';
    const reponse = this.http.get<Table[]>(url);
    return reponse;
  }

  public addTable(options: any) {
    const url = this.constants.API_ENDPOINT + '/Manager/AddTable';
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    console.log(url);
    const httpOptions = {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
      }),
    };
    const response = this.http.post<any>(url, options, httpOptions);
    return response;
  }
  public updateTableStatus(table_id: number, status: string) {
    const url = this.constants.API_ENDPOINT + '/Manager/updateTable';
    const payload = {
      tableId: table_id,
      status: status,
    };
    const response = this.http.put<any>(url, payload);
    return response;
  }
}
