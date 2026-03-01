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

  public getMenus(): Observable<Menu[]> {
    const url = this.constants.API_ENDPOINT + '/Menu';
    return this.http.get<Menu[]>(url);
  }

  public createMenu(formData: FormData): Observable<any> {
    const url = this.constants.API_ENDPOINT + '/Menu';
    return this.http.post(url, formData);
  }

  public updateMenu(id: number, formData: FormData): Observable<any> {
    const url = `${this.constants.API_ENDPOINT}/Menu/${id}`;
    return this.http.put(url, formData);
  }

  public deleteMenu(menuId: number): Observable<any> {
    const url = `${this.constants.API_ENDPOINT}/Menu/${menuId}`;
    return this.http.delete(url);
  }
}
