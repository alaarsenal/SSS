import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthenticationService } from './authentication.service';
import { User } from './user';


@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private router: Router, private authenticationService: AuthenticationService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    const requiredRoles = route.data.requiredRoles !== undefined ? route.data.requiredRoles : [];

    const user: User = this.authenticationService.getAuthenticatedUser();
    if (user && user.name) {
      if (this.authenticationService.hasAnyRole(requiredRoles)) {
        return of(true);
      }
    } else {
      // Aucun user en session, on tente d'aller chercher ses informations sur le serveur.
      return this.authenticationService.retrieveUserFromApiUserMe().pipe(map((user: User) => {
        if (this.authenticationService.isAuthenticated() && this.authenticationService.hasAnyRole(requiredRoles)) {
          return true;
        }
        return false;
      }));
    }
    return of(false);
  }
}
