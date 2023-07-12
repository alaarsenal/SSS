import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import { AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import { UsagerService } from 'projects/usager-ng-core/src/lib/services/usager.service';
import { BaseUsagerPageComponent } from '../base-usager-page/base-usager-page.component';

@Component({
  selector: 'app-ajouter-enregistrement-usager-page',
  templateUrl: './ajouter-enregistrement-usager-page.component.html',
  styleUrls: ['./ajouter-enregistrement-usager-page.component.css']
})
export class AjouterEnregistrementUsagerPageComponent extends BaseUsagerPageComponent implements OnInit, OnDestroy {

  constructor(
    route: ActivatedRoute,
    router: Router,
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

  onConsulterEnregistrements(event: number): void {
    let target = "/" + event + "/enregistrements";
    this.router.navigate([target]);
  }

  onConsulterEnregistrement(event: number): void {
    let target = "/" + this.idUsager + "/enregistrement/" + event + "/consulter";
    this.router.navigate([target]);
  }
  
}
