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

  CreateQr(bookingId: number): Observable<any> {
    const url = `${this.constants.API_ENDPOINT}/Payment/generate-qr`;
    return this.http.post(url, { bookingId: bookingId });
  }
  checkPaymentStatus(transactionId: string): Observable<any> {
    const url = `${this.constants.API_ENDPOINT}/Payment/check-status`;
    return this.http.post(url, JSON.stringify(transactionId), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
