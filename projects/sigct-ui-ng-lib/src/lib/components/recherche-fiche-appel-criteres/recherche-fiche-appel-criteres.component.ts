import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import AuthenticationUtils from 'projects/sigct-service-ng-lib/src/lib/auth/authentication-utils';
import { MaterialModalDialogService } from 'projects/sigct-service-ng-lib/src/lib/material-modal-dialog/material-modal-dialogl.service';
import { CriteresAppelDTO } from 'projects/sigct-service-ng-lib/src/lib/models/recherche-fiche-appel-criteres-dto';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import DateUtils from 'projects/sigct-service-ng-lib/src/lib/utils/date-utils';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { Subscription } from 'rxjs';
import { InputOption, InputOptionCollection } from '../../utils/input-option';
import { SigctDatepickerComponent } from '../sigct-datepicker/sigct-datepicker.component';

@Component({
  selector: 'app-recherche-fiche-appel-criteres',
  templateUrl: './recherche-fiche-appel-criteres.component.html',
  styleUrls: ['./recherche-fiche-appel-criteres.component.css'],
  providers: [DatePipe]
})
export class RechercheFicheAppelCriteresComponent implements OnInit {
  private subscriptions: Subscription = new Subscription();
  private lastIdStOrganismes: number;

  isHeureDebutMinValide: boolean = true;
  isHeureDebutMaxValide: boolean = true;

  demain: string;

  criteresRecherche: CriteresAppelDTO;
  @Input("criteresRecherche")
  set criteresRechercheDto(dto: CriteresAppelDTO) {
    this.criteresRecherche = dto;
    this.lastIdStOrganismes = dto?.idStOrganismes;
  }

  @Input()
  domaine: string;

  @Input()
  listeRoleAction: InputOptionCollection;
  @Input()
  listeRaisonAppel: InputOptionCollection;
  @Input()
  listeLangueAppel: InputOptionCollection;
  @Input()
  listeNiveauUrgence: InputOptionCollection;
  @Input()
  listeReference: InputOptionCollection;
  @Input()
  listeOrientation: InputOptionCollection;

  @Input()
  listeIntervenant: InputOptionCollection;

  @Input()
  listeOrganisme: InputOptionCollection;

  @Input()
  listeAucuneInteraction: InputOptionCollection;
  @Input()
  listeAucuneSuite: InputOptionCollection;
  @Input()
  listeCentreActivite: InputOptionCollection;

  @Output("majListeIntervenant")
  majListeIntervenantEvent: EventEmitter<number> = new EventEmitter();

  @Output("professionalEvent")
  professionalEvent: EventEmitter<string> = new EventEmitter();

  @Output("rechercher")
  rechercherEvent: EventEmitter<void> = new EventEmitter();

  @ViewChild("dtdbperiodeappel", { static: true })
  dateDebutFicheAppelMin: SigctDatepickerComponent;

  constructor(
    private datePipe: DatePipe,
    private alertStore: AlertStore,
    private translateService: TranslateService,
    private materialModalDialogService: MaterialModalDialogService) { }

  ngOnInit(): void {
    this.demain = DateUtils.getDateToAAAAMMJJ(new Date());
  }

  /**
   * Valide que hhmm est une heure valide sous 23:59.
   * @param hhmm heure/minute au format 0530 pour 05:30
   */
  private validerHHMM(hhmm: string): boolean {
    let heure: number = +hhmm.substr(0, 2);
    let minute: number = +hhmm.substr(2, 2);

    if (heure > 23 || minute > 59) {
      return false
    }

    return true;
  }

  onExecuterRecherche(): void {
    this.rechercherEvent.emit();
  }

  /**
   * Quand l'usager quitte le champ avec moins de 3 caractères, on ajoute des zéros pour former une heure valide.
   */
  onBlurHeureDtDebut(): void {
    if (this.criteresRecherche.heureDebutFicheAppelMin) {
      this.criteresRecherche.heureDebutFicheAppelMin = this.criteresRecherche.heureDebutFicheAppelMin.padStart(4, "0");

      if (!this.validerHHMM(this.criteresRecherche.heureDebutFicheAppelMin)) {
        this.criteresRecherche.heureDebutFicheAppelMin = "";
      }
    }
  }

  onBlurHeureDtFin(): void {
    if (this.criteresRecherche.heureDebutFicheAppelMax) {
      this.criteresRecherche.heureDebutFicheAppelMax = this.criteresRecherche.heureDebutFicheAppelMax.padStart(4, "0");

      if (!this.validerHHMM(this.criteresRecherche.heureDebutFicheAppelMax)) {
        this.criteresRecherche.heureDebutFicheAppelMax = "";
      }
    }
  }

  /**
   * Lorsqu'un nouvel organisme est sélectionné dans la liste déroulante. 
   * Après confirmation de l'utilisateur, on rafraichit la liste des intervenants (professionnels), sinon on
   * annule la sélection de l'organisme.
   * @param optionSelected 
   */
  onOrganismeSelected(optionSelected: InputOption): void {
    this.subscriptions.add(
      // Certains filtres de recherche seront perdus, désirez-vous continuer?
      this.materialModalDialogService.popupConfirmer("ss-iu-c00005").subscribe((result: boolean) => {
        if (result === true) {
          this.lastIdStOrganismes = this.criteresRecherche.idStOrganismes;
          this.criteresRecherche.usernameIntervenant = null;

          // Met à jour le contenu de la liste des intervenants (professionnels) pour afficher ceux liés à l'organisme sélectionné.
          this.majListeIntervenantEvent.emit(this.criteresRecherche.idStOrganismes);
        } else {
          // Remet l'ancien organisme dans la liste déroulante.
          this.criteresRecherche.idStOrganismes = this.lastIdStOrganismes;
        }
      })
    );
  }

  onProfessionelSelected(optionSelected: InputOption): void {
    this.professionalEvent.emit(this.criteresRecherche.usernameIntervenant);
  }

  /**
   * Remet le focus sur le premier critère de recherche (date de la fiche).
   */
  public resetFocus(): void {
    this.dateDebutFicheAppelMin.focus();
  }

  /**
   * Valide les critères saisis et marque en rouge les critères en erreur. 
   * Retourne true si tout est valide sinon false.
   */
  public validerCriteres(): boolean {
    let messages: Set<string> = new Set();

    this.isHeureDebutMinValide = true;
    this.isHeureDebutMaxValide = true;

    if (!this.criteresRecherche.dateDebutFicheAppelMin && this.criteresRecherche.heureDebutFicheAppelMin) {
      // Heure : une heure a été indiquée sans date.
      const msg: string = this.translateService.instant("ss-iu-e70001");
      messages.add(msg);
      this.isHeureDebutMinValide = false;
    }

    if (!this.criteresRecherche.dateDebutFicheAppelMax && this.criteresRecherche.heureDebutFicheAppelMax) {
      // Heure : une heure a été indiquée sans date.
      const msg: string = this.translateService.instant("ss-iu-e70001");
      messages.add(msg);
      this.isHeureDebutMaxValide = false;
    }

    if (messages.size > 0) {
      const alertTitle: string = this.translateService.instant("sigct.ss.error.label");
      const alertModel: AlertModel = AlertModelUtils.createAlertModel(Array.from(messages), alertTitle, AlertType.ERROR)
      this.alertStore.addAlert(alertModel);

      return false;
    }

    return true;
  }

  /**
   * Retourne true si tous les critères de recherche sont vides.
   */
  public isEmpty(): boolean {
    return !this.criteresRecherche.idFicheAppel &&
      !this.criteresRecherche.aucuneInteraction &&
      !this.criteresRecherche.aucuneSuite &&
      !this.criteresRecherche.dateDebutFicheAppelMax &&
      !this.criteresRecherche.dateDebutFicheAppelMin &&
      !this.criteresRecherche.dureeFicheAppelMax &&
      !this.criteresRecherche.dureeFicheAppelMin &&
      StringUtils.isBlank(this.criteresRecherche.heureDebutFicheAppelMax) &&
      StringUtils.isBlank(this.criteresRecherche.heureDebutFicheAppelMin) &&
      StringUtils.isBlank(this.criteresRecherche.idInteraction) &&
      !this.criteresRecherche.idRfLangueAppel &&
      !this.criteresRecherche.idRfNivUrgence &&
      !this.criteresRecherche.idRfOrientation &&
      !this.criteresRecherche.idRfRaisonAppels &&
      !this.criteresRecherche.idRfReference &&
      !this.criteresRecherche.idRfRoleAction &&
      !this.criteresRecherche.idStOrganismes &&
      !this.criteresRecherche.idRfCentreActivite &&
      StringUtils.isBlank(this.criteresRecherche.usernameIntervenant);
  }

  /**
   * Vide tous les critères de recherche et retrait des champs en rouge. 
   */
  public viderCriteres(): void {
    this.isHeureDebutMinValide = true;
    this.isHeureDebutMaxValide = true;

    this.criteresRecherche.idFicheAppel = null;
    this.criteresRecherche.aucuneInteraction = false;
    this.criteresRecherche.aucuneSuite = null;
    this.criteresRecherche.dateDebutFicheAppelMax = null;
    this.criteresRecherche.dateDebutFicheAppelMin = null;
    this.criteresRecherche.dureeFicheAppelMax = null;
    this.criteresRecherche.dureeFicheAppelMin = null;
    this.criteresRecherche.heureDebutFicheAppelMax = null;
    this.criteresRecherche.heureDebutFicheAppelMin = null;
    this.criteresRecherche.idInteraction = null;
    this.criteresRecherche.idRfLangueAppel = null;
    this.criteresRecherche.idRfNivUrgence = null;
    this.criteresRecherche.idRfOrientation = null;
    this.criteresRecherche.idRfRaisonAppels = null;
    this.criteresRecherche.idRfReference = null;
    this.criteresRecherche.idRfRoleAction = null;
    this.criteresRecherche.idRfCentreActivite = null;

    this.criteresRecherche.idStOrganismes = AuthenticationUtils.getUserFromStorage()?.idOrganismeCourant;
    this.criteresRecherche.usernameIntervenant = AuthenticationUtils.getUserFromStorage()?.name;

    this.lastIdStOrganismes = this.criteresRecherche.idStOrganismes;
    // Met à jour le contenu de la liste des intervenants (professionnels) pour afficher ceux liés à l'organisme courant.
    this.majListeIntervenantEvent.emit(this.criteresRecherche.idStOrganismes);

  }

}
