import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { OrganismeApiService, ReferencesApiService } from 'projects/infosocial-ng-core/src/lib/services';
import { AlertModel } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import AuthenticationUtils from 'projects/sigct-service-ng-lib/src/lib/auth/authentication-utils';
import { OrganismeDTO } from 'projects/sigct-service-ng-lib/src/lib/models/organisme-dto';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';
import { KeepAliveService } from 'projects/sigct-service-ng-lib/src/lib/services/keep-alive.service';
import { Action, FormTopBarOptions } from 'projects/sigct-ui-ng-lib/src/lib/utils/form-top-bar-options';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { RechercheFusionUsagerCritereDTO } from 'projects/usager-ng-core/src/lib/models/recherche-fusion-usager-critere-dto';
import { RechercheFusionUsagerResultatDTO } from 'projects/usager-ng-core/src/lib/models/recherche-fusion-usager-resultat-dto';
import { UsagerFusionApiService } from 'projects/usager-ng-core/src/lib/services/usager-fusion-api.service';
import { forkJoin, Subscription } from 'rxjs';
import { ExportationExcelDTO } from '../../../../../../../../usager-ng-core/src/lib/models/exportation-excel-dto';


@Component({
  selector: 'rapport-fusion-usager-page',
  templateUrl: './rapport-fusion-page.component.html',
  styleUrls: ['./rapport-fusion-page.component.css']
})
export class RapportFusionUsagerPageComponent implements OnInit, OnDestroy {
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

  constructor(
    private keepAliveService: KeepAliveService,
    private usagerFusionApiService: UsagerFusionApiService,
    private referencesApiService: ReferencesApiService,
    private organismeApiService: OrganismeApiService,
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
    this.keepAliveService.keepAliveSante();
    this.keepAliveService.keepAliveUsager();

    this.subscriptions.add(
      forkJoin([
        this.referencesApiService.getListeIntervenantOrganismeWithRole(idStOrganismeCourant, "US_USAGER_FUSION", false), // 0
        this.organismeApiService.getListeOrganismeOrderByActifNom() // 1
      ]).subscribe(results => {
        const selectMsg: string = this.translateService.instant("option.select.message");

        this.listeIntervenant.options.push({ label: selectMsg, value: null });
        if (results[0]) {
          const intervenants: ReferenceDTO[] = results[0] as ReferenceDTO[];
          intervenants.forEach(item => {
            this.listeIntervenant.options.push({
              label: item.nom,
              value: item.code,
              description: item.description,
              actif: item.actif
            });
          });
        }

        this.listeOrganisme.options.push({ label: selectMsg, value: null });
        if (results[1]) {
          const organismes: OrganismeDTO[] = results[1] as OrganismeDTO[];
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

