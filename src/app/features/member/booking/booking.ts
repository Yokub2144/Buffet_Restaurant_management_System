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

  private pollingTimer: any;
  private isPolling = false;

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

  ngOnDestroy() {
    this.stopPolling();
  }
  stopPolling() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
    this.isPolling = false;
  }

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
    if (adults <= 0 && children <= 0) {
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

    //  สร้างการจองก่อน
    this.bookingService.createBooking(createPayload).subscribe({
      next: (res: any) => {
        this.pendingBookingId = res.booking_id;
        this.bookedTableNames = res.tables || this.selectedTables.map((t) => t.table_Number);
        this.depositAmount = res.amount_pay;

        //  เมื่อจองเร็จ เรียกเจน QR Pay ทันที
        this.generatePaymentQr(res.booking_id);
      },
      error: (err) => {
        this.isLoading = false;
        alert('การจองล้มเหลว: ' + (err.error?.message || 'โปรดลองอีกครั้ง'));
      },
    });
  }
  // ฟังก์ชันสำหรับเจน QR
  generatePaymentQr(bookingId: number) {
    this.paymentService.CreateQr(bookingId).subscribe({
      next: (res: any) => {
        // ตรวจสอบว่ามีข้อมูลส่งมาไหม
        if (res && res.qr_data) {
          try {
            //  แปลง String ใน qr_data ให้เป็น Object
            const parsedData = JSON.parse(res.qr_data);
            this.promptPayQrUrl = parsedData.data?.qr_url || '';
            this.transactionId = res.transaction_id;
            this.depositAmount = res.amount_pay;
            this.isLoading = false;
            this.showBookingModal = false;
            this.showPaymentModal = true;

            this.startAutoCheckStatus();
          } catch (e) {
            console.error('Parsing error:', e);
            alert('ข้อมูล QR Code ผิดพลาด');
            this.isLoading = false;
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
        alert('ไม่สามารถสร้าง QR Code ได้');
      },
    });
  }

  startAutoCheckStatus() {
    if (this.isPolling) return;
    this.isPolling = true;

    // ตั้งให้เช็คทุก 3 วินาที
    this.pollingTimer = setInterval(() => {
      if (!this.transactionId) return;

      this.paymentService.checkPaymentStatus(this.transactionId).subscribe({
        next: (result: any) => {
          if (result.status === 'success') {
            this.stopPolling();
            this.handlePaymentSuccess();
          }
        },
        error: (err) => {
          console.error('Polling error:', err);
        },
      });
    }, 3000);
  }

  handlePaymentSuccess() {
    this.bookingId = this.pendingBookingId;

    // อัพเดตสถานะ Booking เป็น Confirmed
    this.bookingService.updateBookingStatus(this.pendingBookingId!, 'Confirmed').subscribe({
      next: (res: any) => {
        this.bookingService.getBooking(this.pendingBookingId!).subscribe({
          next: (booking: any) => {
            this.qrUrl = res.qr_url || '';
            this.paymentSuccess = true;
            this.showPaymentModal = false;
            this.showWaitingModal = true;
            this.bookingId = this.pendingBookingId;
            this.selectedTables = [];
            this.bookingForm = {
              NumAdults: 0,
              NumChildren: 0,
              BookingDate: '',
              BookingTime: '',
            };
            this.loadTables();
          },
        });
      },
    });
  }

  confirmPayment() {
    if (!this.transactionId) {
      alert('ไม่พบข้อมูล Transaction');
      return;
    }

    this.isVerifying = true;

    this.paymentService.checkPaymentStatus(this.transactionId).subscribe({
      next: (result: any) => {
        this.isVerifying = false;

        if (result.status === 'pending') {
          alert('ยังไม่ได้ชำระเงิน กรุณาชำระเงินก่อน');
        } else if (result.status === 'success') {
          // this.bookingId = this.pendingBookingId;
          this.stopPolling();
          this.handlePaymentSuccess();
          // 1. อัพเดตสถานะ Booking เป็น Confirmed + ปรับโต๊ะเป็นติดจอง
          this.bookingService.updateBookingStatus(this.pendingBookingId!, 'Confirmed').subscribe({
            next: (res: any) => {
              // 2. ดึง QR เช็คอิน
              this.bookingService.getBooking(this.pendingBookingId!).subscribe({
                next: (booking: any) => {
                  this.qrUrl = res.qr_url || '';
                  this.paymentSuccess = true;
                  this.showPaymentModal = false;
                  this.showWaitingModal = true;
                  this.bookingId = this.pendingBookingId;
                  this.selectedTables = [];
                  this.bookingForm = {
                    NumAdults: 0,
                    NumChildren: 0,
                    BookingDate: '',
                    BookingTime: '',
                  };
                  this.loadTables();
                },
              });
            },
          });
        }
      },
      error: (err) => {
        this.isVerifying = false;
        console.error(err);
        alert('เกิดข้อผิดพลาดในการตรวจสอบสถานะ');
      },
    });
  }
}
