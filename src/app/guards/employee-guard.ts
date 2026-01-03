import { inject } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { CanActivateFn, Router } from '@angular/router';

export const employeeGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  let token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (!token) {
    router.navigate(['/login-employee']);
    return false;
  }

  try {
    const decoded: any = jwtDecode(token);
    console.log('ข้อมูลใน Token:', decoded);
    const userRole =
      decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || decoded['Role'];
    const allowedRoles = route.data['roles'] as Array<string>;

    if (!allowedRoles) return true;

    if (allowedRoles.includes(userRole)) {
      return true;
    } else {
      router.navigate(['/']);
      return false;
    }
  } catch (error) {
    localStorage.removeItem('token');
    router.navigate(['/login-employee']);
    return false;
  }
};
