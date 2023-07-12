import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { FicheAppelDTO } from 'projects/infosante-ng-core/src/lib/models/fiche-appel-dto';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { BindingErrorsStore } from 'projects/sigct-service-ng-lib/src/lib/api-errors';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import { ActionLinkItem } from 'projects/sigct-ui-ng-lib/src/lib/components/action-link/action-link.component';
import { InputTextComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/input-text/input-text.component';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { Subscription } from 'rxjs';
import { MedicationDTO } from '../../../models/medication-dto';


@Component({
  selector: 'app-medication-actuelle',
  templateUrl: './medication-actuelle.component.html',
  styleUrls: ['./medication-actuelle.component.css']
})
export class MedicationActuelleComponent implements OnInit, OnDestroy {

  @ViewChild("medicament", { static: true })
  medicament: InputTextComponent;

  medication: MedicationDTO = new MedicationDTO();
  subscription: Subscription = new Subscription();

  public pertinenceMedication: string = null;

  public actionLinks: ActionLinkItem[];
  public listeMedications: Array<MedicationDTO> = new Array<MedicationDTO>();
  private elementSelectionner: MedicationDTO;
  public listeLabelPertinenceMedication: string[];


  public libelleMessageErreur: string;

  public isPresenceActive: boolean = false;
  public isAbscenceActive: boolean = false;

  public isMedicationValide: boolean = true;
  public isPresenceValide: boolean = true;

  public isAucunActif: boolean = true;

  public isAucunDisabled: boolean = false;
  public isInconnuDisabled: boolean = false;
  public isNonPertinentDisabled: boolean = false;

  public readOnly: string = '';

  public idFiche: number;

  public auMoinsUnPresence: boolean = true;

  idElementSelectionne: number = null;
  public idElementModifieSelectionne: number = null;

  public messageConfirmModif: string = null;
  public messageConfirmSupp: string = null;

  @Input()
  isDisabled = false;

  constructor(
    public alertStore: AlertStore,
    public bindingErrorsStore: BindingErrorsStore,
    private translateService: TranslateService,
    private modalConfirmService: ConfirmationDialogService
  ) {

  }

  @Input("ficheAppel") public ficheAppelPertinence: FicheAppelDTO;


  /**
   * Peuple la liste des medications sauvegardes dans la base de donnees
   */
  @Input("listeMedication")
  public set listeMedication(medicationsDTO: MedicationDTO[]) {

    this.listeMedications = new Array<MedicationDTO>();

    this.isAucunDisabled = false;
    this.isInconnuDisabled = false;
    this.isNonPertinentDisabled = false;
    this.isAucunActif = true;

    medicationsDTO.forEach((medication: MedicationDTO) => {
      if (medication.presence == '1') {
        this.isAucunDisabled = true;
        this.isInconnuDisabled = true;
        this.isNonPertinentDisabled = true;
        this.isAucunActif = false;
      }

      /*Désactive les listes boutons d'options quand il existe une médication absente*/
      this.isInconnuDisabled = true;
      this.isNonPertinentDisabled = true;

    });

    this.listeMedications = medicationsDTO;

    //Tri la liste des médications et la renverse pour apparaitre dans le bon ordre à l'écran
    //Séparation de la liste par présence et absence
    let pre = this.listeMedications.filter(a => a.presence == '1').sort((a, b) => b.medicament.localeCompare(a.medicament));

    let abs = this.listeMedications.filter(a => a.presence == '0').sort((a, b) => b.medicament.localeCompare(a.medicament));

    this.listeMedications = abs.concat(pre).reverse();

    this.reinitialiserMedication();

  }

  @Input("listeLabelPertinenceMedication")
  public set listLabelePertinences(liste: string[]) {
    this.listeLabelPertinenceMedication = liste;
  }



  //Les événements qui sont poussés au parent
  @Output()
  medicationSave: EventEmitter<any> = new EventEmitter();

  @Output()
  medicationDelete: EventEmitter<any> = new EventEmitter();

  @Output()
  pertinenceMedicationSave: EventEmitter<any> = new EventEmitter();



  ngOnInit() {

    //Extraction des libelles statics
    this.subscription.add(
      this.translateService.get(["girpi.error.label", "sigct.sa.f_appel.evaluation.ajousvgrd", "sigct.sa.f_appel.evaluation.action", "sigct.sa.f_appel.evaluation.pre", "sigct.sa.f_appel.evaluation.abs",
        "sigct.sa.f_appel.evaluation.aucunemedication", "sigct.sa.f_appel.evaluation.medinco", "sigct.sa.f_appel.evaluation.medinonperti"]).subscribe((messages: string[]) => {
          this.libelleMessageErreur = messages["girpi.error.label"];
          this.actionLinks = [{ action: this.submitAction, icon: "fa fa-arrow-right fa-2x", label: messages["sigct.sa.f_appel.evaluation.ajousvgrd"] }];
          this.listeLabelPertinenceMedication.push(messages["sigct.sa.f_appel.evaluation.aucunemedication"]);
          this.listeLabelPertinenceMedication.push(messages["sigct.sa.f_appel.evaluation.medinco"]);
          this.listeLabelPertinenceMedication.push(messages["sigct.sa.f_appel.evaluation.medinonperti"]);

        })
    );

    const titre = this.translateService.instant("sigct.sa.f_appel.evaluation.mediactl")
    this.messageConfirmModif = this.translateService.instant("ss-iu-a30004", { 0: titre });
    this.messageConfirmSupp = this.translateService.instant("ss-iu-a30002", { 0: titre });


    let i: number = 1;
    this.listeLabelPertinenceMedication.forEach((option => {
      let infobulle = this.translateService.instant(option);
      if (i == 1) {
        this.inputOptionsAucunMedication.options.push({ label: option, value: '1', description: infobulle });
      }

      if (i == 2) {
        this.inputOptionsMedicationInconnu.options.push({ label: option, value: '2', description: infobulle });
      }

      if (i == 3) {
        this.inputOptionsMedicationNonPertinent.options.push({ label: option, value: '3', description: infobulle });
      }

      i++;

    }));

    //Met dans pertinence la valeur de pertinence depuis la fiche d'appel.
    this.setPertinence();

  }

  //Permet d'extraire la valeur de la pertinence chargée par le formulaire parent.
  //Pour des raisons de concurence, doit être appeler après chaque réinitialisation.
  //Il est préférable d'avoir  la pertinence sous forme de string car la
  //détection des nombres pose des problèmes.
  setPertinence() {

    if (this.isAucunDisabled != true) {
      this.pertinenceMedication = '' + this.ficheAppelPertinence.medication;
    } else {
      this.pertinenceMedication = '';
    }
  }


  //Conteneur pour la liste de valeurs
  public inputOptionsMedications: InputOptionCollection = {
    name: "medications",
    options: []
  };

  public inputOptionsAucunMedication: InputOptionCollection = {
    name: "pertinences",
    options: []
  };

  public inputOptionsMedicationInconnu: InputOptionCollection = {
    name: "pertinences",
    options: []
  };

  public inputOptionsMedicationNonPertinent: InputOptionCollection = {
    name: "pertinences",
    options: []
  };


  @ViewChild("fMed", { static: true })
  form: NgForm;

  @ViewChild("submitBtn", { static: true })
  submitBtn: ElementRef;


  /**
   * vérifie si la médication est vide.  S'il est vide on soumet la page, sinon,
   * afficher une boite de dialogue.
   *
   * @param element
   */
  confirmerModifierMedication(element: any) {
    this.idElementSelectionne = element.id;
    if (this.isMedicationNonVide()) {
      this.openModal('confirm_popup_modif_medication', 'confi_med_btn_oui');
    } else {
      this.remplacerMedication();
    }
  }

  /**
   * Ouvre la boite de dialogue pour confirmer la suppression.
   * @param element
   */
  confirmerSupprimerMedication(element: any) {
    this.idElementSelectionne = element.id;
    this.idElementModifieSelectionne = this.idElementSelectionne;
    this.setElementSelectionner(this.idElementSelectionne);
    let data: MedicationDTO = this.elementSelectionner;
    this.medication.id = data.id;

    this.medicationDelete.emit(this.medication);
  }


  /**
   * Formate les liens d'action selon la présence ou l'absence d'un antécédent.
   * @param medication
   */
  formatActionMedication(medication: MedicationDTO) {
    let mediStr: string;
    mediStr = '<span style="color:black;">';

    //Afficher l'icône
    if (medication.presence == '1') {
      mediStr += '<i id="pre" class="fa fa-check" style="color: green;" ></i>';
    } else {
      mediStr += '<i id="pre" class="fa fa-ban" style="color: red;" ></i>';
    }

    mediStr += " " + medication.medicament + " ";
    mediStr += " ";

    //Noir mais non en gras
    if (medication.details) {
      mediStr += " (<i>" + medication.details + "</i>)</span>";
    }

    return mediStr;

  }

  /**
   * Permet de renseigner les infos de la médication sélectionnée à partir de son id
   * @param id
   */
  setElementSelectionner(id: number) {
    this.listeMedications.forEach(
      (medicationDTO: MedicationDTO) => {
        if (medicationDTO.id == id) {
          this.elementSelectionner = medicationDTO;
        }
      }
    )
  }

  /**
   * Remplace la médication dans le formulaire.
   */
  remplacerMedication() {
    this.isMedicationValide = true;

    this.idElementModifieSelectionne = this.idElementSelectionne;
    this.setElementSelectionner(this.idElementSelectionne);
    let data: MedicationDTO = this.elementSelectionner;
    this.medication.id = data.id;

    this.medication.details = data.details;
    this.medication.presence = data.presence;
    if (this.medication.presence == '1') {
      this.isPresenceActive = true;
      this.isAbscenceActive = false;

    } if (this.medication.presence == '0') {
      this.isAbscenceActive = true;
      this.isPresenceActive = false;
    }
    this.medication.medicament = data.medicament;
    this.medication.actif = data.actif;

    this.closeModal('confirm_popup_modif_medication');
    this.medicament.focus();
  }

  /**
   * fontions generiques pour ouvrir et fermer une fenetre modal popup
   */
  openModal(id: string, btn: string) {
    this.modalConfirmService.openAndFocus(id, btn);
  }

  closeModal(id: string) {
    this.modalConfirmService.close(id);
  }

  onPresenceClick() {
    if (this.isDisabled) {
      return;
    }
    this.isPresenceActive = !this.isPresenceActive;
    if (this.isPresenceActive) {
      this.isAbscenceActive = false;
    }
  }

  onAbsenceClick() {
    if (this.isDisabled) {
      return;
    }
    this.isAbscenceActive = !this.isAbscenceActive;
    if (this.isAbscenceActive) {
      this.isPresenceActive = false;
    }
  }

  onPertinenceChange() {
  }

  setAbsenceStyle(): string {
    if (this.isDisabled) {
      return "color: gray;";
    }
    if (this.isAbscenceActive) {
      return " color: red;";
    } else {
      return "color: gray;";
    }
  }

  setPresenceStyle(): string {
    if (this.isDisabled) {
      return "color: gray;";
    }
    if (this.isPresenceActive) {
      return "color: green;";
    } else {
      return "color: gray;";
    }
  }



  /**
   * fonction generique de soumission du formulaire. simule le clique sur le bouton plus +
   */
  submitAction = () => {
    this.submitBtn.nativeElement.click();
  }



  onSubmit() {
    // this.detecterFicheActive();
    if (this.validerMedication()) {
      this.saveDonnees();
    }
  }

  //Sauvegarder les données
  saveDonnees(): void {
    //Vider les alertes déjà présentes
    if (this.alertStore.state) {
      this.alertStore.setState([]);
    }

    if (this.isPresenceActive) {
      this.medication.presence = '1';
    } else {
      this.medication.presence = '0';
    }

    this.medication.idFicheAppel = this.idFiche;
    this.pertinenceMedicationSave.emit(this.getPertinence());
    this.medicationSave.emit(this.medication);
  }

  //Messages d'erreurs de validation
  creerErreurs(messages: string[], titre: string, erreurType: AlertType) {
    if (CollectionUtils.isNotBlank(messages)) {
      const alertM: AlertModel = new AlertModel();
      alertM.title = titre;
      alertM.type = erreurType;
      alertM.messages = messages;
      if (this.alertStore.state) {
        this.alertStore.setState(this.alertStore.state.concat(alertM));
      } else {
        this.alertStore.setState([alertM]);
      }
    }
  }

  resetChampsValides():void {
    this.isMedicationValide = true;
  }
  /**
   * reinitialiser le formulaire d'edition de la médication
   */
  reinitialiserMedication() {
    this.medication = new MedicationDTO();

    let rad1;
    let rad2;
    let rad3;

    switch (this.ficheAppelPertinence.medication) {
      case 1:
        if (!this.isAucunDisabled) {
          rad1 = '1';
        } else {
          rad1 = null;
          this.ficheAppelPertinence.medication = null;
        }
        rad2 = null;
        rad3 = null;
        break;
      case 2:
        rad1 = null;
        if (!this.isInconnuDisabled) {
          rad2 = '2';
        } else {
          rad2 = null;
          this.ficheAppelPertinence.medication = null;
        }
        rad3 = null;
        break;
      case 3:
        rad1 = null;
        rad2 = null;
        if (!this.isNonPertinentDisabled) {
          rad3 = '3';
        } else {
          rad3 = null;
          this.ficheAppelPertinence.medication = null;
        }
        break;
      default:
        rad1 = null;
        rad2 = null;
        rad3 = null;
        break;

    }

    // Transforme les valeurs par défaut en un objet dont les attributs correspondent aux controls du formulaire à "reseter".
    let valeursParDefaut: any = {
      id: null,
      medicament: null,
      detail: null,
      radioPertinenceMedication1: rad1,
      radioPertinenceMedication2: rad2,
      radioPertinenceMedication3: rad3
    };

    this.isPresenceActive = false;
    this.isAbscenceActive = false;

    // Réinitialise le formulaire avec les valeurs par défaut
    this.form.resetForm(valeursParDefaut);

    this.idElementModifieSelectionne = null;

    this.setPertinence();
    this.isMedicationValide = true;
  }

  //Libère les abonnements
  ngOnDestroy() {
    if (this.subscription) { this.subscription.unsubscribe(); }
  }

  isMedicationNonVide(): boolean {
    if (this.medication.details || this.medication.presence ||
      this.medication.medicament) {
      return true;
    }
    return false;
  }

  /**
   * Lance un message d'erreur si la fiche d'appel n'est pas trouvée.
   */
  detecterFicheActive() {
    let messages: string[] = [];

    if (this.medication.idFicheAppel != null) {
      if (this.medication.idFicheAppel == null) {
        const msg = this.translateService.instant("ss-sv-e00023", { 0: 'this.medication.ficheAppel.id.toString()' });
        messages.push(msg);
        this.creerErreurs(messages, this.libelleMessageErreur, AlertType.ERROR);
      }

    } else {
      //Il n'y a pas de numéro de fiche d'appel actif
      const msg = this.translateService.instant("ss-sv-e00022");
      messages.push(msg);
      this.creerErreurs(messages, this.libelleMessageErreur, AlertType.ERROR);
    }
  }

  validerMedication(): boolean {
    let valide: boolean = true;
    let messages: string[] = [];

    //Vider les alertes déjà présentes
    if (this.alertStore.state) {
      this.alertStore.setState([]);
    }

    //Médicament null ou vide
    if (!this.medication.medicament) {
      const msg = this.translateService.instant("sa-iu-e30000");
      messages.push(msg);
      valide = false;
      this.isMedicationValide = valide;
    }

    //Présence obligatoire
    if (this.isAbscenceActive == false && this.isPresenceActive == false) {
      const msg = this.translateService.instant("sa-iu-e30001");
      messages.push(msg);
      valide = false;
      this.isPresenceValide = valide;
    }
    this.creerErreurs(messages, this.libelleMessageErreur, AlertType.ERROR);
    return valide;
  }

  //Retourne la valeur actuelle de la pertinence
  //la pertinence doit être un string sinon il y a
  //des problèmes de détection.
  getPertinence() {

    return Number(this.pertinenceMedication);

  }

  /**
   * Permet de vérifier s'il y a au moins une medication avec présence dans la liste.  Sinon,
   * notifier à la page parente d'afficher le message de validation finale.
   */
  getValidationFinale() {

    if (this.isAucunDisabled === true && this.isNonPertinentDisabled === true && this.isInconnuDisabled === true) {

      return true;

    } else {

      if (this.pertinenceMedication
        && Number(this.pertinenceMedication) >= 1 && Number(this.pertinenceMedication) <= 3) {
        return true;
      } else {
        return false;
      }


    }
  }

}
