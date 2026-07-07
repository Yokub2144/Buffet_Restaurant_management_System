import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constants } from '../../config/contants';

export interface Discount {
  discount_id: number;
  discount_Name: string;
  discount_amount: number;
  discount_Type: string; // 'fixed' | 'percent'
  startDate: string;
  endDate: string;
}

@Injectable({ providedIn: 'root' })
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

  getDiscounts(): Observable<Discount[]> {
    return this.http.get<Discount[]>(`${this.constants.API_ENDPOINT}/Discount`);
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
