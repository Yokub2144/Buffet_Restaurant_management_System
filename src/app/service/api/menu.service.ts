import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constants } from '../../config/contants';

export interface Menu {
  menu_id: number;
  menu_Name: string;
  price: number;
  category: string;
  menu_Image: string;
  menu_Type: string;
}

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  constructor(
    private http: HttpClient,
    private constants: Constants,
  ) {}

  public getMenus() {
    const url = this.constants.API_ENDPOINT + '/Menu';
    const response = this.http.get<Menu[]>(url);
    return response;
  }
}
