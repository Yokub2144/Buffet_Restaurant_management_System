import { Component, OnInit } from '@angular/core';
import { MenuManager } from '../../../../components/menu-bar/menu-manager/menu-manager';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Table } from '../../../../models/table.model';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { TableService } from '../../../../service/api/table.service';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
@Component({
  selector: 'app-edit-delete-tables',
  imports: [MenuManager, MatIconModule, CommonModule, Toast, DialogModule],
  templateUrl: './edit-delete-tables.html',
  styleUrl: './edit-delete-tables.scss',
})
export class EditDeleteTables implements OnInit {
  tables: Table[] = [];
  totalTable: number = 0;
  displayconfirm: boolean = false;
  selectedTable: any;
  constructor(
    private tableService: TableService,
    private route: Router,
    private messageService: MessageService,
  ) {}
  ngOnInit(): void {
    this.loadTables();
  }
  loadTables() {
    console.log('โต๊ะทั้งหมด' + this.totalTable);
    this.tableService.getAlltables().subscribe({
      next: (response: Table[]) => {
        this.tables = response;
        this.totalTable = response.length;
        console.log('table', this.totalTable);
        console.log('ข้อมูลโต๊ะทั้งหมดถูกโหลดแล้ว:', this.tables);
      },
      error: (err) => {
        console.error('โหลดข้อมูลไม่สำเร็จ:', err);
      },
    });
  }
  goBack() {}
  addTable() {}

  editTable(table_id: number) {}

  confirm(table_id: number) {
    this.selectedTable = this.tables.find((t) => t.table_id === table_id);
    if (this.selectedTable) {
      this.displayconfirm = true;
    }
  }
  deleteTable(table_id: number) {
    this.tableService.deleteTable(table_id).subscribe({
      next: (res) => {
        if (res) {
          this.messageService.add({
            severity: 'success',
            summary: 'Deleted Successfully', // หัวข้อ
            detail: 'ลบข้อมูลโต๊ะเรียบร้อยแล้ว', // รายละเอียด
            life: 3000, // ให้หายไปเองใน 3 วินาที
          });
          this.ngOnInit();
        }
      },
      error: (err) => {
        const errorMessage = err?.error?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: errorMessage,
        });
      },
    });
  }
}
