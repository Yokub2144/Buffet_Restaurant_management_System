import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { BarcodeFormat } from '@zxing/library';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { jwtDecode } from 'jwt-decode';
import { MenuServer } from "../../../components/menu-bar/menu-server/menu-server";
import { BookingService } from '../../../service/api/booking.service';
interface CheckinInfo {
  booking_id: number;
  booking_status: string;
  booking_datetime?: string;
  adult_count: number;
  child_count: number;
  member?: { name: string; phone: string } | null;
  table?: { table_id: number; table_number: string } | null;
  all_tables: string[];
}
@Component({
  selector: 'app-confrim-checkin',
  imports: [MenuServer, MatIconModule, ZXingScannerModule, CommonModule],
  templateUrl: './confrim-checkin.html',
  styleUrl: './confrim-checkin.scss',
})

export class ConfrimCheckin implements OnInit, OnDestroy {
  // States & Data
  loading = false;
  checkinInfo: CheckinInfo | null = null;
  errorMessage = '';
  successMessage = '';
  isAuthorized = false;
  bookingId: number | null = null;
  tableId: number | null = null;

  // Scanner Config
  isCameraActive = false;
  allowedFormats = [BarcodeFormat.QR_CODE];

  constructor(
    private bookingService: BookingService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // 1. Check Authentication & Permissions
    const token = localStorage.getItem('token') ?? sessionStorage.getItem('token');
    if (!token) {
      this.router.navigate(['/Loginemployee'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      this.isAuthorized = decoded.role === 'พนักงานเสิร์ฟ';
    } catch {
      this.isAuthorized = false;
    }

    // 2. Check direct URL query params
    const bId = this.route.snapshot.queryParamMap.get('bookingId');
    const tId = this.route.snapshot.queryParamMap.get('tableId');
    if (bId && tId) {
      this.bookingId = Number(bId);
      this.tableId = Number(tId);
      this.fetchCheckinInfo();
    }
  }

  // Camera Actions
  toggleCamera(): void {
    this.isCameraActive = !this.isCameraActive;
    if (this.isCameraActive) {
      this.errorMessage = '';
    }
  }

  onHasPermission(hasPermission: boolean): void {
    if (!hasPermission) {
      alert('กรุณาอนุญาตการเข้าถึงกล้องในเบราว์เซอร์เพื่อทำการสแกน');
    }
  }

  // Scanner Result Handling
  onCodeResult(resultString: string): void {
    this.isCameraActive = false;
    this.parseQrCodeAndFetch(resultString);
  }

  parseQrCodeAndFetch(qrData: string): void {
    try {
      if (qrData.includes('bookingId=') && qrData.includes('tableId=')) {
        const url = new URL(qrData);
        this.bookingId = Number(url.searchParams.get('bookingId'));
        this.tableId = Number(url.searchParams.get('tableId'));
      } else {
        const parsed = JSON.parse(qrData);
        this.bookingId = parsed.bookingId;
        this.tableId = parsed.tableId;
      }

      if (this.bookingId && this.tableId) {
        this.fetchCheckinInfo();
      } else {
        this.errorMessage = 'รูปแบบข้อมูลใน QR Code ไม่ถูกต้อง';
      }
    } catch {
      this.errorMessage = 'ไม่สามารถอ่านข้อมูลจาก QR Code นี้ได้';
    }
  }

  // API Calls
  fetchCheckinInfo(): void {
    if (!this.bookingId || !this.tableId) return;

    this.loading = true;
    this.errorMessage = '';

    this.bookingService.getCheckinInfo(this.bookingId, this.tableId).subscribe({
      next: (data: CheckinInfo) => {
        console.log('📌 ข้อมูลที่ได้จาก API Checkin:', data);
        this.checkinInfo = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'ไม่พบข้อมูลการจอง';
        this.loading = false;
      },
    });
  }
  formatDate(dateTimeStr?: string): string {
    if (!dateTimeStr) return '-';
    const [datePart] = dateTimeStr.split('T'); // ได้ "2026-07-24"
    if (!datePart) return '-';

    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`; // ส่งกลับ "24/07/2026"
  }

  // ฟังก์ชันแปลงเวลาให้เป็น HH:mm
  formatTime(dateTimeStr?: string): string {
    if (!dateTimeStr) return '-';
    const [, timePart] = dateTimeStr.split('T'); // ได้ "13:00:00"
    if (!timePart) return '-';

    return timePart.substring(0, 5) + ' น.'; // ส่งกลับ "13:00 น."
  }
  confirmCheckin(): void {
    if (!this.isAuthorized || !this.bookingId || !this.tableId) return;

    this.loading = true;

    const checkedInTables =
      this.checkinInfo?.all_tables && this.checkinInfo.all_tables.length > 0
        ? this.checkinInfo.all_tables.join(', ')
        : (this.checkinInfo?.table?.table_number ?? '-');

    this.bookingService.confirmCheckin(this.bookingId, this.tableId).subscribe({
      next: () => {
        this.successMessage = `✅ เช็คอินโต๊ะ ${checkedInTables} สำเร็จ!`;
        this.checkinInfo = null;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = err.error?.message ?? 'เช็คอินไม่สำเร็จ';
        this.loading = false;
      },
    });
  }

  resetScanner(): void {
    this.checkinInfo = null;
    this.errorMessage = '';
    this.successMessage = '';
    this.bookingId = null;
    this.tableId = null;
    this.isCameraActive = true;
  }

  goBack(): void {
    this.isCameraActive = false;
    this.router.navigate(['/']);
  }

  ngOnDestroy(): void {
    this.isCameraActive = false;
  }
}