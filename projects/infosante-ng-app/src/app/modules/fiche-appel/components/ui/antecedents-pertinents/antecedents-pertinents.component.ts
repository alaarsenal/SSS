import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { FicheAppelDTO } from 'projects/infosante-ng-core/src/lib/models/fiche-appel-dto';
import { ReferencesApiService } from 'projects/infosante-ng-core/src/lib/services/references-api.service';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { BindingErrorsStore } from 'projects/sigct-service-ng-lib/src/lib/api-errors';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import { ActionLinkItem } from 'projects/sigct-ui-ng-lib/src/lib/components/action-link/action-link.component';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { SigctChosenComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-chosen/sigct-chosen.component';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { ReferenceDTO } from 'projects/usager-ng-core/src/lib/models';
import { Subscription } from 'rxjs';
import { AntecedentDTO } from '../../../models/antecedent-dto';
import { ReferenceSaisibleEnPopupDTO } from '../../../models/reference-saisible-en-popup-dto';
import { SaisirParSystemePopupDataDTO } from '../../../models/saisir-par-systeme-popup-data-dto';
import { SaisirReferencePopupLauncher } from '../saisir-reference-popup/saisir-reference-popup-launcher';


@Component({
  selector: 'app-antecedents-pertinents',
  templateUrl: './antecedents-pertinents.component.html',
  styleUrls: ['./antecedents-pertinents.component.css'],
})
export class AntecedentsPertinentsComponent implements OnInit, OnDestroy {

  antecedent: AntecedentDTO = new AntecedentDTO();
  subscription: Subscription = new Subscription();
  abonnementAntecedents: Subscription;

  public pertinence: string = null;

  public actionLinks: ActionLinkItem[];
  public listeAntecedents: Array<AntecedentDTO> = new Array<AntecedentDTO>();
  private elementSelectionner: AntecedentDTO;
  public listeLabelPertinenceAntecedent: string[] = [];


  public libelleMessageErreur: string;

  public isPresenceActive: boolean = false;
  public isAbscenceActive: boolean = false;

  public isAntecedentValide: boolean = true;
  public isPresenceValide: boolean = true;

  public isAucunActif: boolean = true;

  public isAucunDisabled: boolean = false;
  public isInconnuDisabled: boolean = false;
  public isNonPertinentDisabled: boolean = false;

  public infoBulleAntecedent: string
  private listeAntecedentsDesc: Array<ReferenceDTO> = new Array<ReferenceDTO>();
  public valeurLibelleSelectionnez: string;

  public readOnly: string = '';

  public idFiche: number;

  public auMoinsUnPresence: boolean = true;

  idElementSelectionne: number = null;
  public idElementModifieSelectionne: number = null;
  messageSupprimerAntecedent: any;
  messageConfirmerAntecedent: any;

  @Input()
  isDisabled = false;

  constructor(
    public alertStore: AlertStore,
    public bindingErrorsStore: BindingErrorsStore,
    private translateService: TranslateService,
    private modalConfirmService: ConfirmationDialogService,
    private referencesService: ReferencesApiService,
    private dialog: MatDialog
  ) {

  }

  @Input("ficheAppel") public ficheAppelPertinence: FicheAppelDTO;


  /**
   * Peuple la liste des antecedents sauvegardes dans la base de donnees
   */
  @Input("listeAntecedent")
  public set listeAntecedent(antecedentsDTO: AntecedentDTO[]) {

    this.listeAntecedents = new Array<AntecedentDTO>();

    this.isAucunDisabled = false;
    this.isInconnuDisabled = false;
    this.isNonPertinentDisabled = false;
    this.isAucunActif = true;

    antecedentsDTO.forEach((antecedent: AntecedentDTO) => {
      if (antecedent.presence == '1') {
        this.isAucunDisabled = true;
        this.isInconnuDisabled = true;
        this.isNonPertinentDisabled = true;
        this.isAucunActif = false;
      }

      /*Désactive les listes boutons d'options quand il existe une médication absente*/
      this.isInconnuDisabled = true;
      this.isNonPertinentDisabled = true;

    });

    this.listeAntecedents = antecedentsDTO;

    //Tri la liste des médications et la renverse pour apparaitre dans le bon ordre à l'écran
    //Séparation de la liste par présence et absence
    let pre = this.listeAntecedents.filter(a => a.presence == '1').sort((a, b) => b.antecedent.localeCompare(a.antecedent));

    let abs = this.listeAntecedents.filter(a => a.presence == '0').sort((a, b) => b.antecedent.localeCompare(a.antecedent));

    this.listeAntecedents = abs.concat(pre).reverse();

    this.reinitialiserAntecedent();

  }



  //Les événements qui sont poussés au parent
  @Output()
  antecedentSave: EventEmitter<any> = new EventEmitter();

  @Output()
  antecedentDelete: EventEmitter<any> = new EventEmitter();

  @Output()
  pertinenceSave: EventEmitter<any> = new EventEmitter();

  ngOnInit() {

    this.subscription.add(
      this.translateService.get(["sigct.sa.error.label", "sigct.sa.f_appel.evaluation.aucunante", "sigct.sa.f_appel.evaluation.anteincon",
        "sigct.sa.f_appel.evaluation.nonperti", "sigct.sa.f_appel.evaluation.ajousvgrd", "sigct.sa.f_appel.evaluation.action", "sigct.sa.f_appel.evaluation.pre", "sigct.sa.f_appel.evaluation.abs", "girpi.label.selectionnez"]).subscribe((messages: string[]) => {
          this.libelleMessageErreur = messages["sigct.sa.error.label"];
          this.actionLinks = [{ action: this.submitAction, icon: "fa fa-arrow-right fa-2x", label: messages["sigct.sa.f_appel.evaluation.ajousvgrd"] }];

          this.listeLabelPertinenceAntecedent.push(messages["sigct.sa.f_appel.evaluation.aucunante"]);
          this.listeLabelPertinenceAntecedent.push(messages["sigct.sa.f_appel.evaluation.anteincon"]);
          this.listeLabelPertinenceAntecedent.push(messages["sigct.sa.f_appel.evaluation.nonperti"]);
          this.valeurLibelleSelectionnez = messages["girpi.label.selectionnez"];

        })

    );

    // Alimente la liste des antécédents.

    this.inputOptionsAntecedents.options.push({ label: this.valeurLibelleSelectionnez, value: null });


    if (this.abonnementAntecedents == null) {
      this.abonnementAntecedents = this.referencesService.getListeAntecedent().subscribe((result: ReferenceDTO[]) => {
        if (result) {
          result.forEach(item => {
            this.listeAntecedentsDesc.push(item);
            this.inputOptionsAntecedents.options.push({ label: item.nom, value: '' + item.id, description: item.description });
          })
        };
      });
    }

    let i: number = 1;
    this.listeLabelPertinenceAntecedent.forEach((option => {
      let infobulle = this.translateService.instant(option);

      if (i == 1) {
        this.inputOptionsAucunAntecedent.options.push({ label: option, value: '1', description: infobulle });
      }

      if (i == 2) {
        this.inputOptionsAntecedentInconnu.options.push({ label: option, value: '2', description: infobulle });
      }

      if (i == 3) {
        this.inputOptionsAntecedentNonPertinent.options.push({ label: option, value: '3', description: infobulle });
      }

      i++;

    }));

    let titre: string;
    titre = this.translateService.instant('sigct.sa.f_appel.evaluation.anteperti');
    this.messageSupprimerAntecedent = this.translateService.instant('sa-iu-a00001', { 0: titre });

    this.messageConfirmerAntecedent = this.translateService.instant('ss-iu-a30004', { 0: titre });

    //Met dans pertinence la valeur de pertinence depuis la fiche d'appel.
    this.setPertinence();
  }

  //Permet d'extraire la valeur de la pertinence chargée par le formulaire parent.
  //Pour des raisons de concurence, doit être appeler après chaque réinitialisation.
  //Il est préférable d'avoir  la pertinence sous forme de string car la
  //détection des nombres pose des problèmes.
  setPertinence() {

    if (this.isAucunDisabled != true) {
      this.pertinence = '' + this.ficheAppelPertinence.antecedent;
    } else {
      this.pertinence = '';
    }
  }


  //Conteneur pour la liste de valeurs
  public inputOptionsAntecedents: InputOptionCollection = {
    name: "antecedents",
    options: []
  };

  public inputOptionsAucunAntecedent: InputOptionCollection = {
    name: "pertinences",
    options: []
  };

  public inputOptionsAntecedentInconnu: InputOptionCollection = {
    name: "pertinences",
    options: []
  };

  public inputOptionsAntecedentNonPertinent: InputOptionCollection = {
    name: "pertinences",
    options: []
  };


  @ViewChild("fCom", { static: true })
  form: NgForm;

  @ViewChild("submitBtn", { static: true })
  submitBtn: ElementRef;

  @ViewChild("listeAntecedentHTML", { static: true }) private listeAntecdent: SigctChosenComponent;

  resetChampsValides(): void {
    this.isAntecedentValide = true;
  }

  /**
   * vérifie si la médication est vide.  S'il est vide on soumet la page, sinon,
   * afficher une boite de dialogue.
   *
   * @param element
   */
  confirmerModifierAntecedent(element: any) {
    this.idElementSelectionne = element.id;
    if (this.isAntecedentNonVide()) {
      this.openModal('confirm_popup_modif_antecedent', 'confi_ant_btn_oui');
    } else {
      this.remplacerAntecedent();
    }
  }

  /**
   * Ouvre la boite de dialogue pour confirmer la suppression.
   * @param element
   */
  confirmerSupprimerAntecedent(element: any) {
    this.idElementSelectionne = element.id;
    this.idElementModifieSelectionne = this.idElementSelectionne;
    this.setElementSelectionner(this.idElementSelectionne);
    let data: AntecedentDTO = this.elementSelectionner;
    this.antecedent.id = data.id;

    this.antecedentDelete.emit(this.antecedent);
  }


  /**
   * Formate les liens d'action selon la présence ou l'absence d'un antécédent.
   * @param antecedent
   */
  formatActionAntecedent(antecedent: AntecedentDTO) {
    let anteStr: string;
    anteStr = '<span style="color:black;">';

    //Afficher l'icône
    if (antecedent.presence == '1') {
      anteStr += '<i id="pre" class="fa fa-check" style="color: green;" ></i>';
    } else {
      anteStr += '<i id="pre" class="fa fa-ban" style="color: red;" ></i>';
    }

    anteStr += " " + antecedent.antecedent + " ";
    anteStr += " ";

    //Noir mais non en gras
    if (antecedent.details) {
      anteStr += " (<i>" + antecedent.details + "</i>)</span>";
    }

    return anteStr;

  }

  /**
   * Permet de renseigner les infos de la médication sélectionnée à partir de son id
   * @param id
   */
  setElementSelectionner(id: number) {
    this.listeAntecedents.forEach(
      (antecedentDTO: AntecedentDTO) => {
        if (antecedentDTO.id == id) {
          this.elementSelectionner = antecedentDTO;
        }
      }
    )
  }

  /**
   * Remplace la médication dans le formulaire.
   */
  remplacerAntecedent() {
    this.idElementModifieSelectionne = this.idElementSelectionne;
    this.setElementSelectionner(this.idElementSelectionne);
    let data: AntecedentDTO = this.elementSelectionner;
    this.antecedent.id = data.id;

    this.antecedent.details = data.details;
    this.antecedent.presence = data.presence;
    if (this.antecedent.presence == '1') {
      this.isPresenceActive = true;
      this.isAbscenceActive = false;

    } if (this.antecedent.presence == '0') {
      this.isAbscenceActive = true;
      this.isPresenceActive = false;
    }
    this.antecedent.referenceAntecedentId = data.referenceAntecedentId;
    this.antecedent.antecedent = data.antecedent;
    this.antecedent.actif = data.actif;

    this.closeModal('confirm_popup_modif_antecedent');

    this.listeAntecdent.focus();
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
    //this.detecterFicheActive();
    if (this.isPresenceActive) {
      this.antecedent.presence = '1';
    } else {
      this.antecedent.presence = '0';
    }

    this.isAntecedentValide = true;
    if (this.validerAntecedent()) {
      this.saveDonnees();
    }
  }

  //Sauvegarder les données
  saveDonnees(): void {
    //Vider les alertes déjà présentes
    if (this.alertStore.state) {
      this.alertStore.setState([]);
    }



    this.antecedent.idFicheAppel = this.idFiche;

    //Affiche un message d'avertissement quand on détecte un doublon
    if (this.isDoublon() == true) {

      let messages: string[] = [];
      let titre: string;
      titre = this.translateService.instant('sigct.sa.f_appel.evaluation.anteperti');
      const msg = this.translateService.instant("ss-iu-a30001", { 0: titre });
      messages.push(msg);

      this.creerErreurs(messages, 'Avertissement', AlertType.WARNING);

    }

    this.pertinenceSave.emit(this.getPertinence());
    this.antecedentSave.emit(this.antecedent);
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

  /**
   * reinitialiser le formulaire d'edition de la médication
   */
  reinitialiserAntecedent() {
    this.antecedent = new AntecedentDTO();

    let rad1;
    let rad2;
    let rad3;

    switch (this.ficheAppelPertinence.antecedent) {
      case 1:
        if (!this.isAucunDisabled) {
          rad1 = '1';
        } else {
          rad1 = null;
          this.ficheAppelPertinence.antecedent = null;
        }
        rad2 = null;
        rad3 = null;
        break;
      case 2: rad1 = null;
        if (!this.isInconnuDisabled) {
          rad2 = '2';
        } else {
          rad2 = null;
          this.ficheAppelPertinence.antecedent = null;
        }
        rad3 = null;
        break;
      case 3: rad1 = null;
        rad2 = null;
        if (!this.isNonPertinentDisabled) {
          rad3 = '3';
        } else {
          rad3 = null;
          this.ficheAppelPertinence.antecedent = null;
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
      referenceAntecedent: null,
      detail: null,
      radioPertinence1: rad1,
      radioPertinence2: rad2,
      radioPertinence3: rad3
    };

    this.isPresenceActive = false;
    this.isAbscenceActive = false;


    // Réinitialise le formulaire avec les valeurs par défaut
    this.form.resetForm(valeursParDefaut);

    this.idElementModifieSelectionne = null;

    this.isAntecedentValide = true;

    this.setPertinence();

  }

  //Libère les abonnements
  ngOnDestroy() {
    if (this.subscription) { this.subscription.unsubscribe(); }
    if (this.abonnementAntecedents) { this.abonnementAntecedents.unsubscribe() }
  }

  isAntecedentNonVide(): boolean {

    if (this.antecedent.details || this.antecedent.presence ||
      this.antecedent.referenceAntecedentId) {
      return true;
    }
    return false;
  }

  /**
   * Lance un message d'erreur si la fiche d'appel n'est pas trouvée.
   */
  detecterFicheActive() {
    let messages: string[] = [];

    if (this.antecedent.idFicheAppel != null) {
      if (this.antecedent.idFicheAppel == null) {
        const msg = this.translateService.instant("ss-sv-e00023", { 0: this.antecedent.idFicheAppel });
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

  validerAntecedent(): boolean {
    let valide: boolean = true;

    let messages: string[] = [];

    //Vider les alertes déjà présentes
    if (this.alertStore.state) {
      this.alertStore.setState([]);
    }

    //Présence obligaoire
    if (this.isAbscenceActive == false && this.isPresenceActive == false) {

      // if (this.antecedent.presence != '1' && this.antecedent.presence != '1') {

      const msg = this.translateService.instant("sa-iu-e00005");

      messages.push(msg);

      valide = false;

      this.isPresenceValide = valide;


    } //Antécédent null
    if (this.antecedent.referenceAntecedentId == null) {

      const msg = this.translateService.instant("sa-iu-e00004");
      messages.push(msg);


      valide = false;

      this.isAntecedentValide = false;//valide;

    }

    this.creerErreurs(messages, this.libelleMessageErreur, AlertType.ERROR);

    return valide;

  }

  onAntecedentValide($event) {
    this.isAntecedentValide = true;
  }


  /**
  * Met à jour l'infobulle de l'antécédent.  Met la description si elle est
  * disponnible.
  */
  onAntecedentChange() {

    this.listeAntecedentsDesc.forEach(item => {
      const antecedentCode = this.antecedent.referenceAntecedentId;

      if (item.id == antecedentCode) {
        if (item.description != null) {
          this.infoBulleAntecedent = item.description;
        } else {
          this.infoBulleAntecedent = item.nom;
        }

      }
    });

    if (this.antecedent.referenceAntecedentId === null) {
      this.infoBulleAntecedent = 'Sélectionnez...';
    }

  }

  isDoublon(): boolean {

    let rep: boolean = false;

    this.listeAntecedents.forEach((ant: AntecedentDTO) => {

      let condition1: boolean = (ant.details == this.antecedent.details);
      let condition2: boolean = (ant.presence == this.antecedent.presence);
      let condition3: boolean = (ant.referenceAntecedentId == this.antecedent.referenceAntecedentId);

      if (condition1 &&
        condition2 &&
        condition3) {

        rep = true;

      }
    });

    return rep;
  }

  //Retourne la valeur actuelle de la pertinence
  //la pertinence doit être un string sinon il y a
  //des problèmes de détection.
  getPertinence() {

    return Number(this.pertinence);

  }

  /**
   * Permet de vérifier s'il y a au moins un antécédent avec présence dans la liste.  Sinon,
   * notifier à la page parente d'afficher le message de validation finale.
   */
  getValidationFinale() {

    if (this.isAucunDisabled === true && this.isNonPertinentDisabled === true && this.isInconnuDisabled === true) {

      return true;

    } else {

      if ((this.pertinence)
        && (Number(this.pertinence) >= 1 && Number(this.pertinence) <= 3)) {
        return true;
      } else {
        return false;
      }


    }
  }


  ajouterParCategoriePopUp() {

    this.alertStore.resetAlert();
    const data = new SaisirParSystemePopupDataDTO();

    data.titreLabel = 'sigct.sa.f_appel.evaluation.ajout_ant_cat.titreajoutantecedentspertinents';
    data.ajouterLabel = 'sigct.sa.f_appel.evaluation.ajout_ant_cat.btnajouter';
    data.anulerLabel = 'sigct.sa.f_appel.evaluation.ajout_ant_cat.btnannuler';
    data.fermerLabel = 'sigct.sa.f_appel.evaluation.ajout_ant_cat.btnfermerinfobulle';
    data.systemeLabel = 'sigct.sa.f_appel.evaluation.ajout_ant_cat.categorie'
    data.nomLabel = 'sigct.sa.f_appel.evaluation.ajout_ant_cat.antecedents'
    data.presenceLabel = 'sigct.sa.f_appel.evaluation.ajout_ant_cat.presence'
    data.absenceLabel = 'sigct.sa.f_appel.evaluation.ajout_ant_cat.absence'
    data.detailsLabel = 'sigct.sa.f_appel.evaluation.ajout_ant_cat.details'
    data.msgSaisirObligatoire = 'sa-iu-e00004p';
    data.msgPresenceObligatoire = 'sa-iu-e00005';

    data.onInitListeSystemesCallBack = () => {
      let valeurLibelleVide: string = this.translateService.instant("girpi.label.selectionnez");
      this.referencesService.getListeSystemeAvecAntecedents().subscribe((result: []) => {
        result.forEach((element: any) => {
          data.inputOptionsSystemes.options.push({ label: element.description != null ? element.description : element.nom, value: element.id });
        });
      });
    }

    data.onInitListeAllReferencesPossiblesCallBack = (systemeSecetioneId: number) => {
      this.referencesService.getListeAntecedentParSysteme(systemeSecetioneId).subscribe((result: ReferenceDTO[]) => {
        console.log(result);
        result.forEach(r => {
          const reference = new ReferenceSaisibleEnPopupDTO();
          reference.referenceId = r.id;
          reference.nom = r.nom;
          data.allReferencesPossibles.push(reference);
        });
      });
    }

    data.onAjouterCallBack = (rereferences: Array<ReferenceSaisibleEnPopupDTO>): void => {
      rereferences.forEach(element => {
        this.antecedent.presence = element.presence;
        this.antecedent.referenceAntecedentId = element.referenceId;
        this.antecedent.antecedent = element.nom;
        this.antecedent.details = element.details
        this.saveDonnees();
      });
    }

    SaisirReferencePopupLauncher.launch(this.dialog, data);
  }

}
