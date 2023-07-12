import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import { AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import { UsagerService } from 'projects/usager-ng-core/src/lib/services/usager.service';
import { BaseUsagerPageComponent } from '../base-usager-page/base-usager-page.component';

@Component({
  selector: 'app-enregistrements-usager-page',
  templateUrl: './enregistrements-usager-page.component.html',
  styleUrls: ['./enregistrements-usager-page.component.css']
})
export class EnregistrementsUsagerPageComponent extends BaseUsagerPageComponent implements OnInit, OnDestroy {

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

  onRetourListe(): void {
    let target = '/recherche';
    this.router.navigate([target]);
  }

  onAjouterEnregistrement(event: number): void {
    let target = "/" + event + "/enregistrement/generer";
    this.router.navigate([target]);
  }

  onConsulterEnregistrement(event: number): void {
    let target = "/" + this.idUsager + "/enregistrement/" + event + "/consulter";
    this.router.navigate([target]);
  }

  onEditerEnregistrement(event: number): void {
    let target = "/" + this.idUsager + "/enregistrement/" + event + "/editer";
    this.router.navigate([target]);
  }

  onCopieEnregistrement(event: number){
    let target = "/" + this.idUsager + "/enregistrement/" + event + "/copier";
    this.router.navigate([target]);
  }
}
