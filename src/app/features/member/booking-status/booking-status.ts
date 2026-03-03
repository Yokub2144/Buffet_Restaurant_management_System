import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookingService } from '../../../service/api/booking.service';
import { AuthService } from '../../../service/api/auth.service';
import { SignalrService } from '../../../service/api/signalr.service';

interface BookingDetail {
  booking_id: number;
  tableNumbers: string[];
  childCount: number;
  adultCount: number;
  date: string;
  time: string;
  status: string;
  qrList: { tableId: number; qrImageUrl: string }[];
}

@Component({
  selector: 'app-booking-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-status.html',
  styleUrl: './booking-status.scss',
})
export class BookingStatus implements OnInit {
  bookingList: BookingDetail[] = [];
  activeQrBookingId: number | null = null;

  loading = false;
  errorMessage = '';

  showCheckInSuccessAlert = false;

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private router: Router,
    private signalrService: SignalrService,
  ) {}

  ngOnInit() {
    this.loadLatestBooking();

    this.signalrService.on('BookingStatusUpdated', (data: any) => {
      const newStatus = data.status ? data.status.toLowerCase() : '';

      if (newStatus === 'completed' || newStatus === 'checkedin') {
        if (this.activeQrBookingId === data.bookingId) {
          this.activeQrBookingId = null;
        }

        this.bookingList = this.bookingList.filter((b) => b.booking_id !== data.bookingId);

        this.showSuccessAlert();
      } else {
        this.loadLatestBooking();
      }
    });
  }

  showSuccessAlert() {
    this.showCheckInSuccessAlert = true;
    setTimeout(() => {
      this.showCheckInSuccessAlert = false;
    }, 3000);
  }

  loadLatestBooking() {
    const member = this.authService.getMember();
    if (!member) {
      this.errorMessage = 'กรุณาเข้าสู่ระบบก่อน';
      return;
    }

    this.loading = true;
    this.bookingService.getByMember(Number(member.id)).subscribe({
      next: (response: any) => {
        this.loading = false;

        let resArray: any[] = [];
        if (Array.isArray(response)) {
          resArray = response;
        } else if (response && Array.isArray(response.data)) {
          resArray = response.data;
        }

        const activeBookings = resArray.filter((b: any) => {
          const status = (b.booking_Status || '').toLowerCase();
          return status === 'pending' || status === 'confirmed';
        });

        if (activeBookings.length === 0) {
          this.errorMessage = 'ไม่มีการจองที่รอดำเนินการ';
          this.bookingList = [];
          return;
        }

        this.errorMessage = '';
        this.bookingList = activeBookings.map((b: any) => ({
          booking_id: b.booking_id || 0,
          tableNumbers: b.tables_Booked || [],
          childCount: b.child_Count || 0,
          adultCount: b.adult_Count || 0,
          date: this.formatDate(b.booking_Date),
          time: this.formatTime(b.booking_Time),
          status: this.mapStatus(b.booking_Status),
          qrList: this.loadQrFromStorage(b.booking_id),
        }));
      },
      error: (err: any) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'โหลดข้อมูลไม่สำเร็จ';
      },
    });
  }

  loadQrFromStorage(bookingId: number): { tableId: number; qrImageUrl: string }[] {
    try {
      return JSON.parse(localStorage.getItem(`qr_${bookingId}`) || '[]');
    } catch (e) {
      return [];
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  formatTime(timeStr: string): string {
    if (!timeStr) return '-';
    return timeStr.substring(0, 5);
  }

  mapStatus(status: string): string {
    if (!status) return 'ไม่มีสถานะ';
    switch (status.toLowerCase()) {
      case 'pending':
        return 'รอชำระเงิน';
      case 'confirmed':
        return 'จองสำเร็จ';
      case 'completed':
        return 'เช็คอินแล้ว';
      case 'cancelled':
        return 'ยกเลิกแล้ว';
      default:
        return status;
    }
  }

  toggleQrModal(bookingId: number | null) {
    this.activeQrBookingId = bookingId;
  }

  onEditBooking(bookingId: number) {
    console.log('Edit booking:', bookingId);
  }

  onCancelBooking(booking: BookingDetail) {
    const confirmDelete = confirm(`ยืนยันที่จะยกเลิกการจอง #${booking.booking_id}?`);
    if (!confirmDelete) return;

    this.bookingService.cancelBooking(booking.booking_id).subscribe({
      next: () => {
        try {
          localStorage.removeItem(`qr_${booking.booking_id}`);
        } catch (e) {}
        alert('ยกเลิกการจองสำเร็จ');
        this.loadLatestBooking();
      },
      error: (err: any) => {
        alert('ยกเลิกไม่สำเร็จ: ' + (err.error?.message || 'กรุณาลองใหม่'));
      },
    });
  }

  goBack() {
    window.history.back();
  }

  goPreOrder() {
    this.router.navigate(['/PreOrder']);
  }
}
