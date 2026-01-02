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
  selector: 'app-login-employee',
  imports: [CommonModule, MatIconModule, FormsModule, Toast],
  providers: [MessageService],
  templateUrl: './login-employee.html',
  styleUrl: './login-employee.scss',
})
export class LoginEmployee {
  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private messageService: MessageService,
    private router: Router
  ) {}
  email: string = '';
  password: string = '';
  phone: string = '';
  rememberMe: boolean = false;

  ngOnInit() {
    const token = localStorage.getItem('token');
    if (token) {
      // ถ้ามี Token ให้ลองส่งไปเช็กกับ Server หรือข้ามหน้า Login ได้เลย
      this.router.navigate(['/Dashboard']);
    }
  }
  onLogin() {
    const forms = new FormData();
    forms.append('Phone', this.phone);
    forms.append('Password', this.password);

    this.authService.loginEmployee(forms).subscribe(
      (res) => {
        console.log(res);
        if (this.rememberMe) {
          localStorage.setItem('token', res.token);
        } else {
          sessionStorage.setItem('token', res.token);
        }

        this.messageService.add({
          severity: 'success',
          summary: 'Login Successful',
          detail: 'กำลังพาคุณเข้าสู่ระบบ...',
        });
        setTimeout(() => {
          this.router.navigate(['/Dashboard']).then((success) => {
            if (success) {
              console.log('2. เปลี่ยนหน้าสำเร็จ!');
            } else {
              console.error('3. เปลี่ยนหน้าล้มเหลว! (อาจจะติด Guard)');
            }
          });
        }, 1500);
      },
      (err) => {
        const errorMessage = err.error?.message || 'An error occurred during login.';
        console.log(err);
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
