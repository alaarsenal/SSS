import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { InfoAppelCtiDTO } from 'projects/sigct-service-ng-lib/src/lib/models/info-appel-cti-dto';
import { CriteresUsagerDTO } from 'projects/sigct-service-ng-lib/src/lib/models/recherche-fiche-appel-criteres-dto';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import DateUtils from 'projects/sigct-service-ng-lib/src/lib/utils/date-utils';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { SigctDatepickerComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-datepicker/sigct-datepicker.component';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { CtiAideSaisieComponent } from '../cti-aide-saisie/cti-aide-saisie.component';

@Component({
  selector: 'app-recherche-usager-criteres',
  templateUrl: './recherche-usager-criteres.component.html',
  styleUrls: ['./recherche-usager-criteres.component.css']
})
export class RechercheUsagerCriteresComponent implements OnInit {
  readonly MAX_LENGTH_NOM: number = 50;
  readonly MAX_LENGTH_PRENOM: number = 50;

  endDate: string; // Représente la date maximum que l'on peut saisir dans le champ date

  inputTextNomValide: boolean = true;
  inputTextPrenomValide: boolean = true;
  inputTextNoTelValide: boolean = true;
  inputTextNAMValide: boolean = true;
  inputTextCourrielValide: boolean = true;
  inputTextCodePostalValide: boolean = true;
  inputTextMunicipaliteValide: boolean = true;
  inputTextAdressesValide: boolean = true;

  @Input()
  critereRecherche: CriteresUsagerDTO = new CriteresUsagerDTO();
  @Input()
  infoAppelCti: InfoAppelCtiDTO = null;
  @Input()
  critereDoublonPotentielVisible: boolean = true;
  @Input()
  inputOptionDoublonPotentiel: InputOptionCollection;
  @Input()
  inputOptionLangue: InputOptionCollection;
  @Input()
  inputOptionMalentendant: InputOptionCollection;
  @Input()
  inputOptionRegion: InputOptionCollection;
  @Input()
  inputOptionSexe: InputOptionCollection;
  @Input()
  listeGroupeAge: InputOptionCollection;
  @Input()
  inputOptionChampDoublon: InputOptionCollection;
  @Input()
  isRechercheConsultOuTnterv: boolean = false;

  @Output("enterKeydown")
  enterKeydownEvent: EventEmitter<void> = new EventEmitter();

  @ViewChild("dateNaissance", { static: true })
  dateNaissance: SigctDatepickerComponent;

  @ViewChild(CtiAideSaisieComponent)
  ctiAideSaisie: CtiAideSaisieComponent;

  constructor(
    private alertStore: AlertStore,
    private datePipe: DatePipe,
    private translateService: TranslateService) {

  }

  ngOnInit(): void {
    this.endDate = DateUtils.getDateToAAAAMMJJ(new Date());
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
   * Lorsqu'on clique dans un champ on veut qu'il ne soit plus marqué comme invalide
   * @param event 
   */
  private resetErreurChamp(idChamp: string) {
    switch (idChamp) {
      case "nom": {
        this.inputTextNomValide = true;
        break;
      }
      case "prenom": {
        this.inputTextPrenomValide = true;
        break;
      }
      case "numero": {
        this.inputTextNoTelValide = true;
        break;
      }
      case "nam": {
        this.inputTextNAMValide = true;
        break;
      }
      case "moyen": { // courriel
        this.inputTextCourrielValide = true;
        break;
      }
      case "codePostal": {
        this.inputTextCodePostalValide = true;
        break;
      }
      case "mun": {
        this.inputTextMunicipaliteValide = true;
        break;
      }
      case "adr": {
        this.inputTextAdressesValide = true;
        break;
      }
    }
  }

  /**
   * Remet le focus sur le premier bouton d'aide à la saisie si présent ou sur le premier critère (date de naissance).
   */
  resetFocus(): void {
    if (this.ctiAideSaisie) {
      // Tente de mettre le focus sur un bouton de l'aide à la saisie
      if (!this.ctiAideSaisie.resetFocus()){
        // Aucun bouton d'aide à la saisie disponible, alors on met le focus sur la date de naissance.
        this.dateNaissance.focus();
      }
    } else {
      this.dateNaissance.focus();
    }
  }

  getCritereRecherche(): CriteresUsagerDTO {
    if (this.critereRecherche.dateNaissance) {
      let dtAujourdHui = new Date();
      let dtNaissance = new Date(this.critereRecherche.dateNaissance);
      if (dtNaissance.getTime() > dtAujourdHui.getTime()) {
        this.critereRecherche.dateNaissance = null;
      }
    }

    // Si la case malentendant est décochée on considère qu'elle n'est pas renseignée car on veut sélectionner tout le monde
    if (!this.critereRecherche.malentendant) {
      this.critereRecherche.malentendant = null;
    }

    // Si la case doublon potentiel est décochée on considère qu'elle n'est pas renseignée car on veut sélectionner tout le monde
    if (!this.critereRecherche.doublonPotentiel) {
      this.critereRecherche.doublonPotentiel = null;
    }

    return this.critereRecherche;
  }

  onFocus(event: string) {
    this.resetErreurChamp(event);
  }

  onClick(event) {
    this.resetErreurChamp(event.target.id);
  }

  /**
   * Exécute la recherche sur la touche "Entrée"  
   * @param event 
   */
  onKeydown(event) {
    if (event.key === "Enter") {
      this.enterKeydownEvent.emit();
    }
  }

  /**
   * Récupère la valeur retourné par le composant d'aide à la saisie et l'ajoute au critère "nom".
   * @param value valeur à ajouter au critère "nom"
   */
  onNomCtiSelected(value: string): void {
    if (value) {
      if (StringUtils.isEmpty(this.critereRecherche.nom)) {
        this.critereRecherche.nom = value.substring(0, this.MAX_LENGTH_NOM);
      } else {
        const tmp: string = this.critereRecherche.nom + " " + value;
        this.critereRecherche.nom = tmp.substring(0, this.MAX_LENGTH_NOM);
      }
    }
  }

  /**
   * Récupère la valeur retourné par le composant d'aide à la saisie et l'ajoute au critère "prénom".
   * @param value valeur à ajouter au critère "prénom"
   */
  onPrenomCtiSelected(value: string): void {
    if (value) {
      if (StringUtils.isEmpty(this.critereRecherche.prenom)) {
        this.critereRecherche.prenom = value.substring(0, this.MAX_LENGTH_PRENOM);
      } else {
        const tmp: string = this.critereRecherche.prenom + " " + value;
        this.critereRecherche.prenom = tmp.substring(0, this.MAX_LENGTH_PRENOM);
      }
    }
  }

  /**
   * Récupère la valeur retourné par le composant d'aide à la saisie et l'ajoute au critère "téléphone".
   * @param value valeur à ajouter au critère "téléphone"
   */
  onTelephoneCtiSelected(value: string): void {
    if (value) {
      this.critereRecherche.telephone = value;
    }
  }

  /**
   * Toggle pour afficher les champs de la recherche avancée ou de la recherche rapide.
   */
  toggleRechercheAvancee() {
    this.critereRecherche.rechercheAvancee = !this.critereRecherche.rechercheAvancee;
    this.resetFocus();
  }

  /**
   * S'assure que les critères en saisie libres possèdent un minimum de caractères.
   * Les champs ne respectant pas le nombre de caractères minimum sont mis en rouge et false est retourné.
   * @param nbCarMinRecherche nombre de caractères minimum
   */
  validerNbCarMinCriteres(nbCarMinRecherche: number): boolean {
    let messages: string[] = [];
    let nomChamp: string;

    // L'ordre des IF est fonction de la mise en place des critères de recherche
    if (this.critereRecherche.nom && this.critereRecherche.nom.length < nbCarMinRecherche) {
      this.inputTextNomValide = false;
      nomChamp = this.translateService.instant("usager.identification.usager.nom");
      messages.push(this.creerMsgErrMinLength(nomChamp));
    }

    if (this.critereRecherche.prenom && this.critereRecherche.prenom.length < nbCarMinRecherche) {
      this.inputTextPrenomValide = false;
      nomChamp = this.translateService.instant("usager.identification.usager.prenom");
      messages.push(this.creerMsgErrMinLength(nomChamp));
    }

    if (this.critereRecherche.telephone && this.critereRecherche.telephone.length < nbCarMinRecherche) {
      this.inputTextNoTelValide = false;
      nomChamp = this.translateService.instant("usager.label.telephonique");
      messages.push(this.creerMsgErrMinLength(nomChamp));
    }

    if (this.critereRecherche.nam && this.critereRecherche.nam.length < nbCarMinRecherche) {
      this.inputTextNAMValide = false;
      nomChamp = this.translateService.instant("usager.info.supp.nam");
      messages.push(this.creerMsgErrMinLength(nomChamp));
    }

    //courriel
    if (this.critereRecherche.autreMoyenCommunication && this.critereRecherche.autreMoyenCommunication.length < nbCarMinRecherche) {
      this.inputTextCourrielValide = false;
      nomChamp = this.translateService.instant("usager.label.courriel");
      messages.push(this.creerMsgErrMinLength(nomChamp));
    }

    if (this.critereRecherche.codePostal && this.critereRecherche.codePostal.length < nbCarMinRecherche) {
      this.inputTextCodePostalValide = false;
      nomChamp = this.translateService.instant("usager.adresses.codepostal");
      messages.push(this.creerMsgErrMinLength(nomChamp));
    }

    if (this.critereRecherche.municipalite && this.critereRecherche.municipalite.length < nbCarMinRecherche) {
      this.inputTextMunicipaliteValide = false;
      nomChamp = this.translateService.instant("usager.adresses.municipalite");
      messages.push(this.creerMsgErrMinLength(nomChamp));
    }

    if (this.critereRecherche.adresse && this.critereRecherche.adresse.length < nbCarMinRecherche) {
      this.inputTextAdressesValide = false;
      nomChamp = this.translateService.instant("usager.recherche.adresse");
      messages.push(this.creerMsgErrMinLength(nomChamp));
    }

    if (messages.length > 0) {
      const alertTitle: string = this.translateService.instant("sigct.ss.error.label");
      const alertModel: AlertModel = AlertModelUtils.createAlertModel(messages, alertTitle, AlertType.ERROR)
      this.alertStore.addAlert(alertModel);

      // au moins 1 critère vérifié ci-dessus contient un seul caractère on arrête là la vérification
      return false;
    }

    try {
      if (this.critereRecherche.dateNaissance && this.critereRecherche.dateNaissance.toLocaleDateString().length != 10) {
        console.error("dateNaissance.length != 10");
        return false;
      }
    } catch (e) {
      console.error(e);
    }

    return true;
  }

  /**
   * Retourne true si tous les critères de recherche sont vides.
   */
  isEmpty() {
    return !this.critereRecherche.idUsagerIdent &&
      !this.critereRecherche.malentendant &&
      !this.critereRecherche.doublonPotentiel &&
      StringUtils.isBlank(this.critereRecherche.municipalite) &&
      StringUtils.isBlank(this.critereRecherche.adresse) &&
      StringUtils.isBlank(this.critereRecherche.autreMoyenCommunication) && // courriel
      StringUtils.isBlank(this.critereRecherche.codePostal) &&
      !this.critereRecherche.langueCode &&
      StringUtils.isBlank(this.critereRecherche.nam) &&
      StringUtils.isBlank(this.critereRecherche.nom) &&
      StringUtils.isBlank(this.critereRecherche.prenom) &&
      !this.critereRecherche.regionCode &&
      !this.critereRecherche.sexeCode &&
      StringUtils.isBlank(this.critereRecherche.telephone) &&
      !this.critereRecherche.dateNaissance &&
      !this.critereRecherche.idRfGroupeAge;
    CollectionUtils.isBlank(this.critereRecherche.listeChampDoublon);
  }

  /**
   * Vide tous les critères de recherche et retire les erreurs.
   */
  viderCriteres() {
    this.inputTextNomValide = true;
    this.inputTextPrenomValide = true;
    this.inputTextNoTelValide = true;
    this.inputTextNAMValide = true;
    this.inputTextCourrielValide = true;
    this.inputTextCodePostalValide = true;
    this.inputTextMunicipaliteValide = true;
    this.inputTextAdressesValide = true;

    this.critereRecherche.idUsagerIdent = null;
    this.critereRecherche.nam = "";
    this.critereRecherche.dateNaissance = null;
    this.critereRecherche.langueCode = null;
    this.critereRecherche.doublonPotentiel = null;
    this.critereRecherche.malentendant = null;
    this.critereRecherche.nom = null
    this.critereRecherche.prenom = "";
    this.critereRecherche.sexeCode = null;
    this.critereRecherche.regionCode = null;
    this.critereRecherche.codePostal = "";
    this.critereRecherche.adresse = "";
    this.critereRecherche.municipalite = "";
    this.critereRecherche.telephone = "";
    this.critereRecherche.autreMoyenCommunication = ""; // courriel
    this.critereRecherche.idRfGroupeAge = null;
    this.critereRecherche.listeChampDoublon = [];
  }

}
