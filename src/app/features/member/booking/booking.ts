import { Component, OnInit } from '@angular/core';
import { MenuMember } from '../../../components/menu-bar/menu-member/menu-member';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface Table {
  Table_id: number;
  Table_Number: string;
  Table_Status: 'ว่าง' | 'ติดจอง' | 'ไม่ว่าง';
  Table_QR_Code?: string;
}

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

  constructor() {}

  ngOnInit() {
    this.loadTables();
  }

  // --- ส่วนเชื่อมต่อ API ---
  loadTables() {
    this.tables = [
      { Table_id: 1, Table_Number: 'A1', Table_Status: 'ว่าง' },
      { Table_id: 2, Table_Number: 'A2', Table_Status: 'ไม่ว่าง' },
      { Table_id: 3, Table_Number: 'A3', Table_Status: 'ไม่ว่าง' },
      { Table_id: 4, Table_Number: 'A4', Table_Status: 'ว่าง' },
      { Table_id: 5, Table_Number: 'A5', Table_Status: 'ติดจอง' },
      { Table_id: 6, Table_Number: 'A6', Table_Status: 'ว่าง' },
      { Table_id: 7, Table_Number: 'A7', Table_Status: 'ติดจอง' },
      { Table_id: 8, Table_Number: 'A8', Table_Status: 'ว่าง' },
      { Table_id: 9, Table_Number: 'A9', Table_Status: 'ว่าง' },
      { Table_id: 10, Table_Number: 'A10', Table_Status: 'ว่าง' },
      { Table_id: 11, Table_Number: 'A11', Table_Status: 'ว่าง' },
      { Table_id: 12, Table_Number: 'A12', Table_Status: 'ว่าง' },
      { Table_id: 13, Table_Number: 'A13', Table_Status: 'ไม่ว่าง' },
      { Table_id: 14, Table_Number: 'A14', Table_Status: 'ว่าง' },
      { Table_id: 15, Table_Number: 'A15', Table_Status: 'ว่าง' },
    ];
  }

  toggleTableSelection(table: Table) {
    if (table.Table_Status !== 'ว่าง') return;

    const index = this.selectedTables.findIndex((t) => t.Table_id === table.Table_id);

    // เพิ่มหรือลบโต๊ะ
    if (index > -1) {
      this.selectedTables.splice(index, 1); // ยกเลิกเลือก
    } else {
      this.selectedTables.push(table); // เลือกเพิ่ม
    }

    //  สั่งเรียงลำดับใหม่ทันที (Sort Natural Order)
    this.selectedTables.sort((a, b) => {
      return a.Table_Number.localeCompare(b.Table_Number, undefined, {
        numeric: true,
        sensitivity: 'base',
      });
    });
  }

  // เช็คว่าเลือกหรือยัง
  isSelected(table: Table): boolean {
    return this.selectedTables.some((t) => t.Table_id === table.Table_id);
  }

  // แสดงผล
  getSelectedTableString(): string {
    if (this.selectedTables.length === 0) return '-';
    return this.selectedTables.map((t) => t.Table_Number).join(', ');
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
      tables: this.selectedTables.map((t) => t.Table_id),
      ...this.bookingForm,
    };

    console.log('Booking Payload:', payload);
    alert('บันทึกการจองเรียบร้อย (Mock)');

    this.showPaymentModal = false;
    this.selectedTables = [];
    this.loadTables(); // โหลดสถานะใหม่
  }
}
