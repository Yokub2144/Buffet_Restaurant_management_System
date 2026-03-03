import { Component, OnInit } from '@angular/core';
import { MenuManager } from '../../../components/menu-bar/menu-manager/menu-manager';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { Employee } from '../../../models/employee.model';
import { AuthService } from '../../../service/api/auth.service';
import { DialogModule } from 'primeng/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { ManagerService } from '../../../service/api/manager.service';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { SelectModule } from 'primeng/select';
@Component({
  selector: 'app-detail-employee',
  imports: [
    MenuManager,
    CommonModule,
    DialogModule,
    MatIconModule,
    FormsModule,
    DatePickerModule,
    Toast,
    SelectModule,
  ],
  templateUrl: './detail-employee.html',
  styleUrl: './detail-employee.scss',
})
export class DetailEmployee implements OnInit {
  employee: Employee | null = null;
  isLoading = true;
  emp_id: number = 0;
  workDuration: string = '-';
  department: string = '';
  statusEmp: string = '';
  typeEmp: string = '';
  displayEditRevenue: boolean = false;
  displayEditDepartment: boolean = false;
  displayEditStatus: boolean = false;
  displayEditType: boolean = false;

  typeEmps = [
    { label: 'พาร์ทไทม์', value: 'พาร์ทไทม์' },
    { label: 'ประจำ', value: 'ประจำ' },
  ];

  statusEmps = [
    { label: 'ทำงานปัจจุบัน', value: 'ทำงานปัจจุบัน' },
    { label: 'ลาออก', value: 'ลาออก' },
  ];

  departments = [
    { label: 'พนักงานเสิร์ฟ', value: 'พนักงานเสิร์ฟ' },
    { label: 'พนักงานครัว', value: 'พนักงานครัว' },
    { label: 'พนักงานแคชเชียร์', value: 'พนักงานแคชเชียร์' },
  ];

  editFormRevenue = {
    wage: 0,
    start_time: '',
    end_time: '',
  };
  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private auth: AuthService,
    private managerService: ManagerService,
    private messageService: MessageService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.emp_id = Number(id);
      this.loadEmployee(this.emp_id);
    } else {
      this.isLoading = false;
    }
  }

  loadEmployee(emp_id: number) {
    this.auth.getEmployeebyId(emp_id).subscribe({
      next: (response: any) => {
        if (response) {
          if (response.start_Time) response.start_Time = response.start_Time.substring(0, 5);
          if (response.end_Time) response.end_Time = response.end_Time.substring(0, 5);
        }

        this.employee = response;
        console.log('Employee Data:', this.employee);
        this.isLoading = false;

        if (this.employee && this.employee.hire_Date) {
          this.workDuration = this.calculateDuration(this.employee.hire_Date);
        } else {
          this.workDuration = 'ยังไม่ระบุวันเริ่มงาน';
        }
      },
      error: (err) => {
        console.error('Error loading employee:', err);
        this.isLoading = false;
      },
    });
  }

  calculateDuration(startDate: Date | string): string {
    const start = new Date(startDate);
    const now = new Date();

    let months = (now.getFullYear() - start.getFullYear()) * 12;
    months -= start.getMonth();
    months += now.getMonth();

    if (months < 0) return '0 เดือน';

    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;

    if (years > 0) {
      return `${years} ปี ${remainingMonths} เดือน`;
    } else {
      return `${remainingMonths} เดือน`;
    }
  }

  goBack() {
    this.location.back();
  }

  editDepartment() {
    if (this.employee) {
      this.department = this.employee.department || '';
    }
    this.displayEditDepartment = true;
  }
  saveDepartment() {
    const payload = {
      emp_id: this.emp_id,
      department: this.department,
    };
    this.managerService.updateDepartmentEmp(payload).subscribe({
      next: (res) => {
        console.log('อัปเดตสำเร็จ', res);
        this.messageService.add({
          severity: 'success',
          summary: 'Update Successful',
          detail: 'กำลังบันทึกข้อมูล...',
        });
        this.ngOnInit();
        this.displayEditDepartment = false;
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Unknown error';
        console.error('Login failed:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: errorMessage,
        });
      },
    });
  }

  editStatus() {
    if (this.employee) {
      this.statusEmp = this.employee.employee_Status || '';
    }
    this.displayEditStatus = true;
  }
  saveStatus() {
    const payload = {
      emp_id: this.emp_id,
      employee_Status: this.statusEmp,
    };
    this.managerService.updateStatusEmp(payload).subscribe({
      next: (res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Update Successful',
          detail: 'กำลังบันทึกข้อมูล...',
        });
        this.ngOnInit();
        this.displayEditStatus = false;
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Unknown error';
        console.error('Login failed:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: errorMessage,
        });
      },
    });
  }

  editType() {
    if (this.employee) {
      this.typeEmp = this.employee.employee_Type || '';
    }
    this.displayEditType = true;
  }
  saveType() {
    const payload = {
      emp_id: this.emp_id,
      employee_Type: this.typeEmp,
    };
    this.managerService.updateTypeEmp(payload).subscribe({
      next: (res) => {
        console.log('อัปเดตสำเร็จ', res);
        this.messageService.add({
          severity: 'success',
          summary: 'Update Successful',
          detail: 'กำลังบันทึกข้อมูล...',
        });
        this.ngOnInit();
        this.displayEditType = false;
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Unknown error';
        console.error('Login failed:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: errorMessage,
        });
      },
    });
  }
  editRevenue() {
    if (this.employee) {
      this.editFormRevenue = {
        wage: this.employee.wage || 0,
        start_time: this.employee.start_Time || '',
        end_time: this.employee.end_Time || '',
      };
      this.displayEditRevenue = true;
    }
  }
  saveRevenue() {
    const payload = {
      emp_id: this.emp_id,
      wage: this.editFormRevenue.wage,
      start_Time: this.editFormRevenue.start_time,
      end_Time: this.editFormRevenue.end_time,
    };
    this.managerService.updateWageStartTimeEndTimeEmp(payload).subscribe({
      next: (res) => {
        console.log('อัปเดตสำเร็จ', res);
        this.messageService.add({
          severity: 'success',
          summary: 'Update Successful',
          detail: 'กำลังบันทึกข้อมูล...',
        });
        this.ngOnInit();
        this.displayEditRevenue = false;
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Unknown error';
        console.error('Login failed:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Login Failed',
          detail: errorMessage,
        });
      },
    });
  }
}
