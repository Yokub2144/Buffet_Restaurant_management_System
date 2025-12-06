import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { Dashboard } from './features/manager/dashboard/dashboard';
import { Index } from './index';
import { Booking } from './features/member/booking/booking';
export const routes: Routes = [
  { path: '', component: Index },
  { path: 'Dashboard', component: Dashboard },
  { path: 'Booking', component: Booking },
];
