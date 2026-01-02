import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { Dashboard } from './features/manager/dashboard/dashboard';
import { Index } from './index';
import { Booking } from './features/member/booking/booking';
import { RegisterEmployee } from './features/register-employee/register-employee';
import { RegisterMember } from './features/register-member/register-member';
import { LoginMember } from './features/login-member/login-member';
import { LoginEmployee } from './features/login-employee/login-employee';
import { memberGuard } from './guards/member-guard';
import { employeeGuard } from './guards/employee-guard';
export const routes: Routes = [
  { path: '', component: Index },
  { path: 'Registeremployee', component: RegisterEmployee },
  { path: 'Registermember', component: RegisterMember },
  { path: 'Loginmember', component: LoginMember },
  { path: 'Loginemployee', component: LoginEmployee },
  {
    path: 'Dashboard',
    component: Dashboard,
    canActivate: [employeeGuard],
    data: { roles: ['เจ้าของร้าน'] },
  },
  { path: 'Booking', component: Booking, canActivate: [memberGuard] },
  { path: '**', redirectTo: '' },
];
