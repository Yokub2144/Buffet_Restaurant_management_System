import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TableService {
  private readonly TABLE_KEY = 'table_number';
  setTable(tableNumber: string): void {
    localStorage.setItem(this.TABLE_KEY, tableNumber);
  }

  getTable() {
    return localStorage.getItem(this.TABLE_KEY);
  }

  clearTable(): void {
    localStorage.removeItem(this.TABLE_KEY);
  }
}
