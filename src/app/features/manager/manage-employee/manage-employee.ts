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
import { FormsModule } from '@angular/forms';
import { MenuManager } from '../../../components/menu-bar/menu-manager/menu-manager';
import { Router } from '@angular/router';
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
    FormsModule,
  ],
  templateUrl: './manage-employee.html',
  styleUrl: './manage-employee.scss',
})
export class ManageEmployee implements OnInit {
  employees: any[] = [];
  totalWage: number = 0;
  totalEmployees: number = 0;
  resignedEmployees: number = 0;
  filteredEmployees: any[] = [];

  searchText: string = '';
  selectedStatus: any = null;
  selectedDepartment: any = null;
  selectedType: any = null;

  statusOptions = [
    { label: 'ทุกสถานะ', value: null },
    { label: 'ทำงานปัจจุบัน', value: 'ทำงานปัจจุบัน' },
    { label: 'ลาออก', value: 'ลาออก' },
  ];

  departmentOptions = [
    { label: 'ทุกแผนก', value: null },
    { label: 'ครัว', value: 'พนักงานครัว' },
    { label: 'แคชเชียร์', value: 'พนักงานแคชเชียร์' },
    { label: 'เสิร์ฟ', value: 'พนักงานเสิร์ฟ' },
  ];

  typeOptions = [
    { label: 'ประเภท', value: null },
    { label: 'ประจำ', value: 'ประจำ' },
    { label: 'พาร์ทไทม์', value: 'พาร์ทไทม์' },
  ];
  constructor(
    private managerService: ManagerService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  async loadEmployees() {
    try {
      const employees = await firstValueFrom(this.managerService.getAllEmployees());
      this.employees = employees;
      this.filteredEmployees = [...employees];
      this.calculateStats();
      console.log('Employees:', employees);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  }

  filterEmployees() {
    const searchLower = this.searchText.toLowerCase().trim();
    this.filteredEmployees = this.employees.filter((emp) => {
      const fullName = (emp.fullname || '').toLowerCase();

      const matchesSearch =
        !searchLower ||
        fullName.includes(searchLower) ||
        (emp.phone && emp.phone.includes(searchLower));
      const matchesStatus = !this.selectedStatus || emp.employee_Status === this.selectedStatus;
      const matchesDepartment =
        !this.selectedDepartment || emp.department === this.selectedDepartment;
      const matchesType = !this.selectedType || emp.employee_Type === this.selectedType;

      return matchesSearch && matchesStatus && matchesDepartment && matchesType;
    });
  }

  calculateStats() {
    if (!this.employees) return;
    this.totalEmployees = this.employees.length;
    this.totalWage = this.employees.reduce((acc, curr) => acc + (Number(curr.wage) || 0), 0);
    this.resignedEmployees = this.employees.filter(
      (e) => e.employee_Status !== 'ทำงานปัจจุบัน',
    ).length;
  }

  getStatusSeverity(status: string): any {
    return status === 'Active' ? 'success' : 'danger';
  }
  approve() {
    this.router.navigate(['ApproveEmployee']);
  }
  detail(emp_id: number) {
    this.router.navigate(['/DetailEmployee', emp_id]);
  }
}
