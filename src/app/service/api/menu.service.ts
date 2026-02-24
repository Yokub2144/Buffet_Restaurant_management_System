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

  // 1. ดึงข้อมูลทั้งหมด
  public getMenus(): Observable<Menu[]> {
    const url = this.constants.API_ENDPOINT + '/Menu';
    return this.http.get<Menu[]>(url);
  }

  // 2. เพิ่มข้อมูลใหม่ (ส่งเป็น FormData)
  public createMenu(formData: FormData): Observable<any> {
    const url = this.constants.API_ENDPOINT + '/Menu';
    return this.http.post(url, formData); // <-- แก้ไขตรงนี้ให้ใช้ตัวแปร url
  }

  // 3. แก้ไขข้อมูล (ส่งเป็น FormData)
  public updateMenu(id: number, formData: FormData): Observable<any> {
    const url = `${this.constants.API_ENDPOINT}/Menu/${id}`; // <-- สร้าง url ให้ถูกต้อง
    return this.http.put(url, formData); // <-- แก้ไขตรงนี้ให้ใช้ตัวแปร url
  }

  // 4. ลบข้อมูล
  public deleteMenu(menuId: number): Observable<any> {
    const url = `${this.constants.API_ENDPOINT}/Menu/${menuId}`;
    return this.http.delete(url);
  }
}
