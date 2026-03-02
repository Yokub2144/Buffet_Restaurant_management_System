import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Constants } from '../../config/contants';

interface CheckinInfo {
  booking_id: number;
  booking_status: string;
  booking_date: string;
  booking_time: string;
  adult_count: number;
  child_count: number;
  member: { name: string; phone: string };
  table: { table_id: number; table_number: string };
  all_tables: string[];
}

@Component({
  selector: 'app-checkin-scanner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkin-scanner.html',
  styleUrl: './checkin-scanner.scss',
})
export class CheckinScanner implements OnInit {
  loading = false;
  checkinInfo: CheckinInfo | null = null;
  errorMessage = '';
  successMessage = '';
  isAuthorized = false;
  bookingId!: number;
  tableId!: number;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private constants: Constants,
  ) {}

  ngOnInit() {
    this.bookingId = Number(this.route.snapshot.queryParamMap.get('bookingId'));
    this.tableId = Number(this.route.snapshot.queryParamMap.get('tableId'));

    if (!this.bookingId || !this.tableId) {
      this.errorMessage = 'QR Code ไม่ถูกต้อง';
      return;
    }

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

    this.fetchCheckinInfo();
  }

  fetchCheckinInfo() {
    this.loading = true;
    const token = localStorage.getItem('token') ?? sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http
      .get<CheckinInfo>(
        `${this.constants.API_ENDPOINT}/Booking/checkin-info?bookingId=${this.bookingId}&tableId=${this.tableId}`,
        { headers },
      )
      .subscribe({
        next: (data) => {
          this.checkinInfo = data;
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.message ?? 'ไม่พบข้อมูลการจอง';
          this.loading = false;
        },
      });
  }

  confirmCheckin() {
    if (!this.isAuthorized) return;
    this.loading = true;
    const token = localStorage.getItem('token') ?? sessionStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http
      .post(
        `${this.constants.API_ENDPOINT}/Booking/checkin`,
        { bookingId: this.bookingId, tableId: this.tableId },
        { headers },
      )
      .subscribe({
        next: () => {
          this.successMessage = `✅ เช็คอินโต๊ะ ${this.checkinInfo?.table.table_number} สำเร็จ!`;
          this.checkinInfo = null;
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = err.error?.message ?? 'เช็คอินไม่สำเร็จ';
          this.loading = false;
        },
      });
  }
}
