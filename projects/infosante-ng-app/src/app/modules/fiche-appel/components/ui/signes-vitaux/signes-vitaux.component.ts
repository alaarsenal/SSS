import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ReferenceDTO } from 'projects/infosante-ng-core/src/lib/models/reference-dto';
import { ReferencesApiService } from 'projects/infosante-ng-core/src/lib/services/references-api.service';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { BindingErrorsStore } from 'projects/sigct-service-ng-lib/src/lib/api-errors';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import DateUtils from 'projects/sigct-service-ng-lib/src/lib/utils/date-utils';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { Subscription } from 'rxjs';
import { ChampsDatesCommunesDTO } from '../../../models/commun-dto';
import { SigneDTO } from '../../../models/signe-dto';

const MIN_CELSIUS: number = 33.0;
const MAX_CELSIUS: number = 43.0;
const MIN_FAHRENHEIT: number = 92.0;
const MAX_FAHRENHEIT: number = 107.0;
const DEFAULT_OPTION: string = "Sélectionnez...";

@Component({
  selector: 'app-signes-vitaux',
  templateUrl: './signes-vitaux.component.html',
  styleUrls: ['./signes-vitaux.component.css']
})
export class SignesVitauxComponent implements OnInit {

  private subscriptions: Subscription = new Subscription();

  signe: SigneDTO = new SigneDTO();
  selectedSigneDTO: SigneDTO;

  /** Indentifiant de l'élément sélectionné dans le ListInfoAction qui est en cours de modification */
  idElementSelectionneEnCoursModif: number = null;
  /** Identifiant de l'élément sélectionné dans le ListInfoAction en atente de confirmation */
  idElementSelectionneEnAttenteConfirmation: number = null;

  isChampCommunHeureValide: boolean = true;
  isTemperatureValeurValide: boolean = true;
  isReferenceTemperatureValide: boolean = true;
  isTensionArterielleMinValide: boolean = true;
  isTensionArterielleMaxValide: boolean = true;
  isSaturationTauxValide: boolean = true;
  isSaturationPrecisionValide: boolean = true;
  isGlasgowValide: boolean = true;

  messageConfirmerAjouter: string;
  messageConfirmerModifier: string;
  messageConfirmerSupprimer: string;

  listeSignes: Array<SigneDTO> = new Array<SigneDTO>();

  // Liste de valeurs pour les voies de température.
  inputOptionsTemperatureVoies: InputOptionCollection = {
    name: "voies",
    options: []
  };

  private referencesTempreatureVoies: ReferenceDTO[];

  // Liste de valeurs pour les staturations
  inputOptionsSaturationPrecision: InputOptionCollection = {
    name: "staturations",
    options: []
  };

  @ViewChild("formSigneVitaux", { static: true })
  formulaireSigneVitaux: NgForm;

  /**
   * Peuple la liste des manifestations sauvegardes dans la base de donnees
   */
  @Input("listeSignesVitaux")
  public set listeSignesVitaux(signeDtos: SigneDTO[]) {
    this.listeSignes = [];
    if (signeDtos) {
      signeDtos.filter(signeDTO => signeDTO.dateDemandeEvaluation && typeof signeDTO.dateDemandeEvaluation == 'string')
        .forEach(signeDTO => {
          const date: string = signeDTO.dateDemandeEvaluation + ' 00:00:00.0'
          signeDTO.dateDemandeEvaluation = new Date(date);
        })
    }
    this.listeSignes = signeDtos;
    this.reinitialiserSignesVitaux();
  }

  // Notifie le parent que le signe vital doit être sauvegardé.
  @Output()
  sauvegarderSigne: EventEmitter<SigneDTO> = new EventEmitter();

  // Notifie le parent que le signe vital doit être supprimé.
  @Output()
  supprimerSigne: EventEmitter<number> = new EventEmitter();

  // Notifier le parent que l'on veut modifier la date et l'heure commune.
  @Output()
  modifierDateHeuresDetail: EventEmitter<ChampsDatesCommunesDTO> = new EventEmitter();

  infoBullTemperatureVoie: string = DEFAULT_OPTION;

  @Output()
  isDisabled = false;

  constructor(
    public alertStore: AlertStore,
    public bindingErrorsStore: BindingErrorsStore,
    private translateService: TranslateService,
    private modalConfirmService: ConfirmationDialogService,
    private referencesService: ReferencesApiService) {
  }

  ngOnInit() {
    this.signe = new SigneDTO();

    // if (this.champsDatesCommunesDto) {
    //   this.signe.dateDemandeEvaluation = this.champsDatesCommunesDto.dateCommune;
    //   this.signe.detailDemandeEvaluation = this.champsDatesCommunesDto.detailsCommun;
    //   this.signe.heures = this.champsDatesCommunesDto.heureCommune;
    // }

    this.initListeTemperatureVoie();
    this.initListeSaturationPrecision();

    const titre: string = this.translateService.instant('sigct.sa.f_appel.evaluation.signes.titresection');
    //{0} : les informations saisies seront perdues. Désirez-vous continuer?
    this.messageConfirmerModifier = this.translateService.instant('ss-iu-a30004', { 0: titre });
    // {0} : vous allez supprimer cette information. Désirez-vous continuer?
    this.messageConfirmerSupprimer = this.translateService.instant('ss-iu-a30002', { 0: titre });

    this.listenToBindingErrorStore();
  }

  private listenToBindingErrorStore() {
    this.subscriptions.add(
      this.bindingErrorsStore.state$.subscribe(errors => {
        if (errors) {
          if (errors['temperatureValeur']) {
            this.isTemperatureValeurValide = false;
          }
          if (errors['referenceTemperatureVoieId']) {
            this.isReferenceTemperatureValide = false;
          }
          if (errors['tensionArterielleMax']) {
            this.isTensionArterielleMaxValide = false;
          }
          if (errors['tensionArterielleMin']) {
            this.isTensionArterielleMinValide = false;
          }
          if (errors['saturationTaux']) {
            this.isSaturationTauxValide = false;
          }
          if (errors['saturationPrecision']) {
            this.isSaturationPrecisionValide = false;
          }
        }
      })
    );
  }

  /**
   * Alimente la liste des vois de température avec les référence provenant de la BD.
   */
  private initListeTemperatureVoie(): void {
    this.inputOptionsTemperatureVoies.options = [];

    const lblSelectionnezValeur: string = this.translateService.instant('option.select.message');
    this.inputOptionsTemperatureVoies.options.push({ label: lblSelectionnezValeur, value: null });

    this.subscriptions.add(
      this.referencesService.getListeTemperatureVoie().subscribe((result: ReferenceDTO[]) => {
        if (result) {
          this.referencesTempreatureVoies = result;
          result.forEach(item => {
            this.inputOptionsTemperatureVoies.options.push({ label: item.nom, value: '' + item.id });
          })
        };
      })
    );
  }

  /**
   * Alimente la liste des saturations avec les libellés provenant de fichier de libellés.
   */
  private initListeSaturationPrecision() {
    this.inputOptionsSaturationPrecision.options = [];

    this.subscriptions.add(
      this.translateService.get(["sigct.sa.f_appel.evaluation.signes.aa", "sigct.sa.f_appel.evaluation.signes.ibaa", "sigct.sa.f_appel.evaluation.signes.o2", "sigct.sa.f_appel.evaluation.signes.ibo2"]).subscribe((messages: string[]) => {
        this.inputOptionsSaturationPrecision.options.push({ label: messages["sigct.sa.f_appel.evaluation.signes.aa"], value: messages["sigct.sa.f_appel.evaluation.signes.aa"], description: messages["sigct.sa.f_appel.evaluation.signes.ibaa"] });
        this.inputOptionsSaturationPrecision.options.push({ label: messages["sigct.sa.f_appel.evaluation.signes.o2"], value: messages["sigct.sa.f_appel.evaluation.signes.o2"], description: messages["sigct.sa.f_appel.evaluation.signes.ibo2"] });
      })
    );
  }

  /**
   * Formate les éléments de la liste selon les exigences fonctionnelles.
   * @param signeDto
   */
  formaterListInfoActionSigne(signeDto: SigneDTO): string {
    if (!signeDto) {
      return "";
    }
    let html: string;

    html = '<div style="color:black;" >';

    if (signeDto.dateDemandeEvaluation) {

      let datePipe = new DatePipe("fr-ca");
      html += datePipe.transform(signeDto.dateDemandeEvaluation, 'yyyy-MM-dd') + ' ';

      if (signeDto.heures) {
        html += signeDto.heures.substr(0, 2);
        html += ':';
        html += signeDto.heures.substr(2, 2) + ' ';
      }
    }

    if (signeDto.detailDemandeEvaluation) {
      html += " (<span style='font-style:italic;'>" + signeDto.detailDemandeEvaluation + "</span>) ";
    }

    // Glycémie
    if (signeDto.glycemie) {
      html += "Glycémie " + signeDto.glycemie + "mmol/L, ";
    }

    // Température
    if (signeDto.temperatureValeur) {
      html += "Temp. " + signeDto.temperatureValeur.toString().replace(".", ",");

      if (signeDto.temperatureUniteMesure) {
        html += "°" + signeDto.temperatureUniteMesure + " ";
      }
      html += signeDto.temperatureConvertie + " " + signeDto.referenceTemperatureVoieNom + ", ";
    }

    // Tension artérielle (TA)
    if (signeDto.tensionArterielleMin) {
      html += "TA " + signeDto.tensionArterielleMin + "/" + signeDto.tensionArterielleMax + ", ";
    }

    // Fréquence cardiaque
    if (signeDto.frequenceCardiaque) {
      html += "FC " + signeDto.frequenceCardiaque + ", ";
    }

    // Fréquence respiratoire
    if (signeDto.frequenceRespiratoire) {
      html += "FR " + signeDto.frequenceRespiratoire + ", ";
    }

    // Saturation
    if (signeDto.saturationTaux) {
      html += "Sat " + signeDto.saturationTaux + "% " +
        signeDto.saturationPrecision + ", ";
    }

    // Glasgow
    if (signeDto.glasgow) {
      html += "Glasgow " + signeDto.glasgow + ", ";
    }

    // Retire la virgule à la fin si présente.
    if (html.endsWith(", ")) {
      html = html.substr(0, html.length - 2);
    }

    // Détails
    if (signeDto.details) {
      html += " <br/>(<span style='font-style:italic;'>" + signeDto.details + "</span>)";
    }

    html += "</div>";

    return html;
  }

  /**
   * Récupère un signe dans la liste des signes viteaux.
   * @param idSigne identifiant du signe vital
   */
  private getSigneFromListe(idSigne: number): SigneDTO {
    let found: SigneDTO = null;
    this.listeSignes.forEach((signeDto: SigneDTO) => {
      if (signeDto.id == idSigne) {
        found = signeDto;
      }
    });
    return found;
  }

  private isEmptyCommFieldsAndSigne(): boolean {
   return !this.signe;
  }

  private isEmptySigne(): boolean {
    return !this.signe.details
    && !this.signe.frequenceCardiaque
    && !this.signe.frequenceRespiratoire
    && !this.signe.glasgow
    && !this.signe.glycemie
    && !this.signe.referenceTemperatureVoieId
    && !this.signe.saturationPrecision
    && !this.signe.saturationTaux
    && !this.signe.temperatureValeur
    && !this.signe.tensionArterielleMin
    && !this.signe.tensionArterielleMax;
  }

  /**
   * Vérifie si tous les champs du formulaire sont vides.
   */
  isFormulaireVide(signeDto: SigneDTO): boolean {

    return !this.signe
      || (this.isChampCommunEmptyOrIdentic(signeDto)
        && !this.signe.details
        && !this.signe.frequenceCardiaque
        && !this.signe.frequenceRespiratoire
        && !this.signe.glasgow
        && !this.signe.glycemie
        && !this.signe.referenceTemperatureVoieId
        && !this.signe.saturationPrecision
        && !this.signe.saturationTaux
        && !this.signe.temperatureValeur
        && !this.signe.tensionArterielleMin
        && !this.signe.tensionArterielleMax);
  }

  private isChampCommunEmptyOrIdentic(signeDto: SigneDTO): boolean {
    if (!this.signe
      || !signeDto
      || (!this.signe.dateDemandeEvaluation
        && !this.signe.heures
        && !this.signe.detailDemandeEvaluation)
      || (!signeDto.dateDemandeEvaluation
        && !signeDto.heures
        && !signeDto.detailDemandeEvaluation)) {
      return true;
    }
    if (this.signe && signeDto) {
      const thisDate: string = DateUtils.getDateToAAAAMMJJ(this.signe.dateDemandeEvaluation);
      const date: string = DateUtils.getDateToAAAAMMJJ(signeDto.dateDemandeEvaluation);
      let horaDateDetail: boolean =  thisDate == date
        && this.signe.heures == signeDto.heures
        && this.signe.detailDemandeEvaluation == signeDto.detailDemandeEvaluation;
        return horaDateDetail;
    }
  }

  /**
   * Lorsque l'utilisateur désire modifier un signe (clic sur flèche gauche de msss-list-info-action).
   * @param element
   */
  onActionModifier(element: any) {
    this.selectedSigneDTO = this.getSigneFromListe(element.id);

    let isEmptyCommFieldsAndSigne: boolean = this.isEmptyCommFieldsAndSigne();
    let isChampCommunEmptyOrIdentic: boolean = this.isChampCommunEmptyOrIdentic(this.selectedSigneDTO);
    let isEmptySigne: boolean = this.isEmptySigne();

    let isFormulaireVide:boolean = isEmptyCommFieldsAndSigne || (isChampCommunEmptyOrIdentic && isEmptySigne);

    if (isFormulaireVide) {
      this.remplacerSigneVital(this.selectedSigneDTO);
    } else {
      let titre: string;
      this.idElementSelectionneEnAttenteConfirmation = element.id;
      if(!isEmptyCommFieldsAndSigne) {
        if(!isEmptySigne) {
          titre = this.translateService.instant('sigct.sa.f_appel.evaluation.signes.titresection');
        } else if(!isChampCommunEmptyOrIdentic) {
          titre = this.translateService.instant('sigct.sa.f_appel.evaluation.horadate');
        }
        this.messageConfirmerModifier = this.translateService.instant('ss-iu-a30004', { 0: titre });
      }

      this.modalConfirmService.openAndFocus("confirm-popup-modifier-signe", "btn-ok-modifier-signe");
    }
  }

  /**
   * Lorsque l'utilisateur désire supprimer un signe (clic sur poubelle de msss-list-info-action).
   * @param element element à supprimer
   */
  onActionSupprimer(element: any) {
    this.idElementSelectionneEnAttenteConfirmation = element.id;

    this.supprimerSigne.emit(this.idElementSelectionneEnAttenteConfirmation);
  }

  /**
   * Lorsque l'utilisateur confirme la modification d'un signe (clic sur le bouton Ok du popup).
   */
  onConfirmerModifier(): void {
    this.remplacerSigneVital(this.selectedSigneDTO);

    this.modalConfirmService.close("confirm-popup-modifier-signe");
  }



  /**
   * À la soumission du formulaire (clique sur flèche bleue).
   */
  onSubmitSigneVitauxForm() {
    this.sauvegarderSigne.emit(this.validerSigne() ? this.signe : null);
  }

  public reinitialiserSignesVitaux(): void {
    this.signe = new SigneDTO();
    this.idElementSelectionneEnAttenteConfirmation = null;
    this.idElementSelectionneEnCoursModif = null;
    this.formulaireSigneVitaux.resetForm(this.signe);
    this.resetChampsValides();
  }

  resetChampsValides():void {
    this.isChampCommunHeureValide = true;
    this.isReferenceTemperatureValide = true;
    this.isTensionArterielleMinValide = true;
    this.isTensionArterielleMaxValide = true;
    this.isSaturationPrecisionValide = true;
    this.isGlasgowValide = true;
  }

  /**
   * Remplace le signe vital dans le formulaire.
   */
  remplacerSigneVital(signeDTO: SigneDTO) {
    this.idElementSelectionneEnAttenteConfirmation = null;

    // Highlight l'élément dans la liste
    this.idElementSelectionneEnCoursModif = signeDTO.id;

    this.signe.dateDemandeEvaluation = signeDTO.dateDemandeEvaluation;
    this.signe.detailDemandeEvaluation = signeDTO.detailDemandeEvaluation;
    this.signe.details = signeDTO.details;
    this.signe.ficheAppelId = signeDTO.ficheAppelId;
    this.signe.frequenceCardiaque = signeDTO.frequenceCardiaque;
    this.signe.frequenceRespiratoire = signeDTO.frequenceRespiratoire;
    this.signe.glasgow = signeDTO.glasgow;
    this.signe.glycemie = signeDTO.glycemie;
    this.signe.heures = signeDTO.heures;
    this.signe.id = signeDTO.id;
    this.signe.referenceTemperatureVoieId = signeDTO.referenceTemperatureVoieId;
    this.signe.saturationPrecision = signeDTO.saturationPrecision;
    this.signe.saturationTaux = signeDTO.saturationTaux;
    this.signe.temperatureUniteMesure = signeDTO.temperatureUniteMesure;
    this.signe.temperatureValeur = signeDTO.temperatureValeur;
    this.signe.temperatureConvertie = signeDTO.temperatureConvertie;
    this.signe.tensionArterielleMax = signeDTO.tensionArterielleMax;
    this.signe.tensionArterielleMin = signeDTO.tensionArterielleMin;

    let champsDateCommunes: ChampsDatesCommunesDTO = new ChampsDatesCommunesDTO();
    champsDateCommunes.dateCommune = this.signe.dateDemandeEvaluation;
    champsDateCommunes.detailsCommun = this.signe.detailDemandeEvaluation;
    champsDateCommunes.heureCommune = this.signe.heures;

    // Notifie le parent qu'il doit changer la date, l'heure et le détail communs avec ceux-ci.
    this.modifierDateHeuresDetail.emit(champsDateCommunes);
  }

  /**
   * Valide un signe vital et affiche les messages d'erreur.
   */
  public validerSigne(): boolean {

    const alertTitle: string = this.translateService.instant("sigct.sa.error.label");
    let messages: string[] = [];
    this.alertStore.resetAlert();

    this.isChampCommunHeureValide = true;
    this.isTemperatureValeurValide = true;
    this.isReferenceTemperatureValide = true;
    this.isTensionArterielleMinValide = true;
    this.isTensionArterielleMaxValide = true;
    this.isSaturationTauxValide = true;
    this.isSaturationPrecisionValide = true;
    this.isGlasgowValide = true;

    if (this.signe && this.signe.temperatureValeur) {
      this.onChangeInputTemperature();
    }

    // Il est obligatoire de saisir un élément composant un signe vital.
    if (!this.signe.frequenceCardiaque &&
      !this.signe.frequenceRespiratoire &&
      !this.signe.glasgow &&
      !this.signe.glycemie &&
      !this.signe.referenceTemperatureVoieId &&
      !this.signe.saturationPrecision &&
      !this.signe.saturationTaux &&
      !this.signe.temperatureValeur &&
      !this.signe.tensionArterielleMin &&
      !this.signe.tensionArterielleMax) {

      messages.push(this.translateService.instant("sa-sv-e60000"));
      const alertModel: AlertModel = AlertModelUtils.createAlertModel(messages, alertTitle, AlertType.ERROR);
      this.alertStore.addAlert(alertModel);
      return false;
    }
    // Heure : une heure a été indiquée sans date.
    if (!this.signe.dateDemandeEvaluation && this.signe.heures) {
      messages.push(this.translateService.instant("sa-iu-e00016"));
      this.isChampCommunHeureValide = false;
    }
    //Temperature valeur/voie
    if (this.signe.temperatureValeur && !this.signe.referenceTemperatureVoieId) {
      const libelle: string = this.translateService.instant("sigct.sa.f_appel.evaluation.signes.voie");
      messages.push(this.translateService.instant("general.msg.obligatoire", { 0: libelle }));
      this.isReferenceTemperatureValide = false;
    } else if (!this.signe.temperatureValeur && this.signe.referenceTemperatureVoieId) {
      const libelle: string = this.translateService.instant("sigct.sa.f_appel.evaluation.signes.ibtemperature");
      messages.push(this.translateService.instant("general.msg.obligatoire", { 0: libelle }));
      this.isTemperatureValeurValide = false;
    }
    //Tension Arterielle Min/Max
    if (this.signe.tensionArterielleMin && !this.signe.tensionArterielleMax) {
      const libelle: string = this.translateService.instant("sigct.sa.f_appel.evaluation.signes.ibtensionart");
      messages.push(this.translateService.instant("general.msg.obligatoire", { 0: libelle }));
      this.isTensionArterielleMaxValide = false;
    } else if (this.signe.tensionArterielleMax && !this.signe.tensionArterielleMin) {
      const libelle: string = this.translateService.instant("sigct.sa.f_appel.evaluation.signes.ibtensionart");
      messages.push(this.translateService.instant("general.msg.obligatoire", { 0: libelle }));
      this.isTensionArterielleMinValide = false;
    }
    //Saturation %/précision
    if (this.signe.saturationTaux && !this.signe.saturationPrecision) {
      const libelle: string = this.inputOptionsSaturationPrecision.options[0].label + " ou " + this.inputOptionsSaturationPrecision.options[1].label;
      messages.push(this.translateService.instant("general.msg.obligatoire", { 0: libelle }));
      this.isSaturationPrecisionValide = false;
    } else if (!this.signe.saturationTaux && this.signe.saturationPrecision) {
      const libelle: string = this.translateService.instant("sigct.sa.f_appel.evaluation.signes.ibtauxsaturation");
      messages.push(this.translateService.instant("general.msg.obligatoire", { 0: libelle }));
      this.isSaturationTauxValide = false;
    }
    // Glasgow
    if (this.signe.glasgow && (this.signe.glasgow < 1 || this.signe.glasgow > 15)) {
      messages.push(this.translateService.instant("sa-sv-e60001"));
      this.isGlasgowValide = false;
    }

    if (messages?.length > 0) {
      const alertModel: AlertModel = AlertModelUtils.createAlertModel(messages, alertTitle, AlertType.ERROR);
      this.alertStore.addAlert(alertModel);
      return false;
    } else {
      return true;
    }
  }

  onChangeChampCommun(champsCommun: ChampsDatesCommunesDTO): void {
    if (champsCommun) {
      this.signe.dateDemandeEvaluation = champsCommun.dateCommune;
      this.signe.heures = champsCommun.heureCommune;
      this.signe.detailDemandeEvaluation = champsCommun.detailsCommun;
    }
  }

  onChangeTemperatureVoie(): void {
    this.infoBullTemperatureVoie = DEFAULT_OPTION;
    if (this.signe.referenceTemperatureVoieId && this.referencesTempreatureVoies) {
      this.referencesTempreatureVoies.forEach(ref => {
        if (ref.id == this.signe.referenceTemperatureVoieId) {
          this.infoBullTemperatureVoie = ref.description ? ref.description : ref.nom;
        }
      });
    }
  }

  onChangeInputGlycemie(): void {
    if (this.signe.glycemie) {
      this.signe.glycemie = this.signe.glycemie.toString().replace(",", ".");
    }
  }

  onChangeInputTemperature(): void {
    // Le nombre température doit avoir une virgule au lieu d'un point.
    if (this.signe.temperatureValeurStr) {
      const temperatureValeur: string = this.signe.temperatureValeurStr.toString().replace(",", ".");
      let regex = /^\d{1,3}(\.\d{1,1})?$/;
      if (regex.test(temperatureValeur)) {
        let convertTemperature= this.convertTemperature(temperatureValeur);
        this.signe.temperatureValeurStr = convertTemperature.toString().replace(".", ",");
        this.signe.temperatureValeur = convertTemperature;
      } else {
        this.resetTemperature();
      }
    } else {
      this.resetTemperature();
    }
  }

  onChangeInputGlasgow(): void {
    if (this.signe.glasgow
      && (this.signe.glasgow < 1
        || this.signe.glasgow > 15)) {
      this.signe.glasgow = null;
    }
  }

  private resetTemperature() {
    this.signe.temperatureValeur = null;
    this.signe.temperatureConvertie = null;
    this.signe.temperatureUniteMesure = null;
  }

  private convertTemperature(temperature: string): number {
    if (!StringUtils.isBlank(temperature)) {
      const aux: number = parseFloat(temperature);
      if (aux >= MIN_CELSIUS && aux <= MAX_CELSIUS) {
        this.signe.temperatureConvertie = "(" + (Math.round((aux * 1.8 + 32) * 10) / 10) + "°F)";
        this.signe.temperatureUniteMesure = "C";
        this.signe.infoBullTemperatureUniteMesure = "sigct.sa.f_appel.evaluation.signes.ibcelsius";
        return aux;
      }
      if (aux >= MIN_FAHRENHEIT && aux <= MAX_FAHRENHEIT) {
        this.signe.temperatureConvertie = "(" + (Math.round(((aux - 32) / 1.8) * 10) / 10) + "°C)";
        this.signe.temperatureUniteMesure = "F";
        this.signe.infoBullTemperatureUniteMesure = "sigct.sa.f_appel.evaluation.signes.ibfahrenheit";
        return aux;
      }
    }
    this.signe.temperatureConvertie = null;
    this.signe.temperatureUniteMesure = null;
    return null;
  }

}
