import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constants } from '../../config/contants';
import { Discount } from '../../models/discount.model';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class DiscountService {
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
  public getDiscount() {
    const url = `${this.constants.API_ENDPOINT}/Discount`;
    return this.http.get<Discount[]>(url);
  }
  public getDiscountById(discountId: number) {
    const url = `${this.constants.API_ENDPOINT}/Discount/${discountId}`;
    return this.http.get<Discount>(url);
  }
  addDiscount(data: any): Observable<any> {
    return this.http.post(
      `${this.constants.API_ENDPOINT}/Discount/add`,
      data,
      this.getAuthHeaders(),
    );
  }

  updateDiscount(id: number, data: any): Observable<any> {
    return this.http.put(
      `${this.constants.API_ENDPOINT}/Discount/update/${id}`,
      data,
      this.getAuthHeaders(),
    );
  }

  deleteDiscount(id: number): Observable<any> {
    return this.http.delete(`${this.constants.API_ENDPOINT}/Discount/${id}`, this.getAuthHeaders());
  }
}
