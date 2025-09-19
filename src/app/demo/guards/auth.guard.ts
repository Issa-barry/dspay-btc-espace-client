// **********V1**********
// import { inject } from '@angular/core';
// import { CanActivateFn, Router } from '@angular/router';
// import { AuthService } from '../service/auth/auth.service';

// export const authGuard: CanActivateFn = (route, state) => {
//   const authService = inject(AuthService);
//   const router = inject(Router);

//   if (authService.isAuthenticated()) {
//     return true;
//   }
//   router.navigate(['/auth/login']);
//   return false;
// };
    


// **********V2**********
// src/app/demo/guards/auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // 1) mémorise l'URL cible complète (avec query string)
  const redirectUrl = state.url;
  sessionStorage.setItem('redirectUrl', redirectUrl);

  // 2) si des query params sont déjà présents, on les garde pour préremplir après login
  if (route.queryParamMap.keys.length) {
    const params: Record<string, string> = {};
    for (const k of route.queryParamMap.keys) {
      const v = route.queryParamMap.get(k);
      if (v !== null) params[k] = v;
    }
    sessionStorage.setItem('pendingTransferParams', JSON.stringify(params));
  }

  // 3) renvoie vers la page de login avec le redirect
  return router.createUrlTree(['/auth/login'], { queryParams: { redirect: redirectUrl } });
};
