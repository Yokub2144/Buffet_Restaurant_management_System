import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class SignalrService {
  private hubConnection!: signalR.HubConnection;
  public tableStatus$ = new Subject<any>();
  constructor() {
    this.initConnection();
  }
  private initConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5277/tableStatusHub')
      .withAutomaticReconnect()
      .build();

    // เริ่มการดักฟัง Event ทันทีที่ Build เสร็จ
    this.registerOnEvents();
    this.start();
  }

  private registerOnEvents() {
    this.hubConnection.on('UpdateTable', (data) => {
      console.log('ข้อมูลที่ได้รับจาก Server:', data);
      this.tableStatus$.next(data);
    });
  }

  private async start() {
    try {
      await this.hubConnection.start();
      console.log('SignalR: Connected');
    } catch (err) {
      console.error('SignalR: Error while starting', err);
    }
  }
}
