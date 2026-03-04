import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constants } from '../../config/contants';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  constructor(
    private http: HttpClient,
    private constants: Constants,
  ) {}

  initiatePayment(bookingId: number): Observable<any> {
    const url = `${this.constants.API_ENDPOINT}/Payment/initiate/${bookingId}`;
    return this.http.post(url, {});
  }

  confirmPayment(bookingId: number, transactionId: string): Observable<any> {
    const url = `${this.constants.API_ENDPOINT}/Payment/confirm/${bookingId}`;
    return this.http.post(url, { transactionId });
  }
}
