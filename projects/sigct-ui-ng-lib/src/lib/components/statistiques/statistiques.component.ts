import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { BindingErrorsStore } from 'projects/sigct-service-ng-lib/src/lib/api-errors';
import { RaisonAppelDTO } from 'projects/sigct-service-ng-lib/src/lib/models/raison-appel-dto';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';
import { RoleActionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/role-action-dto';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import { ActionLinkItem } from 'projects/sigct-ui-ng-lib/src/lib/components/action-link/action-link.component';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { InputOption, InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { Subscription } from 'rxjs';
import { TypeficheSelectioneService } from '../grise-automatique-selon-type-intervention/grise-automatique-selon-type-intervention.component';

@Component({
  selector: 'app-statistiques',
  templateUrl: './statistiques.component.html',
  styleUrls: ['./statistiques.component.css']
})
export class StatistiquesComponent implements OnInit {

  //Conteneur pour les objets de transfert
  raisonAppel: RaisonAppelDTO = new RaisonAppelDTO();
  roleAction: RoleActionDTO = new RoleActionDTO();

  //Abonnements
  private subscription: Subscription = new Subscription();
  private abonnementRaison: Subscription;
  private abonnementRole: Subscription;


  //Liste des items dans la section de droite de l'interface
  public actionLinksRaison: ActionLinkItem[];
  public actionLinksRole: ActionLinkItem[];


  //Liste des éléments dans la section de droite
  public listeRaisonAppel: Array<RaisonAppelDTO> = new Array<RaisonAppelDTO>();
  public listeRoleAction: Array<RoleActionDTO> = new Array<RoleActionDTO>();

  //Liste des valeurs dans les listes déroulantes
  private listeRaison: Array<ReferenceDTO> = new Array<ReferenceDTO>();
  private listeRole: Array<ReferenceDTO> = new Array<ReferenceDTO>();


  //Objets de transfert sélectionné lors de recherche.
  private elementSelectionnerRaison: RaisonAppelDTO;
  private elementSelectionnerRole: RoleActionDTO;

  public messageConfirmerAjout: string;
  public libelleMessageErreur: string;


  //Indicateur que les listes sont invalides
  public isRaisonAppelValide: boolean = true;
  public isRoleActionValide: boolean = true;

  public readOnly: string = '';

  private idElementSelectionne: number = null;
  public idElementModifieSelectionne: number = null;

  messageSupprimerRaisonAppel: any;
  messageSupprimerRoleAction: any;

  public typeFiche: TypeficheSelectioneService;

  @Input()
  public isDisabled = false;

  constructor(
    public alertStore: AlertStore,
    public bindingErrorsStore: BindingErrorsStore,
    private translateService: TranslateService,
    private modalConfirmService: ConfirmationDialogService,
    private typeFicheSelectioneService: TypeficheSelectioneService,
    //private referencesService: ReferencesApiService,
  ) {
    this.typeFiche = this.typeFicheSelectioneService;
  }


  /**
   * Peuple la liste raison d'intervention sauvegardes dans la base de donnees
   */
  @Input("listeRaisonAppel")
  public set listeraisonAppels(raisonAppelsDTO: RaisonAppelDTO[]) {

    this.listeRaisonAppel = new Array<RaisonAppelDTO>();
    this.listeRaisonAppel = raisonAppelsDTO;

    this.reinitialiserRaisonAppel();

  }

  /**
   * Peuple la liste raison d'intervention sauvegardes dans la base de donnees
   */
  @Input("listeRoleAction")
  public set listeroleActions(roleActionsDTO: RoleActionDTO[]) {

    this.listeRoleAction = new Array<RoleActionDTO>();
    this.listeRoleAction = roleActionsDTO;

    this.reinitialiserRoleAction();

  }


  @Input("listeReferenceRaison")
  public set listeReferenceRaison(values: ReferenceDTO[]) {
    if (values) {
      this.listeRaison = values;
      this.populatePlaylistOptions(values,  this.inputOptionsRaisonAppel);
    }
  }

  /**
   * Peuple la liste raison d'intervention sauvegardes dans la base de donnees
   */
  @Input("listeReferenceRole")
  public set listeReferenceRole(values: ReferenceDTO[]) {
    if (values) {
      this.listeRole = values;
      this.populatePlaylistOptions(values, this.inputOptionsRoleAction);
    }
  }

  //Les événements qui sont poussés au parent
  @Output()
  raisonAppelSave: EventEmitter<any> = new EventEmitter();

  @Output()
  raisonAppelDelete: EventEmitter<any> = new EventEmitter();

  @Output()
  roleActionSave: EventEmitter<any> = new EventEmitter();

  @Output()
  roleActionDelete: EventEmitter<any> = new EventEmitter();

  //Conteneur pour la liste de valeurs
  public inputOptionsRaisonAppel: InputOptionCollection = {
    name: "raisons appel",
    options: []
  };

  //Conteneur pour la liste de valeurs
  public inputOptionsRoleAction: InputOptionCollection = {
    name: "roles action",
    options: []
  };

  @ViewChild("fComRaison", { static: true })
  formRaison: NgForm;

  @ViewChild("fComRole", { static: true })
  formRole: NgForm;

  @ViewChild("submitRaisonAppelBtn", { static: true })
  submitRaisonAppelBtn: ElementRef;

  @ViewChild("submitRoleActionBtn", { static: true })
  submitRoleActionBtn: ElementRef;


  ngOnInit() {

    this.subscription.add(
      this.translateService.get(["sigct.ss.error.label", "sigct.ss.f_appel.compflechebleue.btnajouter", "option.select.message"]).subscribe(
        (messages: string[]) => {
          this.libelleMessageErreur = messages["sigct.ss.error.label"];

          //Initialisation des action links pour les flèches bleus
          this.actionLinksRaison = [{ action: this.submitActionRaison, icon: "fa fa-arrow-right fa-2x", label: messages["sigct.ss.f_appel.compflechebleue.btnajouter"] }];
          this.actionLinksRole = [{ action: this.submitActionRole, icon: "fa fa-arrow-right fa-2x", label: messages["sigct.ss.f_appel.compflechebleue.btnajouter"] }];

          this.inputOptionsRaisonAppel.options.push({ label: messages["option.select.message"], value: null });
          this.inputOptionsRoleAction.options.push({ label: messages["option.select.message"], value: null });
        })
    );

    let titre: string;
    titre = this.translateService.instant('sigct.ss.f_appel.terminaison.statistiques.raisonintervention');
    this.messageSupprimerRaisonAppel = this.translateService.instant('ss-iu-a30002', { 0: titre });

    titre = this.translateService.instant('sigct.ss.f_appel.terminaison.statistiques.roleaction');
    this.messageSupprimerRoleAction = this.translateService.instant('ss-iu-a30002', { 0: titre });
  }

  private populatePlaylistOptions(playlist: ReferenceDTO[], playlistOptions: InputOptionCollection): void {
    playlist.forEach((item: ReferenceDTO) => {
      let labelStr: string = item.nom;
        if(item.codeCn) {
          labelStr = item.codeCn + ' - ' + labelStr;
        }
      playlistOptions.options.push({ label: labelStr, value: item.code, description: item.description });
    });
  }

  resetChampsValides():void {
    this.isRaisonAppelValide = true;
    this.isRoleActionValide = true;
  }

  /**
   * Ouvre la boite de dialogue pour confirmer la suppression.
   * @param element
   */
  confirmerSupprimerRaisonAppel(element: any) {

    this.idElementSelectionne = element.id;
    this.idElementModifieSelectionne = this.idElementSelectionne;
    this.getRaisonAppelDTOById(this.idElementSelectionne);
    let data: RaisonAppelDTO = this.elementSelectionnerRaison;
    this.raisonAppel.id = data.id;

    this.raisonAppelDelete.emit(this.raisonAppel);
    
  }

  /**
   * Ouvre la boite de dialogue pour confirmer la suppression.
   * @param element
   */
  confirmerSupprimerRoleAction(element: any) {

    this.idElementSelectionne = element.id;  
    this.idElementModifieSelectionne = this.idElementSelectionne;
    this.getRoleActionDTOById(this.idElementSelectionne);
    let data: RoleActionDTO = this.elementSelectionnerRole;
    this.roleAction.id = data.id;

    this.roleActionDelete.emit(this.roleAction);

  }


  /**
   * Formate les liens d'action selon la présence ou l'absence d'une raison d'appel
   * @param raisonAppelDTO
   */
  formatActionRaisonAppel(raisonAppel: RaisonAppelDTO) {

    let anteStr: string;

    anteStr = '<div class="ellipsis" title="' + raisonAppel.referenceRaisonAppelNom + '" >';

    let fullName: string = raisonAppel.referenceRaisonAppelNom;
    if(raisonAppel.referenceRaisonAppelCodeCn) {
      fullName = raisonAppel.referenceRaisonAppelCodeCn + ' - ' + fullName;
    }

    anteStr += fullName;

    anteStr += "</div>";

    return anteStr;

  }

  /**
 * Formate les liens d'action selon la présence ou l'absence d'une raison d'appel
 * @param raisonAppelDTO
 */
  formatActionRoleAction(roleAction: RoleActionDTO) {

    let anteStr: string;

    anteStr = '<div class="ellipsis" title="' + roleAction.referenceRoleActionNom + '" >';

    let fullName: string = roleAction.referenceRoleActionNom;
    if(roleAction.referenceRoleActionCodeCn) {
      fullName = roleAction.referenceRoleActionCodeCn + ' - ' + fullName;
    }

    anteStr += fullName;

    anteStr += "</div>";

    return anteStr;

  }

  /**
   * obtenir l'objet raisonAppelDTO a partir de son id
   * @param id
   */
  private getRaisonAppelDTOById(id: number) {
    this.listeRaisonAppel.forEach(
      (raisonAppelDTO: RaisonAppelDTO) => {
        if (raisonAppelDTO.id == id) {
          this.elementSelectionnerRaison = raisonAppelDTO;
        }
      }
    )
  }

  /**
   * obtenir l'objet roleActionDTO a partir de son id
   * @param id
   */
  private getRoleActionDTOById(id: number) {
    this.listeRoleAction.forEach(
      (roleActionDTO: RoleActionDTO) => {
        if (roleActionDTO.id == id) {
          this.elementSelectionnerRole = roleActionDTO;
        }
      }
    )
  }

  /**
   * fontions generiques pour ouvrir et fermer une fenetre modal popup
   */
  private openModal(id: string, btn: string) {
    this.modalConfirmService.openAndFocus(id, btn);
  }

  private closeModal(id: string) {
    try {
      this.modalConfirmService.close(id);
      //Intercepte la fermeture de page modal non ouverte.
    } catch (e) {

    }

  }

  /**
   * fonction generique de soumission du formulaire. simule le clique sur le bouton plus +
   */
  submitActionRaison = () => {
    this.submitRaisonAppelBtn.nativeElement.click();
  }

  submitActionRole = () => {
    this.submitRoleActionBtn.nativeElement.click();
  }



  supprimerRoleAction() {

    this.idElementModifieSelectionne = this.idElementSelectionne;
    this.getRoleActionDTOById(this.idElementSelectionne);
    let data: RoleActionDTO = this.elementSelectionnerRole;
    this.roleAction.id = data.id;

    this.roleActionDelete.emit(this.roleAction);

  }


  onSubmitRaisonAppel() {

    if (this.validerRaisonAppel()) {
      this.saveDonneesRaison();
    }

  }

  onSubmitRoleAction() {

    if (this.validerRoleAction()) {
      this.saveDonneesRole();
    }

  }

  //Sauvegarder les données
  private saveDonneesRaison(): void {
    //Vider les alertes déjà présentes
    this.alertStore.resetAlert();

    this.raisonAppel.valid = true;

    this.raisonAppelSave.emit(this.raisonAppel);

  }

  private saveDonneesRole(): void {
    //Vider les alertes déjà présentes
    this.alertStore.resetAlert();

    this.roleAction.valid = true;

    this.roleActionSave.emit(this.roleAction);

  }

  /**
   * Méthode pour afficher un message d'erreur du service.
   * @param err
   */
  private creerErreur(err: string) {
    let messages: string[] = [];
    messages.push(err);

    const alertM: AlertModel = AlertModelUtils.createAlertModel(messages, this.libelleMessageErreur, AlertType.ERROR);

    this.alertStore.addAlert(alertM);
  }

  //Messages d'erreurs de validation
  private creerErreurs(messages: string[]) {

    const alertM: AlertModel = AlertModelUtils.createAlertModel(messages, this.libelleMessageErreur, AlertType.ERROR);

    this.alertStore.addAlert(alertM);
  }

  /**
   * Réinitialiser le formulaire d'édition des raison d'intervention.
   */
  public reinitialiserRaisonAppel() {
    this.raisonAppel = new RaisonAppelDTO();
    this.raisonAppel.valid = true;

    this.isRaisonAppelValide = true;

    // Transforme les valeurs par défaut en un objet dont les attributs correspondent aux controls du formulaire à "reseter".
    let valeursParDefaut: any = {
      id: null,
      raison: null,
    };

    // Réinitialise le formulaire avec les valeurs par défaut
    this.formRaison.resetForm(valeursParDefaut);

    this.idElementModifieSelectionne = null;


  }

  public reinitialiserRoleAction() {
    this.roleAction = new RoleActionDTO();
    this.roleAction.valid = true;

    this.isRoleActionValide = true;

    // Transforme les valeurs par défaut en un objet dont les attributs correspondent aux controls du formulaire à "reseter".
    let valeursParDefaut: any = {
      id: null,
      role: null,
    };

    // Réinitialise le formulaire avec les valeurs par défaut
    this.formRole.resetForm(valeursParDefaut);

    this.idElementModifieSelectionne = null;

    this.closeModal('confirm_popup_supri_role_action');

  }

  //Libère les abonnements
  ngOnDestroy() {

    if (this.subscription) { this.subscription.unsubscribe(); }
    if (this.abonnementRaison) { this.abonnementRaison.unsubscribe(); }
    if (this.abonnementRole) { this.abonnementRole.unsubscribe(); }

    this.alertStore.resetAlert();

  }

  private validerRaisonAppel(): boolean {

    let valide: boolean = true;

    let messages: string[] = [];

    //Vider les alertes déjà présentes
    this.alertStore.resetAlert();

    //A consulter null
    if (this.raisonAppel.referenceRaisonAppelCode === null || this.raisonAppel.referenceRaisonAppelCode === undefined) {

      const champ = this.translateService.instant("sigct.ss.f_appel.terminaison.statistiques.raisonintervention");
      const msg = this.translateService.instant("general.msg.obligatoire", { 0: champ });
      messages.push(msg);

      valide = false;

      this.isRaisonAppelValide = valide;

    }


    if (!valide) {

      this.creerErreurs(messages);

      this.raisonAppel.valid = false;
    }

    return valide;

  }

  private validerRoleAction(): boolean {

    let valide: boolean = true;

    let messages: string[] = [];

    //Vider les alertes déjà présentes
    this.alertStore.resetAlert();

    //A consulter null
    if (this.roleAction.referenceRoleActionCode === null || this.roleAction.referenceRoleActionCode === undefined) {

      const champ = this.translateService.instant("sigct.ss.f_appel.terminaison.statistiques.roleaction");
      const msg = this.translateService.instant("general.msg.obligatoire", { 0: champ });
      messages.push(msg);

      valide = false;

      this.isRoleActionValide = valide;

    }

    if (!valide) {

      this.creerErreurs(messages);

      this.roleAction.valid = false;
    }

    return valide;

  }


  onRaisonChange(option: InputOption) {
    this.isRaisonAppelValide = true;
  }

  onRoleChange(option: InputOption) {
    this.isRoleActionValide = true;
  }

  onNgModelChange() {
    this.isRaisonAppelValide = true;
  }

  onNgModelChangeRole() {
    this.isRoleActionValide = true;
  }

  /**
   * Vérifie si tous les champs du formulaire "Raison d'intervention" sont vides.
   */
  public isFormulaireRaisonInterventionVide(): boolean {
    return !this.raisonAppel || !this.raisonAppel.referenceRaisonAppelCode;
  }

  /**
   * Vérifie si tous les champs du formulaire "Rôle-action" sont vides.
   */
  public isFormulaireRoleActionVide(): boolean {
    return !this.roleAction || !this.roleAction.referenceRoleActionCode;
  }
}
