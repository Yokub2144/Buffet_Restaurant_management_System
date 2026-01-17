import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CustomerNavbar } from '../../components/menu-bar/customer-navbar/customer-navbar';

@Component({
  selector: 'app-status-customer-order',
  standalone: true,
  imports: [CommonModule, MatIconModule, RouterModule, CustomerNavbar],
  templateUrl: './status-customer-order.html',
  styleUrl: './status-customer-order.scss',
})
export class StatusCustomerOrder implements OnInit {
  currentStep = 0;

  steps = [
    { label: 'รับออเดอร์' }, // index 0
    { label: 'กำลังจัดเตรียมอาหาร' }, // index 1
    { label: 'กำลังนำเสริฟ' }, // index 2
    { label: 'ดำเนินการเสร็จสิ้น' }, // index 3
  ];

  orderItems = [
    { name: 'หมูหมักพริกไทยดำ', quantity: 2 },
    { name: 'หมูสไลด์สามชั้น', quantity: 6 },
    { name: 'หมูสไลด์สามชั้นแผ่น', quantity: 5 },
    { name: 'ผักกระหล่ำ', quantity: 2 },
    { name: 'สาหร่ายวากาเมะ', quantity: 3 },
    { name: 'เบียร์สิงห์', quantity: 1 },
  ];

  overallStatusText = 'กำลังนำเสริฟ';

  // ฟังก์ชันคำนวณสถานะเมื่อเปิดหน้าเว็บ
  ngOnInit() {
    this.updateTracker();
  }

  // ฟังก์ชันเทียบข้อความเพื่อหาลำดับตัวเลข
  updateTracker() {
    // ค้นหาว่า overallStatusText ตรงกับ steps ตัวไหน
    const index = this.steps.findIndex((step) => step.label === this.overallStatusText);

    // ถ้าเจอข้อมูล ให้เซ็ต currentStep เป็นเลขนั้น
    if (index !== -1) {
      this.currentStep = index;
    }
  }
}
