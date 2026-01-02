import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { Drawer } from 'primeng/drawer';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
@Component({
  selector: 'app-menu-manager',
  imports: [CommonModule, DrawerModule, ButtonModule, Ripple, AvatarModule, MatIconModule],
  templateUrl: './menu-manager.html',
  styleUrl: './menu-manager.scss',
})
export class MenuManager {
  constructor(private router: Router) {}
  isExpanded: boolean = false; // สถานะเปิด/ปิด เมนู (สำหรับ Mobile)

  menuItems = [
    { label: 'หน้าหลัก/dashboard', icon: 'dashboard', active: true },
    { label: 'จัดการข้อมูลพนักงาน', icon: 'groups', active: false },
    { label: 'จัดการข้อมูลโต๊ะ', icon: 'table_restaurant', active: false }, // หรือ grid_view
    { label: 'รายการบิล', icon: 'receipt_long', active: false },
    { label: 'การตั้งค่าร้าน', icon: 'settings', active: false },
    { label: 'การตั้งค่าราคาอาหาร', icon: 'restaurant_menu', active: false },
  ];

  toggleSidebar() {
    this.isExpanded = !this.isExpanded;
  }

  closeSidebar() {
    // ปิดเมนูเมื่อคลิก (สำหรับ Mobile UX)
    if (window.innerWidth <= 768) {
      this.isExpanded = false;
    }
  }
  @ViewChild('drawerRef') drawerRef!: Drawer;

  closeCallback(e: Event): void {
    this.drawerRef.close(e);
  }
  visible: boolean = false;
  logout() {
    console.log('Logging out...');
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    this.router.navigate(['/Loginemployee']);
  }
}
