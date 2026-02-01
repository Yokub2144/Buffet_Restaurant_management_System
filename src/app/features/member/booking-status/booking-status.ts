import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface BookingDetail {
  tableNumbers: string[];
  childCount: number;
  adultCount: number;
  date: string;
  time: string;
  status: string;
}

@Component({
  selector: 'app-booking-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-status.html',
  styleUrl: './booking-status.scss',
})
export class BookingStatus implements OnInit {
  // จำลองข้อมูลการจองที่ดึงมาจาก API
  bookingData: BookingDetail = {
    tableNumbers: ['A14', 'A15'],
    childCount: 1,
    adultCount: 6,
    date: '19/9/2568',
    time: '15 : 00',
    status: 'จองสำเร็จ',
  };

  showQrModal: boolean = false;

  constructor() {}

  ngOnInit() {}

  toggleQrModal(show: boolean) {
    this.showQrModal = show;
  }

  onEditBooking() {
    // ใส่ Logic ลิงค์ไปหน้าแก้ไข
    console.log('Edit booking clicked');
  }

  onCancelBooking() {
    const confirmDelete = confirm('ยืนยันที่จะยกเลิกการจองนี้?');
    if (confirmDelete) {
      console.log('Cancel booking confirmed');
      // ยิง API ยกเลิกตรงนี้
    }
  }

  goBack() {
    window.history.back();
  }
}
