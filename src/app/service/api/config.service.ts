import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constants } from '../../config/contants';

@Injectable({
  providedIn: 'root',
})
export class ConfigService {
  constructor(
    private http: HttpClient,
    private constants: Constants,
  ) {}
  public getConfig(): Observable<any> {
    return this.http.get(`${this.constants.API_ENDPOINT}/ResConfig`);
  }
}
