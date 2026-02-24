import { Component, OnInit } from '@angular/core';
import { MenuManager } from '../../../components/menu-bar/menu-manager/menu-manager';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { Employee } from '../../../models/employee.model';
import { AuthService } from '../../../service/api/auth.service';
@Component({
  selector: 'app-detail-employee',
  imports: [MenuManager, CommonModule],
  templateUrl: './detail-employee.html',
  styleUrl: './detail-employee.scss',
})
export class DetailEmployee implements OnInit {
  employee: Employee | null = null;
  isLoading = true;
  emp_id: number = 0;
  workDuration: string = '-';
  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private auth: AuthService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.emp_id = Number(id);
      this.loadEmployee(this.emp_id);
    } else {
      this.isLoading = false; // ถ้าไม่มี ID ให้หยุดโหลดเลย
    }
  }

  loadEmployee(emp_id: number) {
    this.auth.getEmployeebyId(emp_id).subscribe({
      next: (response: any) => {
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
    console.log('Edit Dept');
  }
  editStatus() {
    console.log('Edit Status');
  }
  editType() {
    console.log('Edit Type');
  }
  editRevenue() {
    console.log('Edit Revenue');
  }
}
