import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constants } from '../../config/contants'; // ดึง Config Endpoint มาใช้งาน

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  constructor(
    private http: HttpClient,
    private constants: Constants,
  ) {}

  // ฟังก์ชันส่วนตัว (Helper) สำหรับสร้าง Header สิทธิ์เจ้าของร้านอัตโนมัติ
  private getAuthOptions(isMultipart: boolean = false) {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    const headersConfig: any = {
      Authorization: `Bearer ${token}`,
    };

    // สำหรับ FormData (Multipart) ห้ามตั้ง Content-Type เป็น application/json
    // และห้ามใส่ 'multipart/form-data' ไปตรงๆ (ปล่อยให้ Browser จัดการ Boundary เอง)
    if (!isMultipart) {
      headersConfig['Content-Type'] = 'application/json';
    }

    return {
      headers: new HttpHeaders(headersConfig),
    };
  }

  //  ดึงรูปทั้งหมดจาก DB (ไม่ต้องใช้สิทธิ์ Token)
  public getImages(): Observable<any[]> {
    const url = this.constants.API_ENDPOINT + '/ResImage';
    return this.http.get<any[]>(url);
  }

  //  อัปโหลดรูปภาพใหม่ (ใช้สิทธิ์เจ้าของร้าน + ส่งแบบ FormData)
  public uploadImage(formData: FormData): Observable<any> {
    const url = this.constants.API_ENDPOINT + '/ResImage/upload';
    const httpOptions = this.getAuthOptions(true);
    return this.http.post<any>(url, formData, httpOptions);
  }

  // แก้ไขภาพทับรูปเดิม (ใช้สิทธิ์เจ้าของร้าน + ส่งแบบ FormData)
  public updateImage(id: number, formData: FormData): Observable<any> {
    const url = this.constants.API_ENDPOINT + `/ResImage/update/${id}`;
    const httpOptions = this.getAuthOptions(true);
    return this.http.put<any>(url, formData, httpOptions);
  }

  // ลบรูปภาพออกจากระบบ (ใช้สิทธิ์เจ้าของร้าน)
  public deleteImage(cartItemId: number): Observable<any> {
    const url = this.constants.API_ENDPOINT + `/ResImage/${cartItemId}`;
    const httpOptions = this.getAuthOptions(false);
    return this.http.delete<any>(url, httpOptions);
  }
}
