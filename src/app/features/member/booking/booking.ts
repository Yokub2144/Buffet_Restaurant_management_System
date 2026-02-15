import { Component, OnInit } from '@angular/core';
import { MenuMember } from '../../../components/menu-bar/menu-member/menu-member';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TableService } from '../../../service/api/table.service';
import { SignalrService } from '../../../service/api/signalr.service';
import { Table } from '../../../models/table.model';

interface BookingForm {
  NumAdults: number;
  NumChildren: number;
  BookingDate: string;
  BookingTime: string;
}

@Component({
  selector: 'app-booking',
  imports: [MenuMember, CommonModule, FormsModule, RouterLink],
  templateUrl: './booking.html',
  styleUrl: './booking.scss',
})
export class Booking implements OnInit {
  tables: Table[] = [];
  selectedTables: Table[] = [];

  bookingForm: BookingForm = {
    NumAdults: 0,
    NumChildren: 0,
    BookingDate: '',
    BookingTime: '',
  };

  showBookingModal: boolean = false;
  showPaymentModal: boolean = false;

  constructor(
    private signalrService: SignalrService,
    private tableService: TableService,
  ) {}

  ngOnInit() {
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
    this.tableService.getAlltables().subscribe({
      next: (response: Table[]) => {
        this.tables = response;
        console.log('ข้อมูลโต๊ะทั้งหมดถูกโหลดแล้ว:', this.tables);
      },
      error: (err) => {
        console.error('โหลดข้อมูลไม่สำเร็จ:', err);
      },
    });
  }

  toggleTableSelection(table: Table) {
    if (table.table_Status !== 'ว่าง') return;

    const index = this.selectedTables.findIndex((t) => t.table_id === table.table_id);

    // เพิ่มหรือลบโต๊ะ
    if (index > -1) {
      this.selectedTables.splice(index, 1); // ยกเลิกเลือก
    } else {
      this.selectedTables.push(table); // เลือกเพิ่ม
    }

    //  สั่งเรียงลำดับใหม่ทันที (Sort Natural Order)
    this.selectedTables.sort((a, b) => {
      return a.table_Number.localeCompare(b.table_Number, undefined, {
        numeric: true,
        sensitivity: 'base',
      });
    });
  }

  // เช็คว่าเลือกหรือยัง
  isSelected(table: Table): boolean {
    return this.selectedTables.some((t) => t.table_id === table.table_id);
  }

  // แสดงผล
  getSelectedTableString(): string {
    if (this.selectedTables.length === 0) return '-';
    return this.selectedTables.map((t) => t.table_Number).join(', ');
  }
  // --- Modal Logic ---
  openBookingModal() {
    if (this.selectedTables.length === 0) {
      alert('กรุณาเลือกโต๊ะก่อนดำเนินการ');
      return;
    }
    this.showBookingModal = true;
  }

  closeBookingModal() {
    this.showBookingModal = false;
  }

  proceedToPayment() {
    if (!this.bookingForm.BookingDate || !this.bookingForm.BookingTime) {
      alert('กรุณาระบุวันและเวลาจอง');
      return;
    }

    this.showBookingModal = false;
    this.showPaymentModal = true;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
  }

  confirmPayment() {
    // TODO: ยิง API จองโต๊ะตรงนี้
    const payload = {
      tables: this.selectedTables.map((t) => t.table_id),
      ...this.bookingForm,
    };

    console.log('Booking Payload:', payload);
    alert('บันทึกการจองเรียบร้อย (Mock)');

    this.showPaymentModal = false;
    this.selectedTables = [];
    this.loadTables(); // โหลดสถานะใหม่
  }
}
