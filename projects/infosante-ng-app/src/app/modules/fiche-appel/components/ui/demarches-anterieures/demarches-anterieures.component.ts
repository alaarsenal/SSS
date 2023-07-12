import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { DemarcheAnterieuresDTO } from '../../../models/demarche-anterieures-dto';
import { Subscription } from 'rxjs';
import { ActionLinkItem } from 'projects/sigct-ui-ng-lib/src/lib/components/action-link/action-link.component';
import { ReferenceDTO } from 'projects/usager-ng-core/src/lib/models';
import { ChampsDatesCommunesDTO } from '../../../models/commun-dto';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { BindingErrorsStore } from 'projects/sigct-service-ng-lib/src/lib/api-errors';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { ReferencesApiService } from '../../../../../../../../infosante-ng-core/src/lib/services/references-api.service';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { NgForm } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AlertType, AlertModel } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { InputTextComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/input-text/input-text.component';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';

@Component({
  selector: 'app-demarches-anterieures',
  templateUrl: './demarches-anterieures.component.html',
  styleUrls: ['./demarches-anterieures.component.css']
})
export class DemarchesAnterieuresComponent implements OnInit, OnDestroy {

  demarcheAnterieures: DemarcheAnterieuresDTO = new DemarcheAnterieuresDTO();
  subscription: Subscription = new Subscription();
  abonnementRessourceConsulte: Subscription;
  abonnementResultatObtenu: Subscription;


  public actionLinks: ActionLinkItem[];
  public listeDemarcheAnterieures: Array<DemarcheAnterieuresDTO> = new Array<DemarcheAnterieuresDTO>();
  private listeRessourceConsulte: Array<ReferenceDTO> = new Array<ReferenceDTO>();

  private listeResultatObtenu: Array<ReferenceDTO> = new Array<ReferenceDTO>();


  private elementSelectionner: DemarcheAnterieuresDTO;
  public listePertinences: string[];


  public messageConfirmerAjout: string;
  public libelleMessageErreur: string;

  public isPresenceActive: boolean = false;
  public isAbscenceActive: boolean = false;

  public isAutosoinValide: boolean = true;
  public isResultatValide: boolean = true;

  private dateHeureDetail: ChampsDatesCommunesDTO;



  public infoBulleConsulte: string = 'Sélectionnez...';
  public infoBulleResultat: string = 'Sélectionnez...';
  public valeurLibelleSelectionnez: string;

  public readOnly: string = '';

  public idFiche: number;

  public auMoinsUnPresence: boolean = true;

  idElementSelectionne: number = null;
  public idElementModifieSelectionne: number = null;
  messageConfirmerDemarcheAnterieures: any;
  messageSupprimerDemarcheAnterieures: any;

  @Input()
  isDisabled =false;

  constructor(
    public alertStore: AlertStore,
    public bindingErrorsStore: BindingErrorsStore,
    private translateService: TranslateService,
    private modalConfirmService: ConfirmationDialogService,
    private referencesService: ReferencesApiService,
  ) {

  }


  /**
   * Peuple la liste des DemarcheAnterieuress sauvegardes dans la base de donnees
   */
  @Input("listeDemarcheAnterieures")
  public set listeDemarcheAnterieure(demarcheAnterieuressDTO: DemarcheAnterieuresDTO[]) {

    this.listeDemarcheAnterieures = new Array<DemarcheAnterieuresDTO>();
    this.listeDemarcheAnterieures = demarcheAnterieuressDTO;


    this.reinitialiserDemarcheAnterieures();

  }


  @Input("dateHeureDetail")
  public set dateHeuresDetail(dtHeureDetail: ChampsDatesCommunesDTO) {

    this.dateHeureDetail = dtHeureDetail;

  }



  //Les événements qui sont poussés au parent
  @Output()
  demarcheAnterieuresSave: EventEmitter<any> = new EventEmitter();

  @Output()
  demarcheAnterieuresDelete: EventEmitter<any> = new EventEmitter();

  //Notifier la page que l'on veut restaurer une manifestion et mettre à jour les infos
  @Output()
  modifierDateHeuresDetail: EventEmitter<any> = new EventEmitter();



  ngOnInit() {

    this.subscription.add(
      this.translateService.get(["sigct.sa.error.label", "sigct.sa.f_appel.evaluation.aucunante", "sigct.sa.f_appel.evaluation.anteincon",
        "sigct.sa.f_appel.evaluation.nonperti", "sigct.sa.f_appel.evaluation.ajousvgrd", "sigct.sa.f_appel.evaluation.action", "sigct.sa.f_appel.evaluation.pre", "sigct.sa.f_appel.evaluation.abs", "girpi.label.selectionnez", "general.msg.obligatoire"]).subscribe((messages: string[]) => {
          this.libelleMessageErreur = messages["sigct.sa.error.label"];
          this.actionLinks = [{ action: this.submitAction, icon: "fa fa-arrow-right fa-2x", label: messages["sigct.sa.f_appel.evaluation.ajousvgrd"] }];

          this.valeurLibelleSelectionnez = messages["girpi.label.selectionnez"];

        })

    );

    // Alimente la liste des DemarcheAnterieuress.

    let titre: string;
    titre = this.translateService.instant('sigct.sa.f_appel.evaluation.dmrchantautosoins');
    this.messageSupprimerDemarcheAnterieures = this.translateService.instant('sa-iu-a00001', { 0: titre });

    this.messageConfirmerDemarcheAnterieures = this.translateService.instant('ss-iu-a30004', { 0: titre });

    this.inputOptionsRessourceConsulte.options.push({ label: this.valeurLibelleSelectionnez, value: null });
    this.inputOptionsResultatObtenu.options.push({ label: this.valeurLibelleSelectionnez, value: null });


    if (this.abonnementRessourceConsulte == null) {
      this.abonnementRessourceConsulte = this.referencesService.getListeRessourceConsulte().subscribe((result: ReferenceDTO[]) => {
        if (result) {
          result.forEach(item => {
            this.listeRessourceConsulte.push(item);
            this.inputOptionsRessourceConsulte.options.push({ label: item.nom, value: '' + item.id, description: item.description });
          })
        };
      });
    }
    if (this.abonnementResultatObtenu == null) {
      this.abonnementResultatObtenu = this.referencesService.getListeResultatObtenu().subscribe((result: ReferenceDTO[]) => {
        if (result) {
          result.forEach(item => {
            this.listeResultatObtenu.push(item);
            this.inputOptionsResultatObtenu.options.push({ label: item.nom, value: '' + item.id, description: item.description });
          })
        };
      });
    }
  }


  //Conteneur pour la liste de valeurs
  public inputOptionsRessourceConsulte: InputOptionCollection = {
    name: "ressources",
    options: []
  };

  public inputOptionsResultatObtenu: InputOptionCollection = {
    name: "resultats",
    options: []
  };



  @ViewChild("fCom", { static: true })
  form: NgForm;

  @ViewChild("submitDemAutoBtn", { static: true })
  submitAutoBtn: ElementRef;

  @ViewChild("auto", { static: true })
  autoSoinsHTML: InputTextComponent;



  /**
   * vérifie si la DemarcheAnterieures est vide.  S'il est vide on soumet la page, sinon,
   * afficher une boite de dialogue.
   *
   * @param element
   */
  confirmerModifierDemarcheAnterieures(element: any) {

    this.idElementSelectionne = element.id;
    this.getDemarcheAnterieuresDTOById(this.idElementSelectionne);
    let data = this.elementSelectionner;

    this.modifierDateHeuresDetail.emit(data);

  }

  isEmpty(str) {
    return (!str || 0 === str.length);
  }

  isIdentique(demt: DemarcheAnterieuresDTO): boolean {

    let resultat: boolean = false;

    if (this.demarcheAnterieures.details == demt.details &&
      this.demarcheAnterieures.referenceResultatObtenuId == demt.referenceResultatObtenuId &&
      this.demarcheAnterieures.autosoin == demt.autosoin
    ) {
      resultat = true;
    }

    //Si jamais la source est null, ce n'est pas nécessairement different.
    if (this.isEmpty(this.demarcheAnterieures.details) &&
      this.isEmpty(this.demarcheAnterieures.referenceResultatObtenuId) &&
      this.isEmpty(this.demarcheAnterieures.autosoin)) {
      resultat = true;
    }

    return resultat;
  }

  /**
   * Ouvre la boite de dialogue pour confirmer la suppression.
   * @param element
   */
  confirmerSupprimerDemarcheAnterieures(element: any) {

    this.idElementSelectionne = element.id;    this.idElementModifieSelectionne = this.idElementSelectionne;
    this.getDemarcheAnterieuresDTOById(this.idElementSelectionne);
    let data: DemarcheAnterieuresDTO = this.elementSelectionner;
    this.demarcheAnterieures.id = data.id;

    this.demarcheAnterieuresDelete.emit(this.demarcheAnterieures);

  }


  /**
   * Formate les liens d'action selon la présence ou l'absence d'une DemarcheAnterieures.
   * @param DemarcheAnterieures
   */
  formatActionDemarcheAnterieures(demarcheAnterieures: DemarcheAnterieuresDTO) {

    let anteStr: string;

    anteStr = '<div style="color:black;" >';



    if (demarcheAnterieures.dateDemandeEvaluation) {
      let dateManif: Date = new Date(Number(demarcheAnterieures.dateDemandeEvaluation));

      if (dateManif) {

        let datePipe = new DatePipe("fr-ca");

        anteStr += datePipe.transform(dateManif, 'yyyy-MM-dd') + ' ';


        if (demarcheAnterieures.heures) {


          anteStr += demarcheAnterieures.heures.substr(0, 2);

          anteStr += ':';

          anteStr += demarcheAnterieures.heures.substr(2, 2) + ' ';
        }




      }

    }

    if (demarcheAnterieures.detailDemandeEvaluation) {
      anteStr += " <span style='color:black;'>(<i>" + demarcheAnterieures.detailDemandeEvaluation + "</i>)</span> ";
    }

    anteStr += " " + demarcheAnterieures.autosoin + " ";

    if (demarcheAnterieures.referenceResultatObtenuNom) {
      anteStr += ", " + demarcheAnterieures.referenceResultatObtenuNom + " ";
    }


    anteStr += "  ";

    //Noir mais non en gras
    if (demarcheAnterieures.details) {
      anteStr += " <span style='color:black;'>(<i>" + demarcheAnterieures.details + "</i>)</span>";
    }

    anteStr += "</div>";

    return anteStr;

  }

  /**
   * obtenir l'objet DemarcheAnterieuresDTO a partir de son id
   * @param id
   */
  getDemarcheAnterieuresDTOById(id: number) {
    this.listeDemarcheAnterieures.forEach(
      (demarcheAnterieuresDTO: DemarcheAnterieuresDTO) => {
        if (demarcheAnterieuresDTO.id == id) {
          this.elementSelectionner = demarcheAnterieuresDTO;
        }
      }
    )
  }

  /**
   * Remplace la DemarcheAnterieures dans le formulaire.
   */
  remplacerDemarcheAnterieures() {

    this.idElementModifieSelectionne = this.idElementSelectionne;
    this.getDemarcheAnterieuresDTOById(this.idElementSelectionne);
    let data: DemarcheAnterieuresDTO = this.elementSelectionner;
    this.demarcheAnterieures.id = data.id;

    this.demarcheAnterieures.details = data.details;

    this.demarcheAnterieures.referenceResultatObtenuId = data.referenceResultatObtenuId;

    this.demarcheAnterieures.dateDemandeEvaluation = data.dateDemandeEvaluation;
    this.demarcheAnterieures.detailDemandeEvaluation = data.detailDemandeEvaluation;

    this.demarcheAnterieures.autosoin = data.autosoin;

    this.demarcheAnterieures.heures = data.heures;


    this.demarcheAnterieures.actif = data.actif;

    this.demarcheAnterieures.execution = "demarcheanterieures";

    this.modifierDateHeuresDetail.emit(this.demarcheAnterieures);

    this.closeModal('confirm_popup_modif_dem_auto');

    this.autoSoinsHTML.focus();

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
    this.isPresenceActive = !this.isPresenceActive;

    if (this.isPresenceActive) {

      this.isAbscenceActive = false;

    }

  }

  onAbsenceClick() {
    this.isAbscenceActive = !this.isAbscenceActive;

    if (this.isAbscenceActive) {

      this.isPresenceActive = false;

    }

  }



  /**
  * Met à jour l'infobulle de la ressource consulté.  Met la description si elle est
  * disponnible.
  */
  onResultatChange() {

    this.listeResultatObtenu.forEach(item => {
      const refCode = this.demarcheAnterieures.referenceResultatObtenuId;

      if (item.id == refCode) {
        if (item.description != null) {
          this.infoBulleResultat = item.description;
        } else {
          this.infoBulleResultat = item.nom;
        }

      }
    });

    if (this.demarcheAnterieures.referenceResultatObtenuId === null) {
      this.infoBulleResultat = 'Sélectionnez...';
    }


  }



  /**
   * fonction generique de soumission du formulaire. simule le clique sur le bouton plus +
   */
  submitAction = () => {
    this.submitAutoBtn.nativeElement.click();
  }

  supprimerDemarcheAnterieurAnterieures() {

    this.idElementModifieSelectionne = this.idElementSelectionne;
    this.getDemarcheAnterieuresDTOById(this.idElementSelectionne);
    let data: DemarcheAnterieuresDTO = this.elementSelectionner;
    this.demarcheAnterieures.id = data.id;

    this.demarcheAnterieuresDelete.emit(this.demarcheAnterieures);


  }


  onSubmitDemarcheAnterieures() {

    //this.detecterFicheActive();

    if (this.validerDemarcheAnterieures()) {
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
    /*
    *** Gérer par le backend ***
    if (this.isDoublon() == true) {

      let messages: string[] = [];
      const msg = this.translateService.instant("sa-iu-a00006");
      messages.push(msg);

      this.creerErreurs(messages, 'Avertissement', AlertType.WARNING);

    }
    */

    this.demarcheAnterieures.idFicheAppel = this.idFiche;
    this.demarcheAnterieures.valid = true;

    this.demarcheAnterieuresSave.emit(this.demarcheAnterieures);

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
  reinitialiserDemarcheAnterieures() {
    this.demarcheAnterieures = new DemarcheAnterieuresDTO();

    // Transforme les valeurs par défaut en un objet dont les attributs correspondent aux controls du formulaire à "reseter".
    let valeursParDefaut: any = {
      id: null,
      ressourceConsulte: null,
      resultatObtenu: null,
      autosoin: null,
      detail: null
    };
    // Réinitialise le formulaire avec les valeurs par défaut
    this.form.resetForm(valeursParDefaut);

    this.idElementModifieSelectionne = null;
    this.isAutosoinValide = true;
    this.isResultatValide = true;
    this.closeModal('confirm_popup_supri_dem_auto');
  }

  resetChampsValides():void {
    this.isAutosoinValide = true;
    this.isResultatValide = true;
  }
  //Libère les abonnements
  ngOnDestroy() {

    if (this.subscription) { this.subscription.unsubscribe(); }
    if (this.abonnementRessourceConsulte) { this.abonnementRessourceConsulte.unsubscribe(); }

  }


  isDemarcheAnterieuresVide(): boolean {

    if ((this.demarcheAnterieures.details === undefined || this.demarcheAnterieures.details === null) &&
      (this.demarcheAnterieures.autosoin === undefined || this.demarcheAnterieures.autosoin === null) &&
      (this.demarcheAnterieures.referenceResultatObtenuId === undefined || this.demarcheAnterieures.referenceResultatObtenuId === null)) {
      return true;
    }
    return false;
  }

  /**
   * Lance un message d'erreur si la fiche d'appel n'est pas trouvée.
   */
  detecterFicheActive() {
    let messages: string[] = [];

    if (this.demarcheAnterieures.idFicheAppel != null) {


      const msg = this.translateService.instant("ss-sv-e00023", { 0: 'this.demarcheAnterieures.idFicheAppel' });
      messages.push(msg);

      this.creerErreurs(messages, this.libelleMessageErreur, AlertType.ERROR);


    } else {

      //Il n'y a pas de numéro de fiche d'appel actif
      const msg = this.translateService.instant("ss-sv-e00022");
      messages.push(msg);

      this.creerErreurs(messages, this.libelleMessageErreur, AlertType.ERROR);

    }
  }

  validerDemarcheAnterieures(): boolean {

    let valide: boolean = true;

    let messages: string[] = [];

    //Vider les alertes déjà présentes
    if (this.alertStore.state) {
      this.alertStore.setState([]);
    }

    //A consulter null
    if (this.demarcheAnterieures.autosoin === null || this.demarcheAnterieures.autosoin === undefined || this.demarcheAnterieures.autosoin === "") {

      const champ = this.translateService.instant("sigct.sa.f_appel.evaluation.autosoins");
      const msg = this.translateService.instant("general.msg.obligatoire", { 0: champ });
      messages.push(msg);


      valide = false;

      this.isAutosoinValide = valide;

    }

    const dtHeure = this.dateHeureDetail.dateCommune;
    let heureCommune: number;

    if (dtHeure !== undefined && dtHeure !== null) {
      heureCommune = dtHeure.getHours();
      if (isNaN(heureCommune) || heureCommune === -1) {

        const msg = this.translateService.instant("sa-iu-e00016");
        messages.push(msg);

        valide = false;

        this.demarcheAnterieures.valid = valide;

      }

    } else {
      if (!this.isEmpty(this.dateHeureDetail.heureCommune) && this.isEmpty(this.dateHeureDetail.dateCommune)) {

        const msg = this.translateService.instant("sa-iu-e00016");
        messages.push(msg);

        valide = false;

        this.demarcheAnterieures.valid = valide;

      }

    }


    if (!valide) {

      this.creerErreurs(messages, this.libelleMessageErreur, AlertType.ERROR);

      this.demarcheAnterieures.valid = false;
      this.demarcheAnterieures.execution = 'valid';
      this.modifierDateHeuresDetail.emit(this.demarcheAnterieures);
    }

    return valide;

  }

  isDoublon(): boolean {

    let rep: boolean = false;

    this.listeDemarcheAnterieures.forEach((dem: DemarcheAnterieuresDTO) => {

      let condition1: boolean = (dem.autosoin.toLowerCase() == this.demarcheAnterieures.autosoin.toLowerCase());
      let condition2: boolean = (dem.referenceResultatObtenuId == this.demarcheAnterieures.referenceResultatObtenuId);
      let condition3: boolean;

      if (this.dateHeureDetail.dateCommune && dem.dateDemandeEvaluation) {
        condition3 = (dem.dateDemandeEvaluation.toString() == this.dateHeureDetail.dateCommune.getTime().toString());
      } else {
        condition3 = (dem.dateDemandeEvaluation == null && this.dateHeureDetail.dateCommune == null);
      }



      if (condition1 &&
        condition2 &&
        condition3) {

        if ((dem.id != this.demarcheAnterieures.id) || (this.demarcheAnterieures.id === undefined)) {

          rep = true;

        }

      }
    });

    return rep;
  }


  onResultatValide($event) {
    this.isResultatValide = true;
  }

  onNgModelChange() {
    this.isAutosoinValide = true;
  }

  openModalWithCustomisedMsgbyId(id: string, msg: string, idActivedButton) {
    this.messageConfirmerDemarcheAnterieures = msg;
    this.openModal(id, idActivedButton);
  }

}
