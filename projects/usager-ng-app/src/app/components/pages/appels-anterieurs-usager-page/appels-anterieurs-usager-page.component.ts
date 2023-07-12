import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import { AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import { AppelAnterieurDTO } from 'projects/usager-ng-core/src/lib/models/appel-anterieur-dto';
import { UsagerService } from 'projects/usager-ng-core/src/lib/services/usager.service';
import { BaseUsagerPageComponent } from '../base-usager-page/base-usager-page.component';

@Component({
  selector: 'app-appels-anterieurs-usager-page',
  templateUrl: './appels-anterieurs-usager-page.component.html',
  styleUrls: ['./appels-anterieurs-usager-page.component.css']
})
export class AppelsAnterieursUsagerPageComponent extends BaseUsagerPageComponent implements OnInit, OnDestroy {

  constructor(router: Router,
    route: ActivatedRoute,
    authenticationService: AuthenticationService,
    appContextStore: AppContextStore,
    usagerService: UsagerService) {
    super(route, router, authenticationService, appContextStore, usagerService);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  /**
   * Lorsque la consultation de l'appel antérieur est demandée. On navigue vers la consultation.
   * @param appelAnterieur appel antérieur à consulter
   */
  onConsulterFicheAppel(appelAnterieur: AppelAnterieurDTO): void {
    this.router.navigate(["./" + appelAnterieur.domaine, appelAnterieur.idFicheAppel, "consulter"], { relativeTo: this.route });
  }
}
