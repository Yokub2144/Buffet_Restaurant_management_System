import { Component, OnInit } from '@angular/core';
import { ManagerService } from '../../../service/api/manager.service';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { MatIconModule } from '@angular/material/icon';
import { MenuManager } from '../../../components/menu-bar/menu-manager/menu-manager';
@Component({
  selector: 'app-manage-employee',
  imports: [
    TableModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    MatIconModule,
    CommonModule,
    MenuManager,
  ],
  templateUrl: './manage-employee.html',
  styleUrl: './manage-employee.scss',
})
export class ManageEmployee implements OnInit {
  employees: any[] = [];
  totalWage: number = 0;
  totalEmployees: number = 0;
  resignedEmployees: number = 0;
  statusOptions = [
    { label: 'ทุกสถานะ', value: null },
    { label: 'กำลังทำงาน', value: 'Active' },
    { label: 'ลาออก', value: 'Resigned' },
  ];

  departmentOptions = [
    { label: 'ทุกแผนก', value: null },
    { label: 'ครัว', value: 'Kitchen' },
    { label: 'บริการ', value: 'Service' },
  ];

  typeOptions = [
    { label: 'ประเภท', value: null },
    { label: 'ประจำ', value: 'Permanent' },
    { label: 'พาร์ทไทม์', value: 'PartTime' },
  ];
  constructor(private managerService: ManagerService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  async loadEmployees() {
    try {
      const employees = await firstValueFrom(this.managerService.getAllEmployees());
      this.employees = employees;
      this.calculateStats();
      console.log('Employees:', employees);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  }

  calculateStats() {
    if (!this.employees) return;
    this.totalEmployees = this.employees.length;
    this.totalWage = this.employees.reduce((acc, curr) => acc + (Number(curr.wage) || 0), 0);
    this.resignedEmployees = this.employees.filter(
      (e) => e.employee_Status !== 'ทำงานปัจจุบัน'
    ).length;
  }

  getStatusSeverity(status: string): any {
    return status === 'Active' ? 'success' : 'danger';
  }
}
