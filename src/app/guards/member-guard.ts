import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const memberGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');

  if (!token) {
    console.log('No member token found. Redirecting to login.');
    router.navigate(['/login-member']);
    return false;
  } else {
    console.log('Member token found:', token);
    return true;
  }
};
