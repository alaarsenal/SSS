import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UsagerService } from '../services/usager.service';






@Injectable({
  providedIn: 'root'
})
export class AccesUsagerGuard implements CanActivate {
  constructor(
    private alertStore: AlertStore,
    private router: Router,
    private usagerService: UsagerService,
    private translateService: TranslateService) {
  }

  /**
   * Vérifie si l'usager est actif. Retourne true si l'usager est actif ou un UrlTree qui redirige vers la recherche si l'usager est inactif.
   * @param next 
   * @param state 
   * @returns true si l'usager est actif ou un UrlTree qui redirige vers la recherche si l'usager est inactif
   */
  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const idUsagerIdent: number = next.params["idUsager"];
    if (idUsagerIdent) {
      // Vérifie si l'usager est actif.
      return this.usagerService.isUsagerActif(idUsagerIdent).pipe(map((isActif: boolean) => {
        if (!isActif) {
          // Retourne un UrlTree pour redirection vers la recherche.
          // On ajoute en paramètre l'id de l'alert que l'écran de recherche doit afficher.
          // ss-iu-e30008:L'usager n'est plus actif. Ses informations ne peuvent être modifiées.
          return this.router.createUrlTree(['/recherche'], { queryParams: { "alert": "ss-iu-e30008" } });
        }
        return true;
      }));
    }

    return true;
  }

}
