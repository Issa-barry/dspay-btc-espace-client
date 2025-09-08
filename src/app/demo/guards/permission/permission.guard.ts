import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from '../../service/permission/permission.service';
import { AuthService } from '../../service/auth/auth.service';
import { ContactService } from '../../service/contact/contact.service';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Contact } from '../../models/contact';
import { MessageService } from 'primeng/api';

export const permissionGuard: CanActivateFn = (route, state): Observable<boolean> => {
  const permissionService = inject(PermissionService);
  const authService = inject(AuthService);
  const contactService = inject(ContactService);
  const router = inject(Router);
  const messageService = inject(MessageService);

  const userId = Number(authService.getUserId());

  if (!userId) {
    console.error('User ID is not available. Redirecting to login.');
    router.navigate(['/auth/login']);
    return of(false);
  }

  return contactService.getContactById(userId).pipe(
    switchMap((contact: Contact | null) => {
      if (!contact) {
        console.error('Contact not found. Redirecting to login.');
        // router.navigate(['/']);
        return of(false);
      }

      const roleId = contact.role_id;
      
      if (!roleId) {
        console.error('Role ID is missing for the contact. Redirecting to login.');
        // router.navigate(['/']);
        return of(false);
      }

      const requiredPermission = route.data?.['permission'];
      if (!requiredPermission) {
        console.error('No required permission specified in route data.');
        return of(false);
      }

      return permissionService.getRolePermissions(roleId).pipe(
        map((permissions) => {
          const hasPermission = permissions.some(permission => permission.name === requiredPermission);
          if (!hasPermission) {
            console.warn(`La permission '${requiredPermission}' n'est pas accordée pour le rôle avec l'ID ${roleId}.`);
            // router.navigate(['/unauthorized']);
            return false;
          }
          return true;
        }),
        catchError((error) => {
          console.error('Error while checking permissions:', error);
          // router.navigate(['/auth/login']);
          return of(false);
        })
      );
    }),
    catchError((error) => {
      console.error('Error while retrieving user contact:', error);
      // router.navigate(['/auth/login']);
      return of(false);
    })
  );

  // return of(true);
};
