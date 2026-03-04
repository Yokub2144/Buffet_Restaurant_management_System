import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuMember } from '../../../components/menu-bar/menu-member/menu-member';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TableService } from '../../../service/api/table.service';
import { BookingService } from '../../../service/api/booking.service';
import { PaymentService } from '../../../service/api/payment.service';
import { SignalrService } from '../../../service/api/signalr.service';
import { AuthService } from '../../../service/api/auth.service';
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
export class Booking implements OnInit, OnDestroy {
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
  showWaitingModal = false;
  paymentSuccess = false;

  isLoading = false;
  isVerifying = false;
  pendingBookingId: number | null = null;
  bookingId: number | null = null;
  bookedTableNames: string[] = [];
  qrUrl: string = '';

  promptPayQrUrl: string = '';
  depositAmount: number = 0;
  transactionId: string = '';

  minDate: string = '';
  minTime: string = '';
  currentMinTime: string = '';
  timeSlots: string[] = [];

  constructor(
    private signalrService: SignalrService,
    private tableService: TableService,
    private bookingService: BookingService,
    private paymentService: PaymentService,
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

  ngOnDestroy() {}

  setMinDate() {
    const now = new Date();
    this.minDate = now.toISOString().split('T')[0];
    const later = new Date(now.getTime() + 30 * 60 * 1000);
    const hh = String(later.getHours()).padStart(2, '0');
    const mm = String(later.getMinutes()).padStart(2, '0');
    this.minTime = `${hh}:${mm}`;
    this.updateCurrentMinTime();
  }

  updateCurrentMinTime() {
    const today = new Date().toISOString().split('T')[0];
    if (!this.bookingForm.BookingDate || this.bookingForm.BookingDate === today) {
      this.currentMinTime = this.minTime;
    } else {
      this.currentMinTime = '00:00';
    }
  }

  onDateChange() {
    this.updateCurrentMinTime();
    const today = new Date().toISOString().split('T')[0];
    if (
      this.bookingForm.BookingDate === today &&
      this.bookingForm.BookingTime &&
      this.bookingForm.BookingTime < this.minTime
    ) {
      this.bookingForm.BookingTime = '';
    }
  }

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

  isSlotDisabled(slot: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    if (!this.bookingForm.BookingDate || this.bookingForm.BookingDate > today) return false;
    if (this.bookingForm.BookingDate === today) return slot < this.minTime;
    return true;
  }

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
    this.promptPayQrUrl = '';
    this.transactionId = '';
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

    const adults = Number(this.bookingForm.NumAdults) || 0;
    const children = Number(this.bookingForm.NumChildren) || 0;
    if (adults + children <= 0) {
      alert('กรุณาระบุจำนวนผู้เข้าใช้บริการอย่างน้อย 1 คน');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (this.bookingForm.BookingDate === today && this.bookingForm.BookingTime < this.minTime) {
      alert('กรุณาเลือกเวลาที่ยังไม่ผ่านมาแล้ว');
      return;
    }

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
      adult_count: adults,
      child_count: children,
    };

    this.bookingService.createBooking(createPayload).subscribe({
      next: (res: any) => {
        this.pendingBookingId = res.booking_id;
        this.bookedTableNames = res.tables;
        this.depositAmount = res.deposit_amount;

        this.paymentService.initiatePayment(res.booking_id).subscribe({
          next: (payRes: any) => {
            this.isLoading = false;
            const qrData = typeof payRes.qr === 'string' ? JSON.parse(payRes.qr) : payRes.qr;
            this.promptPayQrUrl = qrData?.data?.qr_url || '';
            this.transactionId = (qrData?.data?.transactionId || '').trim();
            this.showBookingModal = false;
            this.showPaymentModal = true;
          },
          error: (err: any) => {
            this.isLoading = false;
            alert('ขอ QR ไม่สำเร็จ: ' + (err.error?.message || 'กรุณาลองใหม่'));
          },
        });
      },
      error: (err: any) => {
        this.isLoading = false;
        if (err.status === 409) {
          alert('โต๊ะที่เลือกไม่ว่างแล้ว กรุณาเลือกใหม่');
          this.showBookingModal = false;
          this.loadTables();
        } else {
          alert('สร้างการจองไม่สำเร็จ: ' + (err.error?.message || 'กรุณาลองใหม่'));
        }
      },
    });
  }

  confirmPaymentManual() {
    if (!this.pendingBookingId || !this.transactionId) return;
    this.isVerifying = true;

    this.paymentService.confirmPayment(this.pendingBookingId, this.transactionId).subscribe({
      next: (res: any) => {
        this.isVerifying = false;
        if (res.paid === true) {
          this.bookingId = this.pendingBookingId;
          this.qrUrl = res.checkin_qr_url || '';
          this.showPaymentModal = false;
          this.paymentSuccess = true;
          this.showWaitingModal = true;
          this.pendingBookingId = null;
          this.promptPayQrUrl = '';
          this.transactionId = '';
          this.selectedTables = [];
          this.bookingForm = { NumAdults: 0, NumChildren: 0, BookingDate: '', BookingTime: '' };
          this.loadTables();
        } else {
          alert('❌ ยังไม่พบการชำระเงิน\nกรุณาสแกนจ่ายก่อนกดยืนยันครับ');
        }
      },
      error: (err: any) => {
        this.isVerifying = false;
        alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      },
    });
  }
}
