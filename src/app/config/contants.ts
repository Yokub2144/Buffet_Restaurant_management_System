import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Constants {
  public readonly API_ENDPOINT: string = 'http://localhost:5277/api';
  public readonly URL_signalR: string = 'http://localhost:5277/';
}
