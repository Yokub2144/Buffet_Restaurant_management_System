import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple'; // แก้เป็น RippleModule

@Component({
  selector: 'app-customer-navbar',
  standalone: true,
  imports: [CommonModule, ButtonModule, RippleModule, MatIconModule, RouterModule],
  templateUrl: './customer-navbar.html',
  styleUrl: './customer-navbar.scss',
})
export class CustomerNavbar {
  isExpanded: boolean = false;

  tableNumber: string = 'A05';
  notificationCount: number = 2;
  cartCount: number = 3;

  menuItems = [
    { label: 'รายการเมนูอาหาร', icon: 'restaurant_menu', route: '/order' },
    { label: 'สั่งอาหาร/รถเข็นของคุณ', icon: 'shopping_cart', route: '/cart' },
    { label: 'ติดตามสถานะออเดอร์', icon: 'receipt_long', route: '/status' },
  ];

  toggleSidebar() {
    this.isExpanded = !this.isExpanded;
  }

  closeSidebar() {
    if (window.innerWidth <= 768) {
      this.isExpanded = false;
    }
  }
}
