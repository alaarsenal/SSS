import { Injectable } from "@angular/core";
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from "@angular/router";
import { FicheAppelDTO } from "projects/infosante-ng-core/src/lib/models/fiche-appel-dto";
import { FicheAppelApiService } from "projects/infosante-ng-core/src/lib/services/fiche-appel-api.service";
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
            return this.ficheAppelApiService.getFicheAppel(idFicheAppel).pipe(map((result: FicheAppelDTO) => {
                if (result.statut == StatutFicheAppelEnum.SUPPRIMER) {
                    return this.router.parseUrl('/accueil');
                }
                return true;
            }));
        }
        return of(true);
    }
}
