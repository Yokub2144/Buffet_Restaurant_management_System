import { Component, OnInit } from '@angular/core';
import { MenuManager } from '../../../../components/menu-bar/menu-manager/menu-manager';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule, Location } from '@angular/common';
import { Table } from '../../../../models/table.model';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { TableService } from '../../../../service/api/table.service';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-edit-delete-tables',
  imports: [MenuManager, MatIconModule, CommonModule, Toast, DialogModule, FormsModule],
  templateUrl: './edit-delete-tables.html',
  styleUrl: './edit-delete-tables.scss',
})
export class EditDeleteTables implements OnInit {
  tables: Table[] = [];
  totalTable: number = 0;
  displayconfirm: boolean = false;
  displayEditTable: boolean = false;
  tableNumber: string = '';
  selectedTable: any;
  constructor(
    private tableService: TableService,
    private route: Router,
    private messageService: MessageService,
    private location: Location,
  ) {}
  ngOnInit(): void {
    this.loadTables();
  }
  // โหลดข้อมูลโต๊ะทั
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
  goBack() {
    this.location.back();
  }
  addTable() {}
  // แก้ไขโต๊ะ
  editTable(table_id: number) {
    this.selectedTable = this.tables.find((t) => t.table_id === table_id);
    if (this.selectedTable) {
      this.displayEditTable = true;
    }
  }
  // ยืนยันการลบโต๊ะ
  confirm(table_id: number) {
    this.selectedTable = this.tables.find((t) => t.table_id === table_id);
    if (this.selectedTable) {
      this.displayconfirm = true;
    }
  }

  //ลบโต๊ะ
  deleteTable(table_id: number) {
    this.tableService.deleteTable(table_id).subscribe({
      next: (res) => {
        if (res) {
          this.messageService.add({
            severity: 'success',
            summary: 'Deleted Successfully',
            detail: 'ลบข้อมูลโต๊ะเรียบร้อยแล้ว',
            life: 3000,
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
  //บันทึกการแก้ไขโต๊ะ
  saveTableChanges(table_id: number) {
    this.tableService.updateTable(table_id, this.tableNumber).subscribe({
      next: (res) => {
        if (res) {
          this.messageService.add({
            severity: 'success',
            summary: 'Updated Successfully',
            detail: 'อัปเดตข้อมูลโต๊ะเรียบร้อยแล้ว',
            life: 3000,
          });
          this.ngOnInit();
          this.displayEditTable = false;
        }
      },
      error: (err) => {
        const errorMessage = err?.error?.message || 'เกิดข้อผิดพลาดในการอัปเดตข้อมูล';
        this.messageService.add({
          severity: 'error',
          summary: 'เกิดข้อผิดพลาด',
          detail: errorMessage,
        });
      },
    });
  }
}
