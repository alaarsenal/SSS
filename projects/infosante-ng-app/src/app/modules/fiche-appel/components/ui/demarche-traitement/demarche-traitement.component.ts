import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { DemarcheTraitementDTO } from '../../../models/demarche-traitement-dto';
import { ActionLinkItem } from 'projects/sigct-ui-ng-lib/src/lib/components/action-link/action-link.component';
import { ReferenceDTO } from '../../../../../../../../infosante-ng-core/src/lib/models/reference-dto';
import { ChampsDatesCommunesDTO } from '../../../models/commun-dto';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { BindingErrorsStore } from 'projects/sigct-service-ng-lib/src/lib/api-errors/binding-errors.store';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { ReferencesApiService } from '../../../../../../../../infosante-ng-core/src/lib/services/references-api.service';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { NgForm } from '@angular/forms';
import { SigctChosenComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-chosen/sigct-chosen.component';
import { DatePipe } from '@angular/common';
import { AlertType, AlertModel } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';

@Component({
  selector: 'app-demarche-traitement',
  templateUrl: './demarche-traitement.component.html',
  styleUrls: ['./demarche-traitement.component.css']
})
export class DemarcheTraitementComponent implements OnInit, OnDestroy {

  demarcheTraitement: DemarcheTraitementDTO = new DemarcheTraitementDTO();
  subscription: Subscription = new Subscription();
  abonnementRessourceConsulte: Subscription;
  abonnementResultatObtenu: Subscription;


  public actionLinks: ActionLinkItem[];
  public listeDemarcheTraitements: Array<DemarcheTraitementDTO> = new Array<DemarcheTraitementDTO>();
  private listeRessourceConsulte: Array<ReferenceDTO> = new Array<ReferenceDTO>();

  private listeResultatObtenu: Array<ReferenceDTO> = new Array<ReferenceDTO>();


  private elementSelectionner: DemarcheTraitementDTO;
  public listePertinences: string[];


  public messageConfirmerAjout: string;
  public libelleMessageErreur: string;

  public isPresenceActive: boolean = false;
  public isAbscenceActive: boolean = false;

  public isConsulteValide: boolean = true;
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
  messageConfirmerDemarcheTraitements: any;
  messageSupprimerDemarcheTraitements: any;

  @Input()
  isDisabled = false;

  constructor(
    public alertStore: AlertStore,
    public bindingErrorsStore: BindingErrorsStore,
    private translateService: TranslateService,
    private modalConfirmService: ConfirmationDialogService,
    private referencesService: ReferencesApiService,
  ) {

  }


  /**
   * Peuple la liste des DemarcheTraitements sauvegardes dans la base de donnees
   */
  @Input("listeDemarcheTraitements")
  public set listeDemarcheTraitement(demarcheTraitementsDTO: DemarcheTraitementDTO[]) {

    this.listeDemarcheTraitements = new Array<DemarcheTraitementDTO>();
    this.listeDemarcheTraitements = demarcheTraitementsDTO;


    this.reinitialiserDemarcheTraitement();

  }


  @Input("dateHeureDetail")
  public set dateHeuresDetail(dtHeureDetail: ChampsDatesCommunesDTO) {

    this.dateHeureDetail = dtHeureDetail;

  }



  //Les événements qui sont poussés au parent
  @Output()
  demarcheTraitementSave: EventEmitter<any> = new EventEmitter();

  @Output()
  demarcheTraitementDelete: EventEmitter<any> = new EventEmitter();

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

    // Alimente la liste des DemarcheTraitements.

    let titre: string;
    titre = this.translateService.instant('sigct.sa.f_appel.evaluation.dmrchtrait');
    this.messageSupprimerDemarcheTraitements = this.translateService.instant('sa-iu-a00001', { 0: titre });

    this.messageConfirmerDemarcheTraitements = this.translateService.instant('ss-iu-a30004', { 0: titre });

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

  @ViewChild("submitDemTraitBtn", { static: true })
  submitManifBtn: ElementRef;

  @ViewChild("liste_consulte", { static: true })
  listeConsulteHTML: SigctChosenComponent;


  /**
   * vérifie si la DemarcheTraitement est vide.  S'il est vide on soumet la page, sinon,
   * afficher une boite de dialogue.
   *
   * @param element
   */
  confirmerModifierDemarcheTraitement(element: any) {

    this.idElementSelectionne = element.id;
    this.getDemarcheTraitementDTOById(this.idElementSelectionne);
    let data = this.elementSelectionner;

    this.modifierDateHeuresDetail.emit(data);

  }

  isEmpty(str) {
    return (!str || 0 === str.length);
  }

  isIdentique(demt: DemarcheTraitementDTO): boolean {

    let resultat: boolean = false;

    if (this.demarcheTraitement.details == demt.details &&
      this.demarcheTraitement.referenceRessourceConsulte == demt.referenceRessourceConsulte &&
      this.demarcheTraitement.referenceResultatObtenu == demt.referenceResultatObtenu &&
      this.demarcheTraitement.traitement == demt.traitement
    ) {
      resultat = true;
    }

    //Si jamais la source est null, ce n'est pas nécessairement different.
    if (this.isEmpty(this.demarcheTraitement.details) &&
      this.isEmpty(this.demarcheTraitement.referenceRessourceConsulte) &&
      this.isEmpty(this.demarcheTraitement.referenceResultatObtenu) &&
      this.isEmpty(this.demarcheTraitement.traitement)) {
      resultat = true;
    }

    return resultat;
  }

  /**
   * Ouvre la boite de dialogue pour confirmer la suppression.
   * @param element
   */
  confirmerSupprimerDemarcheTraitement(element: any) {

    this.idElementSelectionne = element.id;
    this.idElementModifieSelectionne = this.idElementSelectionne;
    this.getDemarcheTraitementDTOById(this.idElementSelectionne);
    let data: DemarcheTraitementDTO = this.elementSelectionner;
    this.demarcheTraitement.id = data.id;

    this.demarcheTraitementDelete.emit(this.demarcheTraitement);


  }


  /**
   * Formate les liens d'action selon la présence ou l'absence d'une DemarcheTraitement.
   * @param DemarcheTraitement
   */
  formatActionDemarcheTraitement(demarcheTraitement: DemarcheTraitementDTO) {

    let anteStr: string;

    anteStr = '<div style="color:black;" >';



    if (demarcheTraitement.dateDemandeEvaluation) {
      let dateManif: Date = new Date(Number(demarcheTraitement.dateDemandeEvaluation));

      if (dateManif) {

        let datePipe = new DatePipe("fr-ca");

        anteStr += datePipe.transform(dateManif, 'yyyy-MM-dd') + ' ';


        if (demarcheTraitement.heures) {


          anteStr += demarcheTraitement.heures.substr(0, 2);

          anteStr += ':';

          anteStr += demarcheTraitement.heures.substr(2, 2) + ' ';
        }




      }

    }

    if (demarcheTraitement.detailDemandeEvaluation) {
      anteStr += " <span style='color:black;'>(<i>" + demarcheTraitement.detailDemandeEvaluation + "</i>)</span> ";
    }

    anteStr += " " + demarcheTraitement.ressourceConsulte + " ";

    if (demarcheTraitement.traitement) {

      anteStr += ", " + demarcheTraitement.traitement + " ";

    }

    if (demarcheTraitement.resultatObtenu) {
      anteStr += ", " + demarcheTraitement.resultatObtenu + " ";
    }


    anteStr += "  ";

    //Noir mais non en gras
    if (demarcheTraitement.details) {
      anteStr += " <span style='color:black;'>(<i>" + demarcheTraitement.details + "</i>)</span>";
    }

    anteStr += "</div>";

    return anteStr;

  }

  /**
   * obtenir l'objet DemarcheTraitementDTO a partir de son id
   * @param id
   */
  getDemarcheTraitementDTOById(id: number) {
    this.listeDemarcheTraitements.forEach(
      (demarcheTraitementDTO: DemarcheTraitementDTO) => {
        if (demarcheTraitementDTO.id == id) {
          this.elementSelectionner = demarcheTraitementDTO;
        }
      }
    )
  }

  /**
   * Remplace la DemarcheTraitement dans le formulaire.
   */
  remplacerDemarcheTraitement() {

    this.idElementModifieSelectionne = this.idElementSelectionne;
    this.getDemarcheTraitementDTOById(this.idElementSelectionne);
    let data: DemarcheTraitementDTO = this.elementSelectionner;
    this.demarcheTraitement.id = data.id;

    this.demarcheTraitement.details = data.details;

    this.demarcheTraitement.referenceRessourceConsulte = data.referenceRessourceConsulte;
    this.demarcheTraitement.referenceResultatObtenu = data.referenceResultatObtenu;

    this.demarcheTraitement.dateDemandeEvaluation = data.dateDemandeEvaluation;
    this.demarcheTraitement.detailDemandeEvaluation = data.detailDemandeEvaluation;

    this.demarcheTraitement.traitement = data.traitement;

    this.demarcheTraitement.heures = data.heures;


    this.demarcheTraitement.actif = data.actif;

    this.demarcheTraitement.execution = "demarcheTraitement";

    this.modifierDateHeuresDetail.emit(this.demarcheTraitement);

    this.closeModal('confirm_popup_modif_dem_trait');

    this.listeConsulteHTML.focus();

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
  onConsulteChange() {

    this.listeRessourceConsulte.forEach(item => {
      const refCode = Number(this.demarcheTraitement.referenceRessourceConsulte);

      if (item.id == refCode) {
        if (item.description != null) {
          this.infoBulleConsulte = item.description;
        } else {
          this.infoBulleConsulte = item.nom;
        }

      }
    });

    if (this.demarcheTraitement.referenceRessourceConsulte === null) {
      this.infoBulleConsulte = 'Sélectionnez...';
    }


  }

  /**
  * Met à jour l'infobulle de la ressource consulté.  Met la description si elle est
  * disponnible.
  */
  onResultatChange() {

    this.listeResultatObtenu.forEach(item => {
      const refCode = Number(this.demarcheTraitement.referenceResultatObtenu);

      if (item.id == refCode) {
        if (item.description != null) {
          this.infoBulleResultat = item.description;
        } else {
          this.infoBulleResultat = item.nom;
        }

      }
    });

    if (this.demarcheTraitement.referenceResultatObtenu === null) {
      this.infoBulleResultat = 'Sélectionnez...';
    }


  }



  /**
   * fonction generique de soumission du formulaire. simule le clique sur le bouton plus +
   */
  submitAction = () => {
    this.submitManifBtn.nativeElement.click();
  }

  supprimerDemarcheAnterieurTraitement() {

    this.idElementModifieSelectionne = this.idElementSelectionne;
    this.getDemarcheTraitementDTOById(this.idElementSelectionne);
    let data: DemarcheTraitementDTO = this.elementSelectionner;
    this.demarcheTraitement.id = data.id;

    this.demarcheTraitementDelete.emit(this.demarcheTraitement);


  }


  onSubmitDemarcheTraitement() {

    //this.detecterFicheActive();

    if (this.validerDemarcheTraitement()) {
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
      const msg = this.translateService.instant("sa-iu-a50003");
      messages.push(msg);

      this.creerErreurs(messages, 'Avertissement', AlertType.WARNING);

    }

    this.demarcheTraitement.idFicheAppel = this.idFiche;
    this.demarcheTraitement.valid = true;

    this.demarcheTraitementSave.emit(this.demarcheTraitement);

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
  reinitialiserDemarcheTraitement() {
    this.demarcheTraitement = new DemarcheTraitementDTO();

    // Transforme les valeurs par défaut en un objet dont les attributs correspondent aux controls du formulaire à "reseter".
    let valeursParDefaut: any = {
      id: null,
      ressourceConsulte: null,
      resultatObtenu: null,
      traitement: null,
      detail: null
    };

    // Réinitialise le formulaire avec les valeurs par défaut
    this.form.resetForm(valeursParDefaut);

    this.idElementModifieSelectionne = null;

    this.isConsulteValide = true;
    this.isResultatValide = true;

    this.closeModal('confirm_popup_supri_dem_trait');

  }

  resetChampsValides():void {
    this.isConsulteValide = true;
    this.isResultatValide = true;
  }
  //Libère les abonnements
  ngOnDestroy() {

    if (this.subscription) { this.subscription.unsubscribe(); }
    if (this.abonnementRessourceConsulte) { this.abonnementRessourceConsulte.unsubscribe(); }

  }


  isDemarcheTraitementVide(): boolean {

    if ((this.demarcheTraitement.details === undefined || this.demarcheTraitement.details === null) &&
      (this.demarcheTraitement.traitement === undefined || this.demarcheTraitement.traitement === null) &&
      (this.demarcheTraitement.referenceRessourceConsulte === undefined || this.demarcheTraitement.referenceRessourceConsulte === null) &&
      (this.demarcheTraitement.referenceResultatObtenu === undefined || this.demarcheTraitement.referenceResultatObtenu === null)) {
      return true;
    }
    return false;
  }

  /**
   * Lance un message d'erreur si la fiche d'appel n'est pas trouvée.
   */
  detecterFicheActive() {
    let messages: string[] = [];

    if (this.demarcheTraitement.idFicheAppel != null) {


      const msg = this.translateService.instant("ss-sv-e00023", { 0: 'this.demarcheTraitement.idFicheAppel' });
      messages.push(msg);

      this.creerErreurs(messages, this.libelleMessageErreur, AlertType.ERROR);


    } else {

      //Il n'y a pas de numéro de fiche d'appel actif
      const msg = this.translateService.instant("ss-sv-e00022");
      messages.push(msg);

      this.creerErreurs(messages, this.libelleMessageErreur, AlertType.ERROR);

    }
  }

  validerDemarcheTraitement(): boolean {

    let valide: boolean = true;

    let messages: string[] = [];

    //Vider les alertes déjà présentes
    if (this.alertStore.state) {
      this.alertStore.setState([]);
    }

    //A consulter null
    if (this.demarcheTraitement.referenceRessourceConsulte == null) {

      const msg = this.translateService.instant("sa-iu-e50001");
      messages.push(msg);


      valide = false;

      this.isConsulteValide = valide;

    }

    const dtHeure = this.dateHeureDetail.dateCommune;
    let heureCommune: number;

    if (dtHeure !== undefined && dtHeure !== null) {
      heureCommune = dtHeure.getHours();
      if (isNaN(heureCommune) || heureCommune === -1) {

        const msg = this.translateService.instant("sa-iu-e00016");
        messages.push(msg);

        valide = false;

        this.demarcheTraitement.valid = valide;

      }

    } else {
      if (!this.isEmpty(this.dateHeureDetail.heureCommune) && this.isEmpty(this.dateHeureDetail.dateCommune)) {

        const msg = this.translateService.instant("sa-iu-e00016");
        messages.push(msg);

        valide = false;

        this.demarcheTraitement.valid = valide;

      }

    }


    if (!valide) {

      this.creerErreurs(messages, this.libelleMessageErreur, AlertType.ERROR);

      this.demarcheTraitement.valid = false;
      this.demarcheTraitement.execution = 'valid';
      this.modifierDateHeuresDetail.emit(this.demarcheTraitement);
    }

    return valide;

  }

  isDoublon(): boolean {

    let rep: boolean = false;

    this.listeDemarcheTraitements.forEach((dem: DemarcheTraitementDTO) => {

      let condition1: boolean = (dem.referenceRessourceConsulte == this.demarcheTraitement.referenceRessourceConsulte);
      let condition2: boolean = (dem.referenceResultatObtenu == this.demarcheTraitement.referenceResultatObtenu);
      let condition3: boolean;

      if (this.dateHeureDetail.dateCommune && dem.dateDemandeEvaluation) {
        condition3 = (dem.dateDemandeEvaluation.toString() == this.dateHeureDetail.dateCommune.getTime().toString());
      } else {
        condition3 = (dem.dateDemandeEvaluation == null && this.dateHeureDetail.dateCommune == null);
      }



      if (condition1 &&
        condition2 &&
        condition3) {

        if ((dem.id != this.demarcheTraitement.id) || (this.demarcheTraitement.id === undefined)) {

          rep = true;

        }

      }
    });

    return rep;
  }


  onConsulteValide($event) {
    this.isConsulteValide = true;
  }

  onResultatValide($event) {
    this.isResultatValide = true;
  }

  openModalWithCustomisedMsgbyId(id: string, msg: string, idActivedButton) {
    this.messageConfirmerDemarcheTraitements = msg;
    this.openModal(id, idActivedButton);
  }

}
