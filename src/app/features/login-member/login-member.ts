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
  email: string = '';
  password: string = '';
  phone: string = '';

  onLogin() {}

  forgotPassword() {}

  onRegisterMember() {
    this.router.navigate(['/Registermember']);
  }

  onRegisterEmployee() {
    this.router.navigate(['/Registeremployee']);
  }
}
