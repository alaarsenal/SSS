import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CritereRechercheDTO } from 'projects/isiswhisto-ng-core/src/lib/models';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import AuthenticationUtils from 'projects/sigct-service-ng-lib/src/lib/auth/authentication-utils';
import { MaterialModalDialogService } from 'projects/sigct-service-ng-lib/src/lib/material-modal-dialog/material-modal-dialogl.service';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import DateUtils from 'projects/sigct-service-ng-lib/src/lib/utils/date-utils';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { Subscription } from 'rxjs';
import { InputOption, InputOptionCollection } from '../../../../../sigct-ui-ng-lib/src/lib/utils/input-option';

@Component({
  selector: 'msss-rechercher-isisw-criterias',
  templateUrl: './rechercher-isisw-criterias.component.html',
  styleUrls: ['./rechercher-isisw-criterias.component.css']
})
export class RechercherIsiswCriteriasComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  private lastIdRegionTraitAppel: number;

  demain: string;
  isRechercheTous: boolean = false;

  isDateAppelMinValide: boolean = true;
  isNomValide: boolean = true;
  isPrenomValide: boolean = true;
  isTelephoneValide: boolean = true;



  critereRechercheDto: CritereRechercheDTO;
  @Input("critereRecherche")
  set critereRecherche(dto: CritereRechercheDTO) {
    this.critereRechercheDto = dto;
    this.lastIdRegionTraitAppel = dto?.idRegionTraitAppel;
  }

  @Input()
  listeSexe: InputOptionCollection;

  @Input()
  listeRegionResidence: InputOptionCollection;

  @Input()
  listeProfessionnel: InputOptionCollection;

  @Input()
  listeService: InputOptionCollection;

  @Output()
  serviceChange: EventEmitter<string> = new EventEmitter();

  @Output()
  rechercher: EventEmitter<void> = new EventEmitter();

  constructor(
    private alertStore: AlertStore,
    private materialModalDialogService: MaterialModalDialogService,
    private translateService: TranslateService) {
  }

  ngOnInit(): void {
    this.demain = DateUtils.getDateToAAAAMMJJ(new Date());
    this.isRechercheTous = AuthenticationUtils.hasAnyRole(['ROLE_SA_APPEL_RECH_ISISW_TOUS', 'ROLE_SO_APPEL_RECH_ISISW_TOUS']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onExecuterRecherche(): void {
    this.rechercher.emit();
  }

  /**
   * Lorsqu'un service est sélectionné, on notifie le parent du changement.
   * @param optionSelected 
   */
  onServiceSelected(optionSelected: InputOption): void {
    this.subscriptions.add(
      // Certains filtres de recherche seront perdus, désirez-vous continuer?
      this.materialModalDialogService.popupConfirmer("is-iu-c00001").subscribe((result: boolean) => {
        if (result === true) {
          this.lastIdRegionTraitAppel = this.critereRechercheDto.idRegionTraitAppel;
          this.critereRechercheDto.createdUsername = null;

          // Met à jour le contenu de la liste des users (professionnels) pour afficher ceux liés au service sélectionné.
          this.serviceChange.emit(optionSelected.value);
        } else {
          // Remet l'ancien service dans la liste déroulante.
          this.critereRechercheDto.idRegionTraitAppel = this.lastIdRegionTraitAppel;
        }
      })
    );
  }

  /**
   * Crée un message d'erreur pour un nombre minimum de caractères requis.
   * @param nomChamp nom du champ à inclure dans le message d'erreur
   */
  private creerMsgErrMinLength(nomChamp: string): string {
    // ss-iu-e11015={{0}} : un minimum de deux caractères est requis.
    return this.translateService.instant("ss-iu-e11015", [nomChamp]);
  }

  /**
   * Retourne true si aucun critère de recherche est saisi.
   */
  private isCriteresEmpty(): boolean {
    return !this.critereRechercheDto.idAppel &&
      !this.critereRechercheDto.idRegion &&
      !this.critereRechercheDto.idRegionTraitAppel &&
      !this.critereRechercheDto.dateAppelMax &&
      !this.critereRechercheDto.dateAppelMin &&
      !this.critereRechercheDto.dateNaissance &&
      StringUtils.isBlank(this.critereRechercheDto.nom) &&
      StringUtils.isBlank(this.critereRechercheDto.prenom) &&
      StringUtils.isBlank(this.critereRechercheDto.telephone) &&
      StringUtils.isBlank(this.critereRechercheDto.sexeCode);
  }

  /**
   * Valide les critères saisis et marque en rouge les critères en erreur. 
   * Retourne true si tout est valide sinon false.
   * @param nbCarMinRecherche nombre de caractères minimum pour qu'un critère en saisie libre soit concidéré valide
   */
  public validerCriteres(nbCarMinRecherche: number): boolean {
    this.alertStore.resetAlert();

    this.isDateAppelMinValide = true;

    let messages: string[] = [];

    if (this.isCriteresEmpty()) {
      // is-iu-e00001=Recherche: au moins un critère de recherche doit être saisi.
      this.subscriptions.add(
        this.materialModalDialogService.popupAvertissement("is-iu-e00001").subscribe()
      );
      return false;
    }

    if (this.critereRechercheDto.dateAppelMin && this.critereRechercheDto.dateAppelMax && this.critereRechercheDto.dateAppelMin > this.critereRechercheDto.dateAppelMax) {
      this.isDateAppelMinValide = false;
      //ss-sv-e70001=Date de début : la date de début doit être inférieure ou égale à la date de fin.
      const msg: string = this.translateService.instant("ss-sv-e70001");
      messages.push(msg);
    }

    if (this.critereRechercheDto.nom && this.critereRechercheDto.nom.length < nbCarMinRecherche) {
      this.isNomValide = false;
      const nomChamp = this.translateService.instant("sigct.ss.r_appelsisisw.nom");
      messages.push(this.creerMsgErrMinLength(nomChamp));
    }

    if (this.critereRechercheDto.prenom && this.critereRechercheDto.prenom.length < nbCarMinRecherche) {
      this.isPrenomValide = false;
      const nomChamp = this.translateService.instant("sigct.ss.r_appelsisisw.prenom");
      messages.push(this.creerMsgErrMinLength(nomChamp));
    }

    if (this.critereRechercheDto.telephone && this.critereRechercheDto.telephone.length < nbCarMinRecherche) {
      this.isTelephoneValide = false;
      const nomChamp = this.translateService.instant("sigct.ss.r_appelsisisw.telephonique");
      messages.push(this.creerMsgErrMinLength(nomChamp));
    }

    if (messages.length > 0) {
      const alertTitle: string = this.translateService.instant("sigct.ss.error.label");
      const alertModel: AlertModel = AlertModelUtils.createAlertModel(messages, alertTitle, AlertType.ERROR);
      this.alertStore.addAlert(alertModel);
      return false;
    } else {
      return true;
    }
  }

}
