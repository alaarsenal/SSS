import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { CriteresNoteComplementaireDTO } from 'projects/sigct-service-ng-lib/src/lib/models/recherche-fiche-appel-criteres-dto';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import DateUtils from 'projects/sigct-service-ng-lib/src/lib/utils/date-utils';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import AuthenticationUtils from '../../../../../sigct-service-ng-lib/src/lib/auth/authentication-utils';
import { InputOptionCollection } from '../../utils/input-option';
import { SigctChosenComponent } from '../sigct-chosen/sigct-chosen.component';

@Component({
  selector: 'app-recherche-note-complementaire-criteres',
  templateUrl: './recherche-note-complementaire-criteres.component.html',
  styleUrls: ['./recherche-note-complementaire-criteres.component.css'],
  providers: [DatePipe]
})
export class RechercheNoteComplementaireCriteresComponent implements OnInit {
  isHeureDebutMinValide: boolean = true;
  isHeureDebutMaxValide: boolean = true;

  demain: string;

  criteresRecherche: CriteresNoteComplementaireDTO;
  @Input("criteresRecherche")
  set criteresRechercheDto(dto: CriteresNoteComplementaireDTO) {
    this.criteresRecherche = dto;

    this.criteresRecherche.idOrganismeNote = AuthenticationUtils.getUserFromStorage().idOrganismeCourant;
  }

  @Input()
  listeTypeNote: InputOptionCollection;

  @Input()
  listeIntervenantNote: InputOptionCollection;

  @Output("rechercher")
  rechercherEvent: EventEmitter<void> = new EventEmitter();

  @ViewChild("usernameIntervenantNote", { static: true })
  intervenantChosen: SigctChosenComponent;

  constructor(
    private alertStore: AlertStore,
    private datePipe: DatePipe,
    private translateService: TranslateService) { }

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

  /**
   * Quand l'usager quitte le champ avec moins de 3 caractères, on ajoute des zéros pour former une heure valide.
   */
  onBlurHeureDtDebut(): void {
    if (this.criteresRecherche.heureDebutNoteMin) {
      this.criteresRecherche.heureDebutNoteMin = this.criteresRecherche.heureDebutNoteMin.padStart(4, "0");

      if (!this.validerHHMM(this.criteresRecherche.heureDebutNoteMin)) {
        this.criteresRecherche.heureDebutNoteMin = "";
      }
    }
  }

  /**
   * Quand l'usager quitte le champ avec moins de 3 caractères, on ajoute des zéros pour former une heure valide.
   */
  onBlurHeureDtFin(): void {
    if (this.criteresRecherche.heureDebutNoteMax) {
      this.criteresRecherche.heureDebutNoteMax = this.criteresRecherche.heureDebutNoteMax.padStart(4, "0");

      if (!this.validerHHMM(this.criteresRecherche.heureDebutNoteMax)) {
        this.criteresRecherche.heureDebutNoteMax = "";
      }
    }
  }

  /**
   * Demande au parent de lancer une recherche.
   */
  onExecuterRecherche(): void {
    this.rechercherEvent.emit();
  }

  /**
   * Retourne true si tous les critères de recherche sont vides.
   */
  public isEmpty(): boolean {
    return !this.criteresRecherche.dateDebutNoteMax &&
      !this.criteresRecherche.dateDebutNoteMin &&
      !this.criteresRecherche.dureeNoteMax &&
      !this.criteresRecherche.dureeNoteMin &&
      !this.criteresRecherche.idRfTypeNote &&
      StringUtils.isBlank(this.criteresRecherche.heureDebutNoteMax) &&
      StringUtils.isBlank(this.criteresRecherche.heureDebutNoteMin) &&
      StringUtils.isBlank(this.criteresRecherche.usernameIntervenantNote);
  }

  /**
    * Remet le focus sur le premier critère de recherche.
    */
  public resetFocus(): void {
    this.intervenantChosen.focus();
  }

  /**
   * Valide les critères saisis et marque en rouge les critères en erreur. 
   * Retourne true si tout est valide sinon false.
   * @param nbCarMinRecherche nombre de caractères minimum pour qu'un critère en saisie libre soit concidéré valide
   */
  public validerCriteres(): boolean {
    let messages: Set<string> = new Set();

    this.isHeureDebutMinValide = true;
    this.isHeureDebutMaxValide = true;

    if (!this.criteresRecherche.dateDebutNoteMin && this.criteresRecherche.heureDebutNoteMin) {
      // Heure : une heure a été indiquée sans date.
      const msg: string = this.translateService.instant("ss-iu-e70001");
      messages.add(msg);
      this.isHeureDebutMinValide = false;
    }

    if (!this.criteresRecherche.dateDebutNoteMax && this.criteresRecherche.heureDebutNoteMax) {
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
   * Vide tous les critères de recherche et retrait des champs en rouge. 
   */
  public viderCriteres(): void {
    this.isHeureDebutMinValide = true;
    this.isHeureDebutMaxValide = true;

    this.criteresRecherche.dateDebutNoteMax = null;
    this.criteresRecherche.dateDebutNoteMin = null;
    this.criteresRecherche.dureeNoteMax = null;
    this.criteresRecherche.dureeNoteMin = null;
    this.criteresRecherche.idRfTypeNote = null;
    this.criteresRecherche.heureDebutNoteMax = null;
    this.criteresRecherche.heureDebutNoteMin = null;
    this.criteresRecherche.usernameIntervenantNote = null;
  }

}
