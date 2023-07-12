import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
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
import { ChampsDatesCommunesDTO } from '../../../models/commun-dto';
import { ManifestationDTO } from '../../../models/manifestation-dto';
import { ReferenceSaisibleEnPopupDTO } from '../../../models/reference-saisible-en-popup-dto';
import { SaisirParSystemePopupDataDTO } from '../../../models/saisir-par-systeme-popup-data-dto';
import { SaisirReferencePopupLauncher } from '../saisir-reference-popup/saisir-reference-popup-launcher';

@Component({
  selector: 'app-manifestations',
  templateUrl: './manifestations.component.html',
  styleUrls: ['./manifestations.component.css']
})
export class ManifestationsComponent implements OnInit, OnDestroy {

  manifestation: ManifestationDTO = new ManifestationDTO();
  subscription: Subscription = new Subscription();
  abonnementManifestations: Subscription;


  public pertinence: number = null;
  public listeLabelPertinence: Array<string> = new Array<string>();

  public actionLinks: ActionLinkItem[];
  public listeManifestations: Array<ManifestationDTO> = new Array<ManifestationDTO>();
  private listeManifestationsDesc: Array<ReferenceDTO> = new Array<ReferenceDTO>();
  private elementSelectionner: ManifestationDTO;
  public listePertinences: string[];


  public messageConfirmerAjout: string;
  public libelleMessageErreur: string;

  public isPresenceActive: boolean = false;
  public isAbscenceActive: boolean = false;

  public isManifestationValide: boolean = true;
  public isPresenceValide: boolean = true;

  private dateHeureDetail: ChampsDatesCommunesDTO;



  public infoBulleManifestation: string = 'Sélectionnez...';
  public valeurLibelleSelectionnez: string;

  public readOnly: string = '';

  public idFiche: number;

  public auMoinsUnPresence: boolean = true;

  idElementSelectionne: number = null;
  public idElementModifieSelectionne: number = null;
  messageConfirmerManifestations: any;
  messageSupprimerManifestations: any;

  @Input()
  isDisabled = false;

  constructor(
    public alertStore: AlertStore,
    public bindingErrorsStore: BindingErrorsStore,
    private translateService: TranslateService,
    private modalConfirmService: ConfirmationDialogService,
    private referencesService: ReferencesApiService,
    private dialog: MatDialog,
  ) {

  }


  /**
   * Peuple la liste des manifestations sauvegardes dans la base de donnees
   */
  @Input("listeManifestations")
  public set listeManifestation(manifestationsDTO: ManifestationDTO[]) {

    this.listeManifestations = new Array<ManifestationDTO>();
    this.listeManifestations = manifestationsDTO;

    this.reinitialiserManifestation();

  }


  @Input("dateHeureDetail")
  public set dateHeuresDetail(dtHeureDetail: ChampsDatesCommunesDTO) {

    this.dateHeureDetail = dtHeureDetail;

  }



  //Les événements qui sont poussés au parent
  @Output()
  manifestationSave: EventEmitter<ManifestationDTO> = new EventEmitter();

  @Output()
  listeManifestationSave: EventEmitter<ManifestationDTO[]> = new EventEmitter();

  @Output()
  manifestationDelete: EventEmitter<any> = new EventEmitter();

  //Notifier la page que l'on veut restaurer une manifestion et mettre à jour les infos
  @Output()
  modifierDateHeuresDetail: EventEmitter<any> = new EventEmitter();



  ngOnInit() {

    this.subscription.add(
      this.translateService.get(["sigct.sa.error.label", "sigct.sa.f_appel.evaluation.aucunante", "sigct.sa.f_appel.evaluation.anteincon",
        "sigct.sa.f_appel.evaluation.nonperti", "sigct.sa.f_appel.evaluation.ajousvgrd", "sigct.sa.f_appel.evaluation.action", "sigct.sa.f_appel.evaluation.pre", "sigct.sa.f_appel.evaluation.abs", "girpi.label.selectionnez"]).subscribe((messages: string[]) => {
          this.libelleMessageErreur = messages["sigct.sa.error.label"];
          this.actionLinks = [{ action: this.submitAction, icon: "fa fa-arrow-right fa-2x", label: messages["sigct.sa.f_appel.evaluation.ajousvgrd"] }];

          this.valeurLibelleSelectionnez = messages["girpi.label.selectionnez"];

        })

    );

    // Alimente la liste des Manifestations.

    let titre: string;
    titre = this.translateService.instant('sigct.sa.f_appel.evaluation.titremanifestations');
    this.messageSupprimerManifestations = this.translateService.instant('sa-iu-a00001', { 0: titre });

    this.messageConfirmerManifestations = this.translateService.instant('ss-iu-a30004', { 0: titre });

    this.inputOptionsManifestations.options.push({ label: this.valeurLibelleSelectionnez, value: null });


    if (this.abonnementManifestations == null) {
      this.abonnementManifestations = this.referencesService.getListeManifestation().subscribe((result: ReferenceDTO[]) => {
        if (result) {
          result.forEach(item => {
            this.listeManifestationsDesc.push(item);
            this.inputOptionsManifestations.options.push({ label: item.nom, value: '' + item.id, description: item.description });
          })
        };
      });
    }
  }


  //Conteneur pour la liste de valeurs
  public inputOptionsManifestations: InputOptionCollection = {
    name: "manifestations",
    options: []
  };



  @ViewChild("fCom", { static: true })
  form: NgForm;

  @ViewChild("submitManifBtn", { static: true })
  submitManifBtn: ElementRef;

  @ViewChild("liste_manifestation", { static: true })
  listeManifestationHTML: SigctChosenComponent;


  /**
   * vérifie si la manifestation est vide.  S'il est vide on soumet la page, sinon,
   * afficher une boite de dialogue.
   *
   * @param element
   */
  confirmerModifierManifestation(element: any) {

    this.idElementSelectionne = element.id;

    this.getManifestationDTOById(this.idElementSelectionne);
    let data: ManifestationDTO = this.elementSelectionner;

    this.modifierDateHeuresDetail.emit(data);

  }

  /**
   * Ouvre la boite de dialogue pour confirmer la suppression.
   * @param element
   */
  confirmerSupprimerManifestation(element: any) {

    this.idElementSelectionne = element.id; 
     this.idElementModifieSelectionne = this.idElementSelectionne;
    this.getManifestationDTOById(this.idElementSelectionne);
    let data: ManifestationDTO = this.elementSelectionner;
    this.manifestation.id = data.id;

    this.manifestationDelete.emit(this.manifestation);


  }


  /**
   * Formate les liens d'action selon la présence ou l'absence d'une manifestation.
   * @param manifestation
   */
  formatActionManifestation(manifestation: ManifestationDTO) {

    let anteStr: string;

    anteStr = '<div style="color:black;" >';



    if (manifestation.dateDemandeEvaluation != undefined) {
      let dateManif: Date = new Date(Number(manifestation.dateDemandeEvaluation));

      if (dateManif != undefined) {

        let datePipe = new DatePipe("fr-ca");

        anteStr += datePipe.transform(dateManif, 'yyyy-MM-dd') + ' ';


        if (manifestation.heures != undefined) {


          anteStr += manifestation.heures.substr(0, 2);

          anteStr += ':';

          anteStr += manifestation.heures.substr(2, 2) + ' ';
        }




      }

    }

    if (manifestation.detailDemandeEvaluation != undefined) {
      anteStr += " <span style='color:black;'>(<i>" + manifestation.detailDemandeEvaluation + "</i>)</span> ";
    }

    //Afficher l'icône
    if (manifestation.presence == '1') {
      anteStr += '<i id="pre" class="fa fa-check" style="color: green;" ></i>';
    } else {
      anteStr += '<i id="pre" class="fa fa-ban" style="color: red;" ></i>';
    }

    anteStr += " " + manifestation.manifestationDesc + " ";

    anteStr += "  ";

    //Noir mais non en gras
    if (manifestation.details) {
      anteStr += " <span style='color:black;'>(<i>" + manifestation.details + "</i>)</span>";
    }

    anteStr += "</div>";

    return anteStr;

  }

  /**
   * obtenir l'objet manifestationDTO a partir de son id
   * @param id
   */
  getManifestationDTOById(id: number) {
    this.listeManifestations.forEach(
      (manifestationDTO: ManifestationDTO) => {
        if (manifestationDTO.id == id) {
          this.elementSelectionner = manifestationDTO;
        }
      }
    )
  }

  /**
   * Remplace la manifestation dans le formulaire.
   */
  remplacerManifestation() {

    this.idElementModifieSelectionne = this.idElementSelectionne;
    this.getManifestationDTOById(this.idElementSelectionne);
    let data: ManifestationDTO = this.elementSelectionner;
    this.manifestation.id = data.id;

    this.manifestation.details = data.details;
    this.manifestation.presence = data.presence;
    if (this.manifestation.presence == '1') {
      this.isPresenceActive = true;
      this.isAbscenceActive = false;

    } if (this.manifestation.presence == '0') {
      this.isAbscenceActive = true;
      this.isPresenceActive = false;
    }

    this.manifestation.referenceManifestationId = data.referenceManifestationId;

    this.manifestation.dateDemandeEvaluation = data.dateDemandeEvaluation;
    this.manifestation.detailDemandeEvaluation = data.detailDemandeEvaluation;
    this.manifestation.heures = data.heures;


    this.manifestation.actif = data.actif;

    this.manifestation.execution = "manif";

    this.modifierDateHeuresDetail.emit(this.manifestation);

    this.closeModal('confirm_popup_modif_man');

    this.listeManifestationHTML.focus();

  }

  /**
   * fontions generiques pour ouvrir et fermer une fenetre modal popup
   */
  openModal(id: string, btn: string) {
    this.modalConfirmService.openAndFocus(id, btn);
  }

  closeModal(id: string) {
    try {
      this.modalConfirmService.close(id);
      //Intercepte la fermeture de page modal non ouverte.
    } catch (e) {

    }

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

  /**
   * Met à jour l'infobulle de la manifestation.  Met la description si elle est
   * disponnible.
   */
  onManifestationChange() {

    this.listeManifestationsDesc.forEach(item => {
      const manifestationCode = Number(this.manifestation.referenceManifestationId);

      if (item.id == manifestationCode) {
        if (item.description != null) {
          this.infoBulleManifestation = item.description;
        } else {
          this.infoBulleManifestation = item.nom;
        }

      }
    });

    if (this.manifestation.referenceManifestationId === null) {
      this.infoBulleManifestation = 'Sélectionnez...';
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
    this.submitManifBtn.nativeElement.click();
  }



  onSubmitManifestation() {

    //this.detecterFicheActive();

    if (this.validerManifestation()) {

      if (this.isPresenceActive) {
        this.manifestation.presence = '1';
      } else {
        this.manifestation.presence = '0';
      }

      this.saveDonnees();
    }

  }

  //Sauvegarder les données
  saveDonnees(): void {
    //Vider les alertes déjà présentes
    if (this.alertStore.state) {
      this.alertStore.setState([]);
    }


    //Affiche un message d'avertissement quand on détecte un doublon
    if (this.isDoublon() == true) {

      let messages: string[] = [];
      const msg = this.translateService.instant("sa-iu-a00002");
      messages.push(msg);

      this.creerErreurs(messages, 'Avertissement', AlertType.WARNING);

    }

    this.manifestation.idFicheAppel = this.idFiche;
    this.manifestation.valid = true;

    this.manifestationSave.emit(this.manifestation);

  }

  /**
   * Méthode pour afficher un message d'erreur du service.
   * @param err
   */
  creerErreur(err: any) {
    let messages: string[] = [];
    const msg = err;
    messages.push(msg);

    const alertM: AlertModel = new AlertModel();
    alertM.title = this.libelleMessageErreur;
    alertM.type = AlertType.ERROR;
    alertM.messages = messages;

    if (this.alertStore.state) {
      this.alertStore.setState(this.alertStore.state.concat(alertM));
    } else {
      this.alertStore.setState([alertM]);
    }
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
   * reinitialiser le formulaire d'edition du moyen de communication
   */
  reinitialiserManifestation() {
    this.manifestation = new ManifestationDTO();

    // Transforme les valeurs par défaut en un objet dont les attributs correspondent aux controls du formulaire à "reseter".
    let valeursParDefaut: any = {
      id: null,
      manifestation: null,
      detail: null
    };

    this.isPresenceActive = false;
    this.isAbscenceActive = false;

    // Réinitialise le formulaire avec les valeurs par défaut
    this.form.resetForm(valeursParDefaut);

    this.idElementModifieSelectionne = null;

    this.closeModal('confirm_popup_supri_man');
  }

  resetChampsValides(): void {
    this.isManifestationValide = true;
  }
  //Libère les abonnements
  ngOnDestroy() {

    if (this.subscription) { this.subscription.unsubscribe(); }
    if (this.abonnementManifestations) { this.abonnementManifestations.unsubscribe(); }

  }


  isManifestationVide(): boolean {

    if ((this.manifestation.details === undefined || this.manifestation.details === null) &&
      this.manifestation.presence === undefined &&
      (this.manifestation.referenceManifestationId === undefined || this.manifestation.referenceManifestationId === null)) {
      return true;
    }
    return false;
  }

  /**
   * Lance un message d'erreur si la fiche d'appel n'est pas trouvée.
   */
  detecterFicheActive() {
    let messages: string[] = [];

    if (this.manifestation.idFicheAppel != null) {


      const msg = this.translateService.instant("ss-sv-e00023", { 0: 'this.manifestation.idFicheAppel' });
      messages.push(msg);

      this.creerErreurs(messages, this.libelleMessageErreur, AlertType.ERROR);


    } else {

      //Il n'y a pas de numéro de fiche d'appel actif
      const msg = this.translateService.instant("ss-sv-e00022");
      messages.push(msg);

      this.creerErreurs(messages, this.libelleMessageErreur, AlertType.ERROR);

    }
  }


  validerManifestation(): boolean {

    let valide: boolean = true;

    let messages: string[] = [];

    //Vider les alertes déjà présentes
    if (this.alertStore.state) {
      this.alertStore.setState([]);
    }

    //Présence obligaoire
    if (this.isAbscenceActive == false && this.isPresenceActive == false) {

      const msg = this.translateService.instant("sa-iu-e00002");

      messages.push(msg);

      valide = false;

      this.isPresenceValide = valide;


    } //Manifesation null
    if (this.manifestation.referenceManifestationId == null) {

      const msg = this.translateService.instant("sa-iu-e00001");
      messages.push(msg);


      valide = false;

      this.isManifestationValide = valide;

    }

    const dtHeure = this.dateHeureDetail.dateCommune;
    let heureCommune: number;

    if (dtHeure !== undefined && dtHeure !== null) {
      heureCommune = dtHeure.getHours();
      if (isNaN(heureCommune) || heureCommune === -1) {

        const msg = this.translateService.instant("sa-iu-e00016");
        messages.push(msg);

        valide = false;

        this.manifestation.valid = valide;

      }

    } else {
      if (!this.isEmpty(this.dateHeureDetail.heureCommune) && this.isEmpty(this.dateHeureDetail.dateCommune)) {

        const msg = this.translateService.instant("sa-iu-e00016");
        messages.push(msg);

        valide = false;

        this.manifestation.valid = valide;

      }

    }


    if (!valide) {

      this.creerErreurs(messages, this.libelleMessageErreur, AlertType.ERROR);

      this.manifestation.valid = false;
      this.manifestation.execution = 'valid';
      this.modifierDateHeuresDetail.emit(this.manifestation);
    }

    return valide;

  }

  isEmpty(str) {
    return (!str || 0 === str.length);
  }

  isIdentique(manif: ManifestationDTO): boolean {

    let resultat: boolean = false;

    if (this.manifestation.presence == manif.presence &&
      this.manifestation.details == manif.details &&
      this.manifestation.referenceManifestationId == manif.referenceManifestationId
    ) {
      resultat = true;
    }

    //Si jamais la source est null, ce n'est pas nécessairement different.
    if (this.isEmpty(this.manifestation.presence) &&
      this.isEmpty(this.manifestation.details) &&
      this.isEmpty(this.manifestation.referenceManifestationId)) {
      resultat = true;
    }

    return resultat;
  }

  isDoublon(): boolean {

    let rep: boolean = false;

    this.listeManifestations.forEach((ant: ManifestationDTO) => {

      let condition1: boolean = (ant.presence == this.manifestation.presence);
      let condition2: boolean = (ant.referenceManifestationId == Number(this.manifestation.referenceManifestationId));
      let condition3: boolean;

      if (this.dateHeureDetail.dateCommune != undefined && this.dateHeureDetail.dateCommune != null) {
        condition3 = (ant.dateDemandeEvaluation == this.dateHeureDetail.dateCommune.getTime().toString());
      } else {
        condition3 = (ant.dateDemandeEvaluation == null && this.dateHeureDetail.dateCommune == null);
      }



      if (condition1 &&
        condition2 &&
        condition3) {

        if ((ant.id != this.manifestation.id) || (this.manifestation.id === undefined)) {

          rep = true;

        }

      }
    });

    return rep;
  }


  onManifestationValide($event) {
    this.isManifestationValide = true;
  }

  ajouterParCategoriePopUp() {

    this.alertStore.resetAlert();
    const data = new SaisirParSystemePopupDataDTO();

    data.titreLabel = 'sigct.sa.f_appel.evaluation.ajout_man_grp.titreajoutantmanifestations';
    data.ajouterLabel = 'sigct.sa.f_appel.evaluation.ajout_man_grp.bntajouter';
    data.anulerLabel = 'sigct.sa.f_appel.evaluation.ajout_man_grp.btnannuler';
    data.fermerLabel = 'sigct.sa.f_appel.evaluation.ajout_man_grp.btnfermerinfobulle';
    data.systemeLabel = 'sigct.sa.f_appel.evaluation.ajout_man_grp.systeme'
    data.nomLabel = 'sigct.sa.f_appel.evaluation.ajout_man_grp.manifestations'
    data.presenceLabel = 'sigct.sa.f_appel.evaluation.ajout_man_grp.presence'
    data.absenceLabel = 'sigct.sa.f_appel.evaluation.ajout_man_grp.absence'
    data.detailsLabel = 'sigct.sa.f_appel.evaluation.ajout_man_grp.details'
    data.msgSaisirObligatoire = 'sa-iu-e00001';
    data.msgPresenceObligatoire = 'sa-iu-e00002';
    data.doitGarderOrdreDeSaisie = true;

    data.onInitListeSystemesCallBack = () => {
      let valeurLibelleVide: string = this.translateService.instant("girpi.label.selectionnez");
      this.referencesService.getListeSystemeAvecManifestation().subscribe((result: []) => {
        result.forEach((element: any) => {
          data.inputOptionsSystemes.options.push({ label: element.description != null ? element.description : element.nom, value: element.id });
        });
      });
    }

    data.onInitListeAllReferencesPossiblesCallBack = (systemeSecetioneId: number) => {
      this.referencesService.getListeManifestationParSysteme(systemeSecetioneId).subscribe((result: ReferenceDTO[]) => {
        result.forEach(r => {
          const reference = new ReferenceSaisibleEnPopupDTO();
          reference.referenceId = r.id;
          reference.nom = r.nom;
          data.allReferencesPossibles.push(reference);
        });
      });
    }

    data.onAjouterCallBack = (references: Array<ReferenceSaisibleEnPopupDTO>): void => {
      // Transforme la liste de références en une liste de ManifestationDTO.
      let listeManifestation: ManifestationDTO[] = references.map((reference: ReferenceSaisibleEnPopupDTO) => {
        const manifestation: ManifestationDTO = {
          details: reference.details,
          presence: reference.presence,
          manifestationDesc: reference.nom,
          referenceManifestationId: reference.referenceId,
          idFicheAppel: this.idFiche,
          valid: true,
        };

        return manifestation;
      });

      // Envoie la liste de manifestations au parent pour sauvegarde.
      this.listeManifestationSave.emit(listeManifestation);
    }

    SaisirReferencePopupLauncher.launch(this.dialog, data);
  }

  openModalWithCustomisedMsgbyId(id: string, msg: string, idActivedButton) {
    this.messageConfirmerManifestations = msg;
    this.openModal(id, idActivedButton);
  }

}
