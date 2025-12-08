import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { StyleClass } from 'primeng/styleclass';
import { Drawer } from 'primeng/drawer';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-menu-member',
  imports: [
    CommonModule,
    DrawerModule,
    ButtonModule,
    Ripple,
    AvatarModule,
    StyleClass,
    MatIconModule,
  ],
  templateUrl: './menu-member.html',
  styleUrl: './menu-member.scss',
})
export class MenuMember {
  visible: boolean = false; // ตัวแปรคุมการเปิด/ปิด Drawer

  menuItems = [
    { label: 'หน้าหลัก/dashboard', icon: 'dashboard', active: true },
    { label: 'จัดการข้อมูลพนักงาน', icon: 'groups', active: false },
    { label: 'จัดการข้อมูลโต๊ะ', icon: 'table_restaurant', active: false }, // หรือ grid_view
    { label: 'รายการบิล', icon: 'receipt_long', active: false },
    { label: 'การตั้งค่าร้าน', icon: 'settings', active: false },
    { label: 'การตั้งค่าราคาอาหาร', icon: 'restaurant_menu', active: false },
  ];

  closeCallback(e: any): void {
    this.visible = false;
  }
}
