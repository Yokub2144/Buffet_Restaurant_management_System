import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/api/auth.service';
import { HttpClient } from '@angular/common/http';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';
@Component({
  selector: 'app-register-member',
  imports: [Toast, CommonModule, MatIconModule, FormsModule],
  providers: [MessageService],
  templateUrl: './register-member.html',
  styleUrl: './register-member.scss',
})
export class RegisterMember {
  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private messageService: MessageService,
    private router: Router
  ) {}
  fullname: string = '';
  email: string = '';
  phone: string = '';
  password: string = '';
  birthday: string = '';

  async onSubmit() {
    if (!this.fullname || !this.email || !this.phone || !this.password || !this.birthday) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'กรุณากรอกข้อมูลให้ครบถ้วน',
      });
      return;
    }
    const memberdata = {
      Fullname: this.fullname,
      Email: this.email,
      Phone: this.phone,
      Password: this.password,
      Birthday: this.birthday,
    };
    console.log('Data to send:', memberdata);
    try {
      const response = await lastValueFrom(this.authService.registerMember(memberdata));
      console.log('Server Response:', response);
      if (response) {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'สมัครสมาชิกสำเร็จ',
        });
      }
    } catch (error: any) {
      const errorMessage = error?.error?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
      this.messageService.add({
        severity: 'error',
        summary: 'เกิดข้อผิดพลาด',
        detail: errorMessage,
      });
    }
  }
  goBack() {
    window.history.back();
  }
  goLogin() {
    this.router.navigate(['/Loginmember']);
  }
}
