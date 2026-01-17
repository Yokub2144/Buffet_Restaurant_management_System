import { Component } from '@angular/core';
import { MenuManager } from '../../../../components/menu-bar/menu-manager/menu-manager';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ManagerService } from '../../../../service/api/manager.service';
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-approve-employee',
  imports: [MenuManager, CommonModule, TableModule, ButtonModule],
  templateUrl: './approve-employee.html',
  styleUrl: './approve-employee.scss',
})
export class ApproveEmployee {
  employees: any[] = [];
  constructor(private managerService: ManagerService) {}

  ngOnInit() {
    this.loadEmployees();
  }
  async loadEmployees() {
    try {
      const employees = await firstValueFrom(this.managerService.getEmployeesNotApproved());
      this.employees = employees;
    } catch (error) {
      console.error('Error loading employees not approved:', error);
    }
  }
  approve(employeeId: number) {
    this.managerService.approveEmployee(employeeId).subscribe({
      next: (response) => {
        console.log('Employee approved successfully:', response);
        this.loadEmployees(); // Reload the list after approval
      },
      error: (error) => {
        console.error('Error approving employee:', error);
      },
    });
  }
  reject(employeeId: number) {
    this.managerService.rejectEmployee(employeeId).subscribe({
      next: (response) => {
        console.log('Employee rejected successfully:', response);
        this.loadEmployees(); // Reload the list after rejection
      },
      error: (error) => {
        console.error('Error rejecting employee:', error);
      },
    });
  }
  back() {
    window.history.back();
  }
}
