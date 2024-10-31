import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionService } from '@store/session.service';
import { catchError, first, map, of } from 'rxjs';

export const NormalUserGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);
  const sessionService = inject(SessionService);

  return sessionService.getUser().pipe(
    first(),
    map(user => {
      if (!sessionService.isAuthenticated()) {
        router.navigate(['/login']).then();
        return false;
      }

      if(!user?.is_admin) return true;
      else return false;
    })
  );
};
