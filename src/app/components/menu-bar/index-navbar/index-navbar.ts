import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { Drawer, DrawerModule } from 'primeng/drawer';
import { Ripple } from 'primeng/ripple';

@Component({
  selector: 'app-index-navbar',
  imports: [
    CommonModule,
    DrawerModule,
    ButtonModule,
    Ripple,
    AvatarModule,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './index-navbar.html',
  styleUrl: './index-navbar.scss',
})
export class IndexNavbar {
  isOpen = true; // สถานะเปิด/ปิด เมนู (สำหรับ Mobile)

  menuItems = [{ label: 'หน้าหลัก', icon: 'dashboard', active: true }];

  toggleSidebar() {
    this.isOpen = !this.isOpen;
  }

  closeSidebar() {
    // ปิดเมนูเมื่อคลิก (สำหรับ Mobile UX)
    if (window.innerWidth <= 768) {
      this.isOpen = false;
    }
  }
  @ViewChild('drawerRef') drawerRef!: Drawer;

  closeCallback(e: Event): void {
    this.drawerRef.close(e);
  }
  visible: boolean = false;
}
