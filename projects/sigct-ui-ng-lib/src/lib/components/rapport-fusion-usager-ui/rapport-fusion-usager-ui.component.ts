import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import AuthenticationUtils from 'projects/sigct-service-ng-lib/src/lib/auth/authentication-utils';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import DateUtils from 'projects/sigct-service-ng-lib/src/lib/utils/date-utils';
import { InputOption } from 'projects/sigct-ui-ng-lib/src/lib/components/piloter-table-reference-content-en-consultation/input-option';
import { SigctDatepickerComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-datepicker/sigct-datepicker.component';
import { CriteresPagination } from 'projects/sigct-ui-ng-lib/src/lib/components/table-pagination/criteres-pagination';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { RechercheFusionUsagerCritereDTO } from 'projects/usager-ng-core/src/lib/models/recherche-fusion-usager-critere-dto';
import { RechercheFusionUsagerResultatDTO } from 'projects/usager-ng-core/src/lib/models/recherche-fusion-usager-resultat-dto';
import { Subscription } from 'rxjs';

@Component({
  selector: 'rapport-fusion-usager-ui',
  templateUrl: './rapport-fusion-usager-ui.component.html',
  styleUrls: ['./rapport-fusion-usager-ui.component.css'],
})
export class RapportFusionUsagerUiComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  private idStOrganismeCourant: number = AuthenticationUtils.getUserFromStorage()?.idOrganismeCourant;
  private nomOrganismeCourant: string = AuthenticationUtils.getUserFromStorage()?.nomOrganismeCourant;
  private nomOrganismeTous: string;

  nomOrganisme: string;
  endDate: string; // Représente la date maximum que l'on peut saisir dans le champ date

  criteresRecherche: RechercheFusionUsagerCritereDTO = new RechercheFusionUsagerCritereDTO();

  displayedColumns: string[] = ['dateHeureFusion', 'nomPrenomUsagerIdentOrigine1', 'nomPrenomUsagerIdentOrigine2', 'nomPrenomUsagerIdentResultat', 'nomPrenomIntervenantFusion', 'nomOrganismeFusion'];
  columnsHeadThatNeedTitleProperty: string[] = [];
  columnsHeadThatNeedEllipsis: string[] = [];
  headTitleByCodeColumn: Map<string, string> = new Map<string, string>();
  defaultSortField: string = "dateHeureFusion" // Le nom de la colonne de tri par défaut.
  defaultPageSize: number = 50 // Le nombre d'éléments par page par défaut.
  identifiantPaginationTable = "tbl-resultat-rapport-fusion"

  isDateDebutValide: boolean = true;
  isDateFinValide: boolean = true;
  isRapportProvincial: boolean;

  @Input()
  resultatDto: RechercheFusionUsagerResultatDTO = new RechercheFusionUsagerResultatDTO();

  @Input()
  listeIntervenant: InputOptionCollection;

  @Input()
  listeOrganisme: InputOptionCollection;

  @ViewChild("critereDateDebut", { static: true })
  datepickerCritereDateDebut: SigctDatepickerComponent;

  @Output("rechercherFusion")
  rechercherFusionEmitter: EventEmitter<RechercheFusionUsagerCritereDTO> = new EventEmitter();

  @Output("exporterUsagerFusionResults")
  exporterUsagerFusionResultsEvent: EventEmitter<RechercheFusionUsagerCritereDTO> = new EventEmitter();

  constructor(
    private alertStore: AlertStore,
    private authenticationService: AuthenticationService,
    private translateService: TranslateService) {
  }

  /**
   * Initialisation de la page
   */
  ngOnInit() {
    this.alertStore.resetAlert();

    this.isRapportProvincial = this.authenticationService.hasAllRoles(['ROLE_US_RAPPORT_FUSION_PROV']);

    this.endDate = DateUtils.getDateToAAAAMMJJ(new Date());

    this.subscriptions.add(
      this.translateService.get("sigct.rapport.fusionusager.filtre.organisme.tous").subscribe(result => {
        this.nomOrganismeTous = result;
        this.nomOrganisme = this.nomOrganismeTous;
      })
    );

    // Positionne le focus sur le champ date de naissance par défaut.
    this.datepickerCritereDateDebut.focus();

    this.initCritereRecherche();
    this.initHeadTitleByCodeColumn();
  }

  /**
   * Libérer le modèle.
   */
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  /**
   * Initialise les critères de recherche avec des valeurs par défaut.
   */
  private initCritereRecherche() {
    let criteresPagination: CriteresPagination = new CriteresPagination();
    criteresPagination.page = 1; // En backend service la premiere page est d'indexe '1' contrairement au frontend ou l'indexe est '0'
    criteresPagination.pageSize = 50;
    criteresPagination.sortDirection = "asc";
    criteresPagination.sortField = this.defaultSortField;

    this.criteresRecherche.criteresPagination = criteresPagination;
  }

  /**
   * Initialise les libellés des entêtes des colonne.
   */
  private initHeadTitleByCodeColumn() {
    let self = this;
    this.displayedColumns.forEach((codeColumn: string) => {
      switch (codeColumn) {
        case "dateHeureFusion":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.rapport.fusionusager.resultat.dtfusion"));
          break;
        case "nomPrenomUsagerIdentOrigine1":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.rapport.fusionusager.resultat.usager1"));
          break;
        case "nomPrenomUsagerIdentOrigine2":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.rapport.fusionusager.resultat.usager2"));
          break;
        case "nomPrenomUsagerIdentResultat":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.rapport.fusionusager.resultat.usagerfusion"));
          break;
        case "nomPrenomIntervenantFusion":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.rapport.fusionusager.resultat.utilisateur"));
          break;
        case "nomOrganismeFusion":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.rapport.fusionusager.resultat.organisme"));
          break;
        default:
          self.headTitleByCodeColumn.set(codeColumn, "");
          break;
      }
    });
  }


  /**
   * Lance la recherche après validation des critères.
   */
  private rechercher(): void {
    if (this.validerCriteres()) {
      this.rechercherFusionEmitter.emit(this.criteresRecherche);
    }
  }

  /**
   * Exécute la recherche lorsque le bouton Rechercher est cliqué.
   */
  onBtnRechercher() {
    this.rechercher();
  }

  /**
   * Réinitialise les paramètres de recherche.
   */
  onBtnReinitialiser() {
    this.vider();
    this.datepickerCritereDateDebut.focus();
  }

  /**
   * Exécute la recherche sur la touche "Entrée"  
   * @param event 
   */
  onKeydownEnter(event) {
    this.rechercher();
  }

  /**
   * Lorsqu'un nouvel intervenant est sélectionné dans la liste déroulante, on affiche le nom de l'organisme de l'utilisateur connecté dans le champ "Organisme".
   * Affiche "Tous" lorsqu'aucun intervenant n'est sélectionné.
   * @param optionSelected 
   */
  onIntervenantSelected(optionSelected: InputOption): void {
    if (optionSelected?.value) {
      this.nomOrganisme = this.nomOrganismeCourant;
      this.criteresRecherche.idStOrganismesFusion = this.idStOrganismeCourant;
    } else {
      this.nomOrganisme = this.nomOrganismeTous;
      this.criteresRecherche.idStOrganismesFusion = null;
    }
  }

  /**
   * Met à jour les critères de pagination et lance la recherche.
   * @param criteresPagination 
   */
  onRefreshTable(criteresPagination: CriteresPagination): void {
    this.criteresRecherche.criteresPagination = criteresPagination;

    // Lance la recherche après validation des critères.
    this.rechercher();
  }

  /**
   * Lance la recherche après validation des critères.
   */
  onRechercher(): void {
    this.rechercher();
  }

  /**
   * Retourne true si aucun critère de recherche est saisi.
   */
  validerCriteres(): boolean {
    this.alertStore.resetAlert();

    this.isDateDebutValide = true;
    this.isDateFinValide = true;

    let messages: string[] = [];

    if (!this.criteresRecherche.dateDebut) {
      this.isDateDebutValide = false;
      const champ: string = this.translateService.instant("sigct.rapport.fusionusager.filtre.dtdebut");
      const msg: string = this.translateService.instant("general.msg.obligatoire", { 0: champ });
      messages.push(msg);
    }

    if (!this.criteresRecherche.dateFin) {
      this.isDateFinValide = false;
      const champ: string = this.translateService.instant("sigct.rapport.fusionusager.filtre.dtfin");
      const msg: string = this.translateService.instant("general.msg.obligatoire", { 0: champ });
      messages.push(msg);
    }

    if (this.criteresRecherche.dateDebut && this.criteresRecherche.dateFin && this.criteresRecherche.dateDebut > this.criteresRecherche.dateFin) {
      this.isDateDebutValide = false;
      //ss-sv-e70001=Date de début : la date de début doit être inférieure ou égale à la date de fin.
      const msg: string = this.translateService.instant("ss-sv-e70001");
      messages.push(msg);
    }

    if (messages.length > 0) {
      const alertTitle: string = this.translateService.instant("girpi.error.label");
      const alertModel: AlertModel = AlertModelUtils.createAlertModel(messages, alertTitle, AlertType.ERROR);
      this.alertStore.addAlert(alertModel);
      return false;
    } else {
      return true;
    }
  }

  /**
   * Vider les critères de recherche et retourne à la première page.
   */
  vider() {
    this.alertStore.resetAlert();

    this.isDateDebutValide = true;
    this.isDateFinValide = true;

    this.criteresRecherche.dateDebut = null;
    this.criteresRecherche.dateFin = null;
    this.criteresRecherche.idUsagerIdent = null;
    this.criteresRecherche.usernameIntervenantFusion = null;
    this.criteresRecherche.idStOrganismesFusion = null;

    this.nomOrganisme = this.nomOrganismeTous;

    this.criteresRecherche.criteresPagination.page = 0;

    this.resultatDto.listeRapportUsagerFusionDto =  [];
    this.resultatDto.nbTotalElements = 0;
  }

  onExporter() {
    this.exporterUsagerFusionResultsEvent.emit(this.criteresRecherche);
  }
}
