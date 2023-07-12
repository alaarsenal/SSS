import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { FicheAppelApiService } from "projects/infosocial-ng-core/src/lib/services";
import { AlertModel, AlertType } from "projects/sigct-service-ng-lib/src/lib/alert/alert-model";
import { AlertStore } from "projects/sigct-service-ng-lib/src/lib/alert/alert-store";
import AlertModelUtils from "projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class ModifierFicheAppelGuard implements CanActivate {

    constructor(
        private router: Router,
        private ficheAppelApiService: FicheAppelApiService,
        private translateService: TranslateService,
        private alertStore: AlertStore) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
        const idFicheAppel: number = route.params["idFicheAppel"];
        if (idFicheAppel) {
            return this.ficheAppelApiService.isFicheAppelModifiable(idFicheAppel).pipe(map((result: boolean) => {
                if (!result) {
                    const alertTitle: string = this.translateService.instant("sigct.sa.error.label");
                    // Msg "Accès interdit."
                    const messages: string[] = [this.translateService.instant("ss-iu-e00000")];
                    const alertModel: AlertModel = AlertModelUtils.createAlertModel(messages, alertTitle, AlertType.ERROR);
                    this.alertStore.addAlert(alertModel);

                    // Retourne un UrlTree pour redirection vers l'accueil
                    return this.router.parseUrl('/accueil');
                }
                return true;
            }));
        }
        return of(true);
    }
}