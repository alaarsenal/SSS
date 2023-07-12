import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from "@angular/router";
import { FicheAppelSocialDTO } from "projects/infosocial-ng-core/src/lib/models";
import { FicheAppelApiService } from "projects/infosocial-ng-core/src/lib/services";
import { StatutFicheAppelEnum } from "projects/sigct-service-ng-lib/src/lib/models/statut-fiche-appel.enum";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class ConsultSuppFicheGuard implements CanActivate {

    constructor(private router: Router, private ficheAppelApiService: FicheAppelApiService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
        let parms: string[] = state.url.split("/");
        let idFicheAppel: number = +parms[5];
        if (idFicheAppel) {
            return this.ficheAppelApiService.getFicheAppel(idFicheAppel).pipe(map((result: FicheAppelSocialDTO) => {
                if (result.statut == StatutFicheAppelEnum.SUPPRIMER) {
                    return this.router.parseUrl('/accueil');
                }
                return true;
            }));
        }
        return of(true);
    }
}