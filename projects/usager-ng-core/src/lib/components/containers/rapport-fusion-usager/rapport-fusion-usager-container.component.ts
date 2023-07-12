import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import AuthenticationUtils from 'projects/sigct-service-ng-lib/src/lib/auth/authentication-utils';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import { OrganismeDTO } from 'projects/sigct-service-ng-lib/src/lib/models/organisme-dto';
import { Action, FormTopBarOptions } from 'projects/sigct-ui-ng-lib/src/lib/utils/form-top-bar-options';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { forkJoin, Subscription } from 'rxjs';
import { ExportationExcelDTO } from '../../../models/exportation-excel-dto';
import { RechercheFusionUsagerCritereDTO } from '../../../models/recherche-fusion-usager-critere-dto';
import { RechercheFusionUsagerResultatDTO } from '../../../models/recherche-fusion-usager-resultat-dto';
import { SigctUserDTO } from '../../../models/sigct-user-dto';
import { OrganismeService } from '../../../services/organisme.service';
import { UsagerFusionApiService } from '../../../services/usager-fusion-api.service';
import { UsagerService } from '../../../services/usager.service';




@Component({
  selector: 'rapport-fusion-usager-container',
  templateUrl: './rapport-fusion-usager-container.component.html',
  styleUrls: ['./rapport-fusion-usager-container.component.css'],
  providers: [DatePipe]
})

export class RapportFusionUsagerContainerComponent implements OnInit, OnDestroy {
  subscriptions: Subscription = new Subscription();

  formTopBarOptions: FormTopBarOptions;

  listeIntervenant: InputOptionCollection = {
    name: "intervenants",
    options: []
  }

  listeOrganisme: InputOptionCollection = {
    name: "organismes",
    options: []
  }

  rechercheFusionUsagerResultatDto: RechercheFusionUsagerResultatDTO = new RechercheFusionUsagerResultatDTO();

  @ViewChild("alertContainer", { read: ViewContainerRef, static: true })
  container;

  constructor(private authenticationService: AuthenticationService,
    private usagerService: UsagerService,
    private organismeApiService: OrganismeService,
    private usagerFusionApiService: UsagerFusionApiService,
    private alertStore: AlertStore,
    private alertService: AlertService,
    private translateService: TranslateService) {
  }

  ngOnInit() {
    this.subscriptions.add(
      this.alertStore.state$.subscribe((state: AlertModel[]) => {
        this.alertService.show(this.container, state);
      })
    );

    const idStOrganismeCourant: number = AuthenticationUtils.getUserFromStorage()?.idOrganismeCourant;

    /**
     * Lance un keep-alive pour s'assurer que l'authentification du module s'est bien effectuée avant de récupérer
     * le contenu des listes, sinon on obtient une erreur 401 au démarrage de l'application.
     */
    this.subscriptions.add(
      forkJoin([
        this.usagerService.keepAlive(), // 0
        this.organismeApiService.getListeIntervenantOrganismeWithRole(idStOrganismeCourant, "US_USAGER_FUSION"), // 1
        this.organismeApiService.getListeOrganismeOrderByActifNom() // 2
      ]).subscribe((results) => {
        const selectMsg: string = this.translateService.instant("option.select.message");

        this.listeIntervenant.options.push({ label: selectMsg, value: null });
        if (results[1]) {
          const intervenants: SigctUserDTO[] = results[1] as SigctUserDTO[];
          intervenants.forEach(item => {
            this.listeIntervenant.options.push({
              label: item.fullDisplayName,
              value: item.username,
              description: item.fullDisplayName,
              actif: item.actif
            });
          });
        }

        this.listeOrganisme.options.push({ label: selectMsg, value: null });
        if (results[2]) {
          const organismes: OrganismeDTO[] = results[2] as OrganismeDTO[];
          organismes.forEach(item => {
            this.listeOrganisme.options.push({
              label: item.nom,
              value: "" + item.id,
              description: '',
              actif: item.actif
            });
          });
        }
      })
    );

    this.initTopBar();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private initTopBar() {
    let topBarActions: Action[] = [];

    this.formTopBarOptions = {
      title: { icon: "fa fa fa-compress fa-lg" },
      actions: topBarActions
    };
  }

  onRechercherFusion(criteresRecherche: RechercheFusionUsagerCritereDTO): void {
    this.subscriptions.add(
      this.usagerFusionApiService.rechercherUsagerFusion(criteresRecherche).subscribe((resultat: RechercheFusionUsagerResultatDTO) => {
        this.rechercheFusionUsagerResultatDto = resultat;
      })
    );
  }

  exporter(criteresRecherche: RechercheFusionUsagerCritereDTO): void {
    this.subscriptions.add(this.usagerFusionApiService.genererExcelFusion(criteresRecherche).subscribe((result: ExportationExcelDTO) => {
      if (!result?.resultEmpty) {
        this.usagerFusionApiService.convertByteDataToExcelAndMakeDownload(result.fileContent, result.fileName);
      }
    }));
  }

}

