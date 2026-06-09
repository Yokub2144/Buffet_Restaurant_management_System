import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MenuServer } from "../../../components/menu-bar/menu-server/menu-server";
import { Table } from '../../../models/table.model';
import { SignalrService } from '../../../service/api/signalr.service';
import { TableService } from '../../../service/api/table.service';
@Component({
  selector: 'app-create-bill',
  imports: [MenuServer, CommonModule, MatIconModule, FormsModule],
  templateUrl: './create-bill.html',
  styleUrl: './create-bill.scss',
})
export class CreateBill {
  tables: Table[] = [];
  selectedTables: Table[] = [];
  totaltable: number = 0;
  adultCount: number = 0;
  childCount: number = 0;
  selectedDiscount: any = 0;
  showrecordModal: boolean = false;
  constructor(
    private signalrService: SignalrService,
    private tableService: TableService,
  ) { }
  ngOnInit() {
    this.loadTables();
    this.signalrService.tableStatus$.subscribe((updatedTable) => {
      const index = this.tables.findIndex((t) => t.table_id === updatedTable.tableId);
      if (index !== -1) {
        this.tables[index].table_Status = updatedTable.status as 'ว่าง' | 'ติดจอง' | 'ไม่ว่าง';
      }
    });
  }
  loadTables() {
    this.tableService.getAlltables().subscribe({
      next: (response: Table[]) => {
        this.tables = response;
        this.totaltable = this.tables.length;
      },
      error: (err) => {
        console.error('โหลดข้อมูลไม่สำเร็จ:', err);
      },
    });


  }
  toggleTableSelection(table: Table) {
    if (table.table_Status !== 'ว่าง') return;
    const index = this.selectedTables.findIndex((t) => t.table_id === table.table_id);
    if (index > -1) {
      this.selectedTables.splice(index, 1);
    } else {
      this.selectedTables.push(table);
    }
    this.selectedTables.sort((a, b) =>
      a.table_Number.localeCompare(b.table_Number, undefined, {
        numeric: true,
        sensitivity: 'base',
      }),
    );
  }

  isSelected(table: Table): boolean {
    return this.selectedTables.some((t) => t.table_id === table.table_id);
  }

  getSelectedTableString(): string {
    if (this.selectedTables.length === 0) return '-';
    return this.selectedTables.map((t) => t.table_Number).join(', ');
  }

  togglerecordModal(show: boolean) {
    this.showrecordModal = show;
  }
  confirmRecord(){}
}
