import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { AppelAnterieurApiService } from "../services/appel-anterieur-api.service";






@Injectable({
    providedIn: 'root'
})
export class AccesAppelAnterieurGuard implements CanActivate {

    constructor(
        private router: Router,
        private ficheAppelApiService: AppelAnterieurApiService) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
        const domaine: string = route.params["domaine"];
        const idFicheAppel: number = route.params["idFicheAppel"];
        if (domaine && idFicheAppel) {
            return this.ficheAppelApiService.isFicheAppelAccessible(domaine, idFicheAppel).pipe(map((result: boolean) => {
                if (!result) {
                    // Retourne un UrlTree pour redirection
                    return this.router.parseUrl('/accueil');
                }
                return true;
            }));
        }
        return of(true);
    }
}