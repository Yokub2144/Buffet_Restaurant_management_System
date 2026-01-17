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
  selector: 'app-register-employee',
  imports: [Toast, CommonModule, MatIconModule, FormsModule],
  providers: [MessageService],
  templateUrl: './register-employee.html',
  styleUrl: './register-employee.scss',
})
export class RegisterEmployee {
  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private messageService: MessageService,
    private router: Router,
  ) {}
  fullname: string = '';
  email: string = '';
  phone: string = '';
  password: string = '';
  gender: string = '';
  idCard: string = '';
  address: string = '';
  employeeType: string = '';
  department: string = '';
  selectedFile: File | null = null;
  selectedFileName: string = '';

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
    }
  }
  async onSubmit() {
    if (
      !this.fullname ||
      !this.email ||
      !this.phone ||
      !this.password ||
      !this.gender ||
      !this.idCard ||
      !this.address ||
      !this.department
    ) {
      this.messageService.add({
        severity: 'warn',
        summary: 'คำเตือน',
        detail: 'กรุณากรอกข้อมูลให้ครบถ้วน',
      });
      return;
    }
    if (this.email.indexOf('@') === -1) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'กรุณากรอกอีเมลให้ถูกต้อง',
      });
      return;
    }
    if (this.phone.length < 10 || this.phone.length > 10) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'กรุณากรอกเบอร์โทรให้ถูกต้อง (10 หลัก)',
      });
      return;
    }
    if (this.phone.charAt(0) !== '0') {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'เบอร์โทรต้องขึ้นต้นด้วย "0"',
      });
      return;
    }
    if (isNaN(Number(this.phone))) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'กรุณากรอกเบอร์โทรให้เป็นตัวเลขเท่านั้น',
      });
      return;
    }
    if (!this.idCard || this.idCard.length !== 13) {
      this.messageService.add({
        severity: 'error',
        summary: 'ข้อมูลไม่ถูกต้อง',
        detail: 'กรุณากรอกรหัสบัตรประชาชนให้ครบ 13 หลัก',
      });
      return;
    }
    if (!/^\d+$/.test(this.idCard)) {
      this.messageService.add({
        severity: 'error',
        summary: 'ข้อผิดพลาด',
        detail: 'รหัสบัตรประชาชนต้องเป็นตัวเลขเท่านั้น',
      });
      return;
    }

    const formData = new FormData();
    formData.append('Fullname', this.fullname);
    formData.append('Email', this.email);
    formData.append('Phone', this.phone);
    formData.append('Password', this.password);
    formData.append('Gender', this.gender);
    formData.append('Identification_Number', this.idCard);
    formData.append('Address', this.address);
    formData.append('Department', this.department);
    formData.append('Employee_Type', this.employeeType || 'ประจำ');

    if (this.selectedFile) {
      formData.append('Image_Profile', this.selectedFile, this.selectedFile.name);
    }

    try {
      const response = await lastValueFrom(this.authService.registerEmployee(formData));

      if (response) {
        this.messageService.add({
          severity: 'success',
          summary: 'สำเร็จ',
          detail: 'สมัครสมาชิกพนักงานเรียบร้อยแล้ว',
        });
        console.log('API Response:', response);
      }
      setTimeout(() => {
        this.router.navigate(['/Loginemployee']);
      }, 2000);
    } catch (error: any) {
      const errorMessage = error.error?.message || 'ไม่สามารถลงทะเบียนได้ กรุณาลองใหม่';
      this.messageService.add({
        severity: 'error',
        summary: 'ข้อผิดพลาด',
        detail: errorMessage,
      });
      console.error('Registration Error:', error);
    }
  }
  goBack() {
    window.history.back();
  }
  goLogin() {
    this.router.navigate(['/Loginemployee']);
  }
}
