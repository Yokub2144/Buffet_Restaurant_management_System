import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { Drawer } from 'primeng/drawer';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../service/api/auth.service';
@Component({
  selector: 'app-menu-member',
  imports: [
    CommonModule,
    DrawerModule,
    ButtonModule,
    Ripple,
    AvatarModule,
    MatIconModule,
    RouterModule,
  ],
  templateUrl: './menu-member.html',
  styleUrl: './menu-member.scss',
})
export class MenuMember {
  constructor(private router: Router, private authService: AuthService) {}
  isExpanded: boolean = false;
  userName: string = '';
  ngOnInit() {
    const member = this.authService.getMember();
    console.log('Member info:', member);
    if (member) {
      this.userName = member.fullname;
    }
  }
  menuItems = [
    { label: 'หน้าหลัก', icon: 'home', route: '/', active: true },
    { label: 'จองโต๊ะ', icon: 'event_note', route: '/Booking', active: false },
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
    this.router.navigate(['/index']);
    window.location.reload();
  }
}
