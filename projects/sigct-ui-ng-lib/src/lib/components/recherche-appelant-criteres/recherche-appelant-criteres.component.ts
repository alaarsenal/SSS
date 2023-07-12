import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { CriteresAppelantDTO } from 'projects/sigct-service-ng-lib/src/lib/models/recherche-fiche-appel-criteres-dto';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { InputOptionCollection } from '../../utils/input-option';
import { Tuple } from '../../utils/tuple';
import { InputTextComponent } from '../input-text/input-text.component';
import { RrssDTO } from '../rrss/rrss-dto';

@Component({
  selector: 'app-recherche-appelant-criteres',
  templateUrl: './recherche-appelant-criteres.component.html',
  styleUrls: ['./recherche-appelant-criteres.component.css'],
  providers: [DatePipe]
})
export class RechercheAppelantCriteresComponent implements OnInit {
  isNomValide: boolean = true;
  isPrenomValide: boolean = true;
  isTelephoneValide: boolean = true;

  listeRessourceRrss: Tuple[] = [];

  criteresRecherche: CriteresAppelantDTO;
  @Input("criteresRecherche")
  set criteresRechercheDto(dto: CriteresAppelantDTO) {
    this.criteresRecherche = dto;
  }

  @Input()
  domaine: string;

  @Input()
  listeCategorieAppelant: InputOptionCollection;

  @Output("rechercher")
  rechercherEvent: EventEmitter<void> = new EventEmitter();

  @ViewChild("nomAppelant", { static: true })
  nomAppelantInputText: InputTextComponent;

  constructor(
    private alertStore: AlertStore,
    private translateService: TranslateService) { }

  ngOnInit(): void {
  }

  /**
   * Crée un message d'erreur pour un nombre minimum de caractères requis.
   * @param nomChamp nom du champ à inclure dans le message d'erreur
   */
  private creerMsgErrMinLength(nomChamp: string): string {
    // {{0}} : un minimum de deux caractères est requis.
    return this.translateService.instant("us-iu-e00011", [nomChamp]);
  }

  /**
   * Demande au parent de lancer une recherche.
   */
  onExecuterRecherche(): void {
    this.rechercherEvent.emit();
  }

  /**
   * À la fermeture de la fenêtre de sélection d'un RRSS, on reporte la sélection dans le critère de recherche.
   * @param rrssDTOList liste des RRSS sélectionnés
   */
  onRrssDialogClose(rrssDTOList: RrssDTO[]): void {
    if (CollectionUtils.isNotBlank(rrssDTOList)) {
      this.criteresRecherche.nomRrssAppelant = rrssDTOList[0].rrssNom;

      this.listeRessourceRrss = [];
      rrssDTOList.forEach(rrssDTO => this.listeRessourceRrss.push({
        key: rrssDTO.rrssNom,
        value: rrssDTO.id
      }));
    } else {
      this.listeRessourceRrss = [];
      this.criteresRecherche.nomRrssAppelant = null;
    }
  }

  /**
   * Vide le contenu du champ RRSS lorsque l'utilisateur clique sur la poubelle.
   */
  onViderRrss(): void {
    this.listeRessourceRrss = [];
    this.criteresRecherche.nomRrssAppelant = null;
  }

  /**
   * Retourne true si tous les critères de recherche sont vides.
   */
  public isEmpty(): boolean {
    return !this.criteresRecherche.idRfCatgrAppelant &&
      StringUtils.isBlank(this.criteresRecherche.nomAppelant) &&
      StringUtils.isBlank(this.criteresRecherche.prenomAppelant) &&
      StringUtils.isBlank(this.criteresRecherche.nomRrssAppelant) &&
      StringUtils.isBlank(this.criteresRecherche.telephoneAppelant);
  }

  /**
    * Remet le focus sur le premier critère de recherche.
    */
  public resetFocus(): void {
    this.nomAppelantInputText.focus();
  }

  /**
   * Valide les critères saisis et marque en rouge les critères en erreur. 
   * Retourne true si tout est valide sinon false.
   * @param nbCarMinRecherche nombre de caractères minimum pour qu'un critère en saisie libre soit concidéré valide
   */
  public validerCriteres(nbCarMinRecherche: number): boolean {
    this.isNomValide = true;

    let messages: string[] = [];

    if (this.criteresRecherche.nomAppelant && this.criteresRecherche.nomAppelant.length < nbCarMinRecherche) {
      this.isNomValide = false;
      const nomChamp = this.translateService.instant("sigct.ss.r_appels.sctn_criteres_appelant.nmaplnt");
      messages.push(this.creerMsgErrMinLength(nomChamp));
    }

    if (this.criteresRecherche.prenomAppelant && this.criteresRecherche.prenomAppelant.length < nbCarMinRecherche) {
      this.isPrenomValide = false;
      const nomChamp = this.translateService.instant("sigct.ss.r_appels.sctn_criteres_appelant.prnmaplnt");
      messages.push(this.creerMsgErrMinLength(nomChamp));
    }

    if (this.criteresRecherche.telephoneAppelant && this.criteresRecherche.telephoneAppelant.length < nbCarMinRecherche) {
      this.isTelephoneValide = false;
      const nomChamp = this.translateService.instant("sigct.ss.r_appels.sctn_criteres_appelant.notel");
      messages.push(this.creerMsgErrMinLength(nomChamp));
    }

    if (messages.length > 0) {
      const alertTitle: string = this.translateService.instant("sigct.ss.error.label");
      const alertModel: AlertModel = AlertModelUtils.createAlertModel(messages, alertTitle, AlertType.ERROR)
      this.alertStore.addAlert(alertModel);

      return false;
    }

    return true;
  }

  /**
   * Vide tous les critères de recherche et retrait des champs en rouge. 
   */
  public viderCriteres(): void {
    this.criteresRecherche.idRfCatgrAppelant = null;
    this.criteresRecherche.nomAppelant = null;
    this.criteresRecherche.prenomAppelant = null;
    this.criteresRecherche.telephoneAppelant = null;
    this.criteresRecherche.nomRrssAppelant = null;
    this.listeRessourceRrss = [];
  }

}
