import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../service/api/auth.service';
import { HttpClient } from '@angular/common/http';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login-member',
  imports: [Toast, MatIconModule, FormsModule, CommonModule],
  providers: [MessageService],
  templateUrl: './login-member.html',
  styleUrl: './login-member.scss',
})
export class LoginMember {
  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private messageService: MessageService,
    private router: Router
  ) {}

  password: string = '';
  phone: string = '';
  rememberMe: boolean = false;
  onLogin() {
    const fromData = new FormData();
    fromData.append('Phone', this.phone);
    fromData.append('Password', this.password);

    this.authService.loginMember(fromData).subscribe(
      (res) => {
        if (this.rememberMe) {
          localStorage.setItem('token', res.token);
        } else {
          sessionStorage.setItem('token', res.token);
        }
        console.log('Login successful:', res);
        this.messageService.add({
          severity: 'success',
          summary: 'Login Successful',
          detail: 'กำลังพาคุณเข้าสู่ระบบ...',
        });
        setTimeout(() => {
          this.router.navigate(['/Booking']).then((success) => {});
        }, 1500);
      },
      (error) => {
        const errorMessage = error.error?.message || 'Unknown error';
        console.error('Login failed:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: errorMessage,
        });
      }
    );
  }

  forgotPassword() {}

  onRegisterMember() {
    this.router.navigate(['/Registermember']);
  }

  onRegisterEmployee() {
    this.router.navigate(['/Registeremployee']);
  }
}
