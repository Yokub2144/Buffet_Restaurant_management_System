import { Component, OnInit } from '@angular/core';
import { MenuMember } from '../../../components/menu-bar/menu-member/menu-member';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TableService } from '../../../service/api/table.service';
import { SignalrService } from '../../../service/api/signalr.service';
import { Table } from '../../../models/table.model';
import { BookingService } from '../../../service/api/booking.service';

interface BookingForm {
  NumAdults: number;
  NumChildren: number;
  BookingDate: string;
  BookingTime: string;
}

interface QrItem {
  tableId: number;
  qrImageUrl: string;
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

  showBookingModal = false;
  showPaymentModal = false;
  showQrModal = false;

  isLoading = false;
  bookingId: number | null = null;
  qrList: QrItem[] = [];
  authService: any;

  constructor(
    private signalrService: SignalrService,
    private tableService: TableService,
    private bookingService: BookingService,
  ) {}

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
    this.isLoading = true;

    const member = this.authService.getMember();
    if (!member) {
      alert('กรุณาเข้าสู่ระบบก่อน');
      this.isLoading = false;
      return;
    }

    const createPayload = {
      member_id: Number(member.id),
      table_ids: this.selectedTables.map((t) => t.table_id),
      booking_date: this.bookingForm.BookingDate,
      booking_time: this.bookingForm.BookingTime,
      adult_count: this.bookingForm.NumAdults,
      child_count: this.bookingForm.NumChildren,
    };

    this.bookingService.createBooking(createPayload).subscribe({
      next: (res: any) => {
        this.bookingId = res.booking_id;

        this.bookingService.mockPayment(res.booking_id).subscribe({
          next: (payRes: any) => {
            this.qrList = payRes.qr_list;
            this.isLoading = false;
            this.showPaymentModal = false;
            this.showQrModal = true;

            this.selectedTables = [];
            this.loadTables();
          },
          error: (err) => {
            this.isLoading = false;
            alert('ชำระเงินไม่สำเร็จ: ' + (err.error?.message || err.message));
          },
        });
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 409) {
          alert('โต๊ะที่เลือกไม่ว่างแล้ว กรุณาเลือกใหม่');
          this.loadTables();
          this.showPaymentModal = false;
        } else {
          alert('สร้างการจองไม่สำเร็จ: ' + (err.error?.message || err.message));
        }
      },
    });
  }

  closeQrModal() {
    this.showQrModal = false;
    this.qrList = [];
    this.bookingId = null;
  }
}
