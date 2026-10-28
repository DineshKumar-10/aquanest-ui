import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router
} from '@angular/router';

import { catchError, map, of } from 'rxjs';

import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getCurrentUser().pipe(
    map(user =>
      user.roles.includes('ROLE_ADMIN')
        ? true
        : router.createUrlTree(['/admin/login'])
    ),
    catchError(() =>
      of(router.createUrlTree(['/admin/login']))
    )
  );
};