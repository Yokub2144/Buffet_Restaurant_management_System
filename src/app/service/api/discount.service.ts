import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Constants } from '../../config/contants';
import { Discount } from '../../models/discount.model';
@Injectable({
  providedIn: 'root',
})
export class DiscountService {
  constructor(
    private http: HttpClient,
    private constants: Constants,
  ) {}
  public getDiscount(){
    const url = `${this.constants.API_ENDPOINT}/Discount`;
    return this.http.get<Discount[]>(url);
  }
  public getDiscountById(discountId: number){
    const url = `${this.constants.API_ENDPOINT}/Discount/${discountId}`;
    return this.http.get<Discount>(url);
  }
}