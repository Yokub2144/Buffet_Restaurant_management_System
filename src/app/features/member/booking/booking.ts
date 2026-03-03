import { Component, OnInit } from '@angular/core';
import { MenuMember } from '../../../components/menu-bar/menu-member/menu-member';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TableService } from '../../../service/api/table.service';
import { BookingService } from '../../../service/api/booking.service';
import { SignalrService } from '../../../service/api/signalr.service';
import { AuthService } from '../../../service/api/auth.service';
import { Table } from '../../../models/table.model';

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
    NumAdults: null as any,
    NumChildren: 0,
    BookingDate: '',
    BookingTime: '',
  };

  showBookingModal = false;
  showPaymentModal = false;
  showWaitingModal = false;
  paymentSuccess = false;

  isLoading = false;
  pendingBookingId: number | null = null;
  bookingId: number | null = null;
  bookedTableNames: string[] = [];
  qrUrl: string = '';

  // วันที่ขั้นต่ำ = วันนี้ (format yyyy-MM-dd)
  minDate: string = '';
  // เวลาขั้นต่ำ +30 นาที จากปัจจุบัน
  minTime: string = '';
  // เวลาที่ input แสดง — dynamic ตามวันที่เลือก
  currentMinTime: string = '';
  // slot เวลา 30 นาที (10:00 - 22:00)
  timeSlots: string[] = [];

  constructor(
    private signalrService: SignalrService,
    private tableService: TableService,
    private bookingService: BookingService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.setMinDate();
    this.generateTimeSlots();
    this.loadTables();
    this.signalrService.tableStatus$.subscribe((updatedTable) => {
      const index = this.tables.findIndex((t) => t.table_id === updatedTable.tableId);
      if (index !== -1) {
        this.tables[index].table_Status = updatedTable.status as 'ว่าง' | 'ติดจอง' | 'ไม่ว่าง';
      }
    });
  }

  setMinDate() {
    const now = new Date();
    this.minDate = now.toISOString().split('T')[0];
    // เวลาปัจจุบัน +30 นาที
    const later = new Date(now.getTime() + 30 * 60 * 1000);
    const hh = String(later.getHours()).padStart(2, '0');
    const mm = String(later.getMinutes()).padStart(2, '0');
    this.minTime = `${hh}:${mm}`;
    // ตั้งค่า currentMinTime ตามวันที่เลือกปัจจุบัน
    this.updateCurrentMinTime();
  }

  // อัปเดต minTime ของ input ตามวันที่เลือก
  updateCurrentMinTime() {
    const today = new Date().toISOString().split('T')[0];
    if (!this.bookingForm.BookingDate || this.bookingForm.BookingDate === today) {
      this.currentMinTime = this.minTime; // วันนี้ → กัน past time
    } else {
      this.currentMinTime = '00:00'; // วันอื่น → เลือกได้ทุกเวลา
    }
  }

  // เมื่อเปลี่ยนวัน ให้ reset เวลา และอัปเดต minTime
  onDateChange() {
    this.updateCurrentMinTime();
    // ถ้าวันนี้และเวลาที่เลือกอยู่ใน past ให้ reset
    const today = new Date().toISOString().split('T')[0];
    if (
      this.bookingForm.BookingDate === today &&
      this.bookingForm.BookingTime &&
      this.bookingForm.BookingTime < this.minTime
    ) {
      this.bookingForm.BookingTime = '';
    }
  }

  // สร้าง slot ทุก 30 นาที 10:00 - 22:00
  generateTimeSlots() {
    const slots: string[] = [];
    for (let h = 10; h <= 22; h++) {
      for (let m = 0; m < 60; m += 30) {
        if (h === 22 && m > 0) break;
        slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
      }
    }
    this.timeSlots = slots;
  }

  // slot ไหน disabled (วันนี้ + เวลาผ่านแล้ว)
  isSlotDisabled(slot: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    if (!this.bookingForm.BookingDate || this.bookingForm.BookingDate !== today) return false;
    return slot < this.minTime;
  }

  // กดปุ่ม slot → เซ็ตเวลา (ถ้ากด slot ที่เลือกอยู่แล้ว = deselect)
  selectSlot(slot: string) {
    if (this.isSlotDisabled(slot)) return;
    this.bookingForm.BookingTime = this.bookingForm.BookingTime === slot ? '' : slot;
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
    this.setMinDate();
    this.showBookingModal = true;
  }

  closeBookingModal() {
    this.showBookingModal = false;
  }

  closePaymentModal() {
    this.showPaymentModal = false;
  }

  closeWaitingModal() {
    this.showWaitingModal = false;
    this.paymentSuccess = false;
    this.qrUrl = '';
    this.bookingId = null;
    this.bookedTableNames = [];
  }

  proceedToPayment() {
    if (!this.bookingForm.BookingDate || !this.bookingForm.BookingTime) {
      alert('กรุณาระบุวันและเวลาจอง');
      return;
    }
    if (this.bookingForm.NumAdults <= 0 && this.bookingForm.NumChildren <= 0) {
      alert('กรุณาระบุจำนวนผู้เข้าใช้บริการ');
      return;
    }
    // ตรวจสอบอีกครั้งว่าไม่ได้เลือกเวลาในอดีต
    const today = new Date().toISOString().split('T')[0];
    if (this.bookingForm.BookingDate === today && this.bookingForm.BookingTime < this.minTime) {
      alert('กรุณาเลือกเวลาที่ยังไม่ผ่านมาแล้ว');
      return;
    }
    this.showBookingModal = false;
    this.showPaymentModal = true;
  }

  confirmPayment() {
    const member = this.authService.getMember();
    if (!member) {
      alert('กรุณาเข้าสู่ระบบก่อน');
      return;
    }
    this.isLoading = true;
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
        this.pendingBookingId = res.booking_id;
        this.bookedTableNames = res.tables;
        this.isLoading = false;
        this.showPaymentModal = false;
        this.showWaitingModal = true;
        this.paymentSuccess = false;
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 409) {
          alert('โต๊ะที่เลือกไม่ว่างแล้ว กรุณาเลือกใหม่');
          this.showPaymentModal = false;
          this.loadTables();
        } else {
          alert('สร้างการจองไม่สำเร็จ: ' + (err.error?.message || 'กรุณาลองใหม่'));
        }
      },
    });
  }

  completeMockPayment() {
    if (!this.pendingBookingId) return;
    this.isLoading = true;
    this.bookingService.mockPayment(this.pendingBookingId).subscribe({
      next: (payRes: any) => {
        this.bookingId = this.pendingBookingId;
        this.qrUrl = payRes.qr_url;

        try {
          localStorage.setItem(`qr_${this.pendingBookingId}`, JSON.stringify(payRes.qr_url));
        } catch (e) {}

        this.isLoading = false;
        this.paymentSuccess = true;
        this.pendingBookingId = null;
        this.selectedTables = [];
        this.bookingForm = { NumAdults: 0, NumChildren: 0, BookingDate: '', BookingTime: '' };
        this.loadTables();
      },
      error: (err) => {
        this.isLoading = false;
        alert('ชำระเงินไม่สำเร็จ: ' + (err.error?.message || 'กรุณาลองใหม่'));
      },
    });
  }
}
