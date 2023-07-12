import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import { AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { UsagerService } from 'projects/usager-ng-core/src/lib/services/usager.service';
import { BaseUsagerPageComponent } from '../base-usager-page/base-usager-page.component';
import { HasAutoSave } from 'projects/usager-ng-core/src/lib/services/auto-save-guard.service';
import { Observable } from 'rxjs';
import { EditerUsagerContainerComponent } from 'projects/usager-ng-core/src/lib/components/containers';

export enum niveauIdentificacaoUsager {
  TOTAL = "TOTAL",
  PARTIEL = "PARTIEL",
  ANONYME = "ANONYME"
}

export enum couleurCadenas {
  ROUGE = "rouge",
  JAUNE = "jaune",
  VERT = "vert"
}

@Component({
  selector: 'app-editer-usager',
  templateUrl: './editer-usager-page.component.html',
  providers: [ConfirmationDialogService],
  styleUrls: ['./editer-usager-page.component.css']
})
export class EditerUsagerPageComponent extends BaseUsagerPageComponent implements OnInit, OnDestroy, HasAutoSave {

  @ViewChild('usagerEdition', { static: true })
  usagerEdition: EditerUsagerContainerComponent;

  public messageConfirmerAnnuler: string;

  public errorsMessages = {}

  public detailMenuTop: string = "";
  public labelMenuTop: string = "";

  constructor(route: ActivatedRoute,
    router: Router,
    authenticationService: AuthenticationService,
    appContextStore: AppContextStore,
    usagerService: UsagerService) {
    super(route, router, authenticationService, appContextStore, usagerService);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  /**
  * Lorsqu'une édition d'usager est demandée.
  */
  onModifierUsager(idUsager: number): void {
    let target = "/" + idUsager + "/editer";
    this.router.navigate([target]);
  }

  /**
   * Lorsqu'une navigation "interne" est enclenchée. Le routing attend une réponse positive de cette méthode avant
   * de s'exécuter, laissant le temps de sauvegarder les données avant de poursuivre.
   */
  autoSaveBeforeRoute(): Observable<boolean> | Promise<boolean> | boolean {
    return this.usagerEdition.autoSaveBeforeRoute();
  }

}

