import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-customer-navbar',
  standalone: true,
  imports: [CommonModule, ButtonModule, RippleModule, MatIconModule, RouterModule],
  templateUrl: './customer-navbar.html',
  styleUrl: './customer-navbar.scss',
})
export class CustomerNavbar implements OnInit {
  isExpanded: boolean = false;

  tableNumber: string | null = null;
  notificationCount: number = 2;
  cartCount: number = 3;

  menuItems = [
    { label: 'รายการเมนูอาหาร', icon: 'restaurant_menu', route: '/Customer' },
    { label: 'สั่งอาหาร/รถเข็นของคุณ', icon: 'shopping_cart', route: '/Cart' },
    { label: 'ติดตามสถานะออเดอร์', icon: 'receipt_long', route: '/StatusCustomer' },
  ];
  constructor(private route: ActivatedRoute) {}
  ngOnInit(): void {
    this.tableNumber = this.route.snapshot.queryParamMap.get('table');
    console.log('เลขโต๊ะที่ดึงได้:', this.tableNumber);
  }
  toggleSidebar() {
    this.isExpanded = !this.isExpanded;
  }

  closeSidebar() {
    if (window.innerWidth <= 768) {
      this.isExpanded = false;
    }
  }
}
