import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuManager } from '../../../components/menu-bar/menu-manager/menu-manager';
import { TableService } from '../../../service/api/table.service';
import { SignalrService } from '../../../service/api/signalr.service';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { Toast } from 'primeng/toast';
import { Table } from '../../../models/table.model';
import { DialogModule } from 'primeng/dialog';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
@Component({
  selector: 'app-manage-tables',
  imports: [MenuManager, CommonModule, MatIconModule, FormsModule, Toast, DialogModule],
  templateUrl: './manage-tables.html',
  styleUrl: './manage-tables.scss',
})
export class ManageTables implements OnInit {
  tables: Table[] = [];
  totalTable: number = 0;
  showAddTableModal: boolean = false;
  displayShowQr: boolean = false;
  tableNumber: string = '';
  selectedTable: any;
  constructor(
    private tableService: TableService,
    private signalrService: SignalrService,
    private messageService: MessageService,
    private router: Router,
  ) {}
  ngOnInit(): void {
    this.loadTables();

    this.signalrService.tableStatus$.subscribe((updatedTable) => {
      const index = this.tables.findIndex((t) => t.table_id === updatedTable.tableId);
      if (index !== -1) {
        this.tables[index].table_Status = updatedTable.status as 'ว่าง' | 'ติดจอง' | 'ไม่ว่าง';
        console.log(`โต๊ะที่ ${updatedTable.tableId} เปลี่ยนเป็น ${updatedTable.status}`);
      }
    });
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
  toggleAddTableModal(show: boolean) {
    this.showAddTableModal = show;
  }

  async confirmAddTable() {
    const payload = {
      Table_number: this.tableNumber,
    };
    try {
      const response = await lastValueFrom(this.tableService.addTable(payload));
      console.log('Server Response:', response);
      this.loadTables();
      this.tableNumber = '';
      if (response) {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'เพิ่มโต๊ะสำเร็จ',
        });
        setTimeout(() => {
          this.toggleAddTableModal(false);
        }, 1500);
      }
    } catch (error: any) {
      const errorMessage = error?.error?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
      this.messageService.add({
        severity: 'error',
        summary: 'เกิดข้อผิดพลาด',
        detail: errorMessage,
      });
    }
  }
  gotoEditDleteTable() {
    this.router.navigate(['/EditDeleteTable']);
  }
  addTable() {
    this.toggleAddTableModal(true);
  }
  showQr(table_id: number) {
    this.selectedTable = this.tables.find((t) => t.table_id === table_id);
    if (this.selectedTable) {
      this.displayShowQr = true;
    }
  }

  downloadTablePDF() {
    const element = document.getElementById('print-section');
    if (element) {
      html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        logging: true,
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');

        // กำหนดขนาด 100mm x 100mm (คือ 10x10 cm)
        const width = 100;
        const height = 100;

        const x = 5;
        const y = 5;

        pdf.addImage(imgData, 'PNG', x, y, width, height);
        pdf.save(`Table_${this.selectedTable?.table_Number}.pdf`);
      });
    }
  }

  downloadAllTablesPDF() {
    window.print();
  }
}
