import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { Drawer } from 'primeng/drawer';
@Component({
  selector: 'app-menu-member',
  imports: [CommonModule, DrawerModule, ButtonModule, Ripple, AvatarModule],
  templateUrl: './menu-member.html',
  styleUrl: './menu-member.scss',
})
export class MenuMember {
  isOpen = true;

  menuItems = [
    { label: 'หน้าหลัก/dashboard', icon: 'pi-home', active: true },
    { label: 'จัดการข้อมูลพนักงาน', icon: 'fa-solid fa-user-group', active: false },
    { label: 'จัดการข้อมูลโต๊ะ', icon: 'fa-solid fa-table-cells-large', active: false },
    { label: 'รายการบิล', icon: 'fa-solid fa-money-bill-wave', active: false },
    { label: 'การตั้งค่าร้าน', icon: 'fa-solid fa-gear', active: false },
    { label: 'การตั้งค่าราคาอาหาร', icon: 'fa-solid fa-utensils', active: false },
  ];
  @ViewChild('drawerRef') drawerRef!: Drawer;

  closeCallback(e: Event): void {
    this.drawerRef.close(e);
  }
  visible: boolean = false;
}
