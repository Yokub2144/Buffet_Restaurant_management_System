import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { Constants } from '../../config/contants';
@Injectable({
  providedIn: 'root',
})
export class SignalrService {
  private hubConnection!: signalR.HubConnection;
  public tableStatus$ = new Subject<any>();
  constructor(private constants: Constants) {
    this.initConnection();
  }
  private initConnection() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.constants.URL_signalR + 'tableStatusHub')
      .withAutomaticReconnect()
      .build();

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
