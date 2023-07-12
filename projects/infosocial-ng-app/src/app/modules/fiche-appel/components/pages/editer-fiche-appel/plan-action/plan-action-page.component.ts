import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, UrlTree } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EnumUrlPageFicheAppelSocial, FicheAppelSocialDTO, MoyenSocialDTO, ReferenceDTO } from 'projects/infosocial-ng-core/src/lib/models';
import { ReferencesApiService } from 'projects/infosocial-ng-core/src/lib/services';
import { FicheAppelApiService } from 'projects/infosocial-ng-core/src/lib/services/fiche-appel-api.service';
import { FicheAppelDataService, SectionFicheAppelEnum } from 'projects/infosocial-ng-core/src/lib/services/fiche-appel-data.service';
import { MoyenSocialService } from 'projects/infosocial-ng-core/src/lib/services/moyen-social-service';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { BindingErrorsStore } from 'projects/sigct-service-ng-lib/src/lib/api-errors/binding-errors.store';
import { OrientationSuitesInterventionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/orientation-suites-intervention-dto';
import { ReferenceSuitesInterventionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-suites-intervention-dto';
import { StatutFicheAppelEnum } from 'projects/sigct-service-ng-lib/src/lib/models/statut-fiche-appel.enum';
import { SigctOrientationSuitesInterventionService } from 'projects/sigct-service-ng-lib/src/lib/services/sigct-orientation-suites-intervention.service';
import { SigctReferenceSuitesInterventionService } from 'projects/sigct-service-ng-lib/src/lib/services/sigct-reference-suites-intervention.service';
import { AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import { TypeficheSelectioneService } from 'projects/sigct-ui-ng-lib/src/lib/components/grise-automatique-selon-type-intervention/grise-automatique-selon-type-intervention.component';
import { InputTextAreaComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/input-textarea/input-textarea.component';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { SigctOrientationSuitesInterventionComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-orientation-suites-intervention/sigct-orientation-suites-intervention.component';
import { SigctReferenceSuitesInterventionComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-reference-suites-intervention/sigct-reference-suites-intervention.component';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { iif, Observable, of, Subscription } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { BaseFicheAppelPage } from '../base-fiche-appel-page/base-fiche-appel-page';

@Component({
  selector: 'plan-action-page',
  templateUrl: './plan-action-page.component.html',
  styleUrls: ['./plan-action-page.component.css']
})
export class PlanActionPageComponent extends BaseFicheAppelPage implements OnInit, OnDestroy {

  @ViewChild('PremierElem', { static: true }) private difficultePriorisee: InputTextAreaComponent;

  @ViewChild('orientation', { static: true }) private appOrientation: SigctOrientationSuitesInterventionComponent;

  @ViewChild("referenceSuitesIntervention", { static: true }) private appReferenceSuitesIntervention: SigctReferenceSuitesInterventionComponent;

  ficheAppelSocialDto = new FicheAppelSocialDTO();
  idMoyenSocialToDelete: number;
  messageConfirmDeleteReferentiel: string;
  mandatoryFields = ["difficultePriorisee", "objectifAatteindre"];
  
  private readonly pageApiUpdateEndPoint = EnumUrlPageFicheAppelSocial.PLAN_ACTION;

  private abonnementFiche: Subscription;
  private abonnementSave: Subscription;
  private abonnementRefOrienation: Subscription;
  private abonnementOrientation: Subscription;
  private abonnementListeOrientation: Subscription;

  private subscription: Subscription = new Subscription();

  private labelSauvegardeReussi: string;
  private labelErreur: string;
  public listeRefOrientationSocial: Array<ReferenceDTO> = new Array<ReferenceDTO>();
  public listeOrientationRrss: Array<OrientationSuitesInterventionDTO>;
  public listeReferenceSuitesIntervention: ReferenceSuitesInterventionDTO[];
  public listeRefReferenceSuitesIntervention: ReferenceDTO[] = [];

  public moyenSocialDTOs: MoyenSocialDTO[] = [];

  private urlApi: string = window["env"].urlInfoSocial + '/api';

  public inputOptionAucuneSuite: InputOptionCollection = {
    name: "acunesuite",
    options: [{ label: 'sigct.so.f_appel.planaction.suitesintervention.aucunesuite', value: 'false' }]
  };

  public inputOptionAutorisationTransmission: InputOptionCollection = {
    name: "autorisationtransmission",
    options: [{ label: 'sigct.so.f_appel.planaction.suitesintervention.autorisation', value: 'false' }]
  };

  public inputOptionConsentementenFicheEnregistreur: InputOptionCollection = {
    name: "consentementenOrganismesEnregistreurs",
    options: [{ label: 'sigct.so.f_appel.planaction.suitesintervention.consentementenregistreurs', value: 'false' }]
  };

  aucuneSuiteDisabled: boolean;
  autorisationTransmissionDisabled: boolean;
  consentementenFicheEnregistreurDisabled: boolean;

  constructor(private ficheAppelApiService: FicheAppelApiService,
    private ficheAppelDataService: FicheAppelDataService,
    private translateService: TranslateService,
    private alertStore: AlertStore,
    private route: ActivatedRoute,
    private router: Router,
    private bindingErrorsStore: BindingErrorsStore,
    private referencesService: ReferencesApiService,
    private orientationSuitesInterventionService: SigctOrientationSuitesInterventionService,
    private referenceSuitesInterventionService: SigctReferenceSuitesInterventionService,
    private moyenSocialService: MoyenSocialService,
    private modalConfirmService: ConfirmationDialogService,
    private appContextStore: AppContextStore
  ) {
    super(ficheAppelDataService);
  }

  ngOnInit() {
    // Initialisation du BaseFicheAppelPageComponent
    super.ngOnInit();
        

    this.subscriptions.add(
      this.translateService.get(["ss-iu-c00002", "girpi.error.label"]).subscribe((messages: string[]) => {
        this.labelSauvegardeReussi = messages["ss-iu-c00002"];
        this.labelErreur = messages["girpi.error.label"];
      })
    );

    this.initDomainesvaleurs();

    this.chargerDonnees(this.ficheAppelDataService.getIdFicheAppelActive());
    this.initSectionsFlecheBleu();

  }

  ngOnDestroy() {
    super.ngOnDestroy();

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (this.abonnementFiche) { this.abonnementFiche.unsubscribe(); }
    if (this.abonnementSave) { this.abonnementSave.unsubscribe(); }
    if (this.abonnementRefOrienation) { this.abonnementRefOrienation.unsubscribe(); }
    if (this.abonnementOrientation) { this.abonnementOrientation.unsubscribe(); }
    if (this.abonnementListeOrientation) { this.abonnementListeOrientation.unsubscribe(); }

    // Vide la liste des messages pour ne pas qu'ils s'affichent sur la prochaine page.
    if (this.alertStore) {
      this.alertStore.resetAlert();
    }

  }

  //Charger les données de bases nécessaire à l'écran
  private initDomainesvaleurs() {

    //Charger les références de ressouce consulté pour consultation antérieure
    if (this.abonnementRefOrienation) { this.abonnementRefOrienation.unsubscribe(); }
    this.abonnementRefOrienation = this.referencesService.getListeOrientation().subscribe(
      (ref: ReferenceDTO[]) => {
        this.listeRefOrientationSocial = ref;
      }
    );

    this.chargerRefReferenceSuitesIntervention();
  }

  /**
   * Lorsque le bouton Annuler est cliqué.
   */
  onAnnuler(): void {

    //Vider les alertes déjà présentes
    if (this.alertStore.state) {
      this.alertStore.resetAlert();
    }

    this.chargerDonnees(this.ficheAppelDataService.getIdFicheAppelActive());
    this.initSectionsFlecheBleu();
  }

  /**
   * Lorsqu'une navigation "externe" est enclenchée.
   * IMPORTANT: On doit sauvegarder les données à l'aide de navigation.sendBeacon()
   */
  autoSaveBeforeUnload(): void {
    // Sauvegarde possible uniquement si le statut de la fiche est OUVERT.
    if (StatutFicheAppelEnum.OUVERT == this.ficheAppelSocialDto?.statut) {
      this.ficheAppelApiService.autoSaveFicheAppel(this.ficheAppelSocialDto, this.pageApiUpdateEndPoint);
    }
  }

  /**
   * Lorsqu'une navigation "interne" est enclenchée. Le routing attend une réponse positive de cette méthode avant
   * de s'exécuter, laissant le temps de sauvegarder les données avant de poursuivre.
   */
  autoSaveBeforeRoute(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.alertStore.resetAlert();

    // Parce que la fiche peut avoir été fermé dans un autre onglet du navigateur, 
    // on récupère le statut de la fiche en BD.
    return this.ficheAppelApiService.getStatutFicheAppel(this.ficheAppelDataService.getIdFicheAppelActive()).pipe(
      mergeMap((statut: StatutFicheAppelEnum) =>
        // Sauvegarde possible uniquement si le statut de la fiche est OUVERT.
        iif(() => statut == StatutFicheAppelEnum.OUVERT,
          // Si ouvert: la fiche est ouverte, on la sauvegarde
          this.saveDonnes(false),
          // Sinon : la fiche n'est plus Ouverte, on retourne un UrlTree pour redirection vers la consultation.
          of(this.router.createUrlTree(["/editer", "appel", this.ficheAppelDataService.getIdAppel(), "fiche", this.ficheAppelDataService.getIdFicheAppelActive(), "consultation"])))
      )
    );
  }

  /**
   * Lorsque la fiche active change (lors d'un changement d'onglet).
   * @param idFicheAppel identifiant de la nouvelle fiche d'appel active
   */
  onFicheAppelActiveChange(idFicheAppel: number): void {
    this.chargerDonnees(idFicheAppel);
    this.initSectionsFlecheBleu();
  }

  /**
   * Lorsque le bouton Sauvegarder est cliqué.
   */
  onSauvegarder(): void {
    this.appOrientation.resetChampsValides();
    this.appReferenceSuitesIntervention.resetChampsValides();
    if (this.abonnementSave) { this.abonnementSave.unsubscribe(); }
    this.abonnementSave = this.saveDonnes(true).subscribe();
  }

  /**
   * Permet de charger les données
   */
  private chargerDonnees(idFicheAppel: number) {
    this.listeOrientationRrss = null;
    this.listeReferenceSuitesIntervention = null;
    if (this.abonnementFiche) { this.abonnementFiche.unsubscribe(); }
    this.abonnementFiche = this.ficheAppelApiService.getFicheAppel(idFicheAppel).subscribe((fiche: FicheAppelSocialDTO) => {
      this.ficheAppelSocialDto = fiche;

      this.difficultePriorisee.focus();

      this.chargerReferentielsRelies(fiche.id);
      this.chargerOrientation(fiche.id);
      this.chargerReferenceSuitesIntervention();
         // Update the mandatoryFields based on the selected value
         if ( this.ficheAppelSocialDto.codeReferenceTypeFiche === "DETAIL") {
          this.mandatoryFields = ["difficultePriorisee", "objectifAatteindre"];
        } else if ( this.ficheAppelSocialDto.codeReferenceTypeFiche === "ABREG") {
          this.mandatoryFields = ["objectifAatteindre"];
        }else {
          this.mandatoryFields = []; // Reset the mandatoryFields if no matching value
        }
    });
   
  }


  //Sauvegarder les données
  saveDonnes(avecAlerte: boolean): Observable<boolean> {
    // Sauvegarde possible uniquement si le statut de la fiche est OUVERT.
    if (StatutFicheAppelEnum.FERME == this.ficheAppelSocialDto?.statut) {
      this.afficherErreur(this.translateService.instant("ss-sv-e00001"));
      return of(true);
    } else if (!this.ficheAppelSocialDto?.id) {
      return of(false);
    }
    //Vider les alertes déjà présentes
    if (this.alertStore.state) {
      this.alertStore.resetAlert();
    }
    if (avecAlerte) {
      this.validationFormulaireVide();
    }

    return this.ficheAppelApiService.updateFicheAppel(this.ficheAppelSocialDto, this.pageApiUpdateEndPoint).pipe(map((fiche: FicheAppelSocialDTO) => {

      //Il n'y a pas d'alert quand c'est auto-save
      if (avecAlerte) {
        if (fiche) {
          this.afficheMessageValidationFinales(fiche.validationsFinales);
          this.afficheMessageAvertissements(fiche.avertissements);
        }

        this.afficherMessageSauvegardeReussie();
      }

      return true;
    }));

  }

  /**
 * Pour chaque formulaire présent dans la section on vérifie s'il est vide
 * Si ce n'est pas le cas on affiche un message d'avertissement
 */
  private validationFormulaireVide() {

    let orientationVide: boolean = this.appOrientation.isEmptyForm();
    let referenceSuitesInterventionVide: boolean = this.appReferenceSuitesIntervention.isEmptyForm();

    let messages: string[] = [];

    if (!orientationVide) {
      const titre = this.translateService.instant("sigct.ss.f_appel.suitesintervention.orientation")
      const msg = this.translateService.instant("ss-iu-a30000", { 0: titre });
      messages.push(msg);
    }

    if (!referenceSuitesInterventionVide) {
      const titre = this.translateService.instant("sigct.ss.f_appel.suitesintervention.reference")
      const msg = this.translateService.instant("ss-iu-a30000", { 0: titre });
      messages.push(msg);
    }

    if (messages.length > 0) {
      this.afficherMessages(messages, "Avertissement", AlertType.WARNING);
    }

  }
  /**
   * Affiche le message de confirmation de sauvegarde
   */
  private afficherMessageSauvegardeReussie(): void {
    let msg: string[] = [];
    let title = this.translateService.instant("ss.msg.succes.confirmation");
    msg.push(this.translateService.instant("ss.msg.succes.confirmation.text"));
    let alertModel: AlertModel = AlertModelUtils.createAlertModel(msg, title, AlertType.SUCCESS);

    this.alertStore.addAlert(alertModel);
    this.bindingErrorsStore.setState({});
  }

  /**
  * Afficher les messages du backend a l'ecran
  * @param validationsFinales
  */
  private afficheMessageValidationFinales(validationsFinales: Map<string, string>): void {
    const alertModel: AlertModel = AlertModelUtils.createAlertModelValidationFinales(validationsFinales, "Validation finale");
    if (alertModel) {
      this.alertStore.addAlert(alertModel);
    }
  }

  /**
   * Afficher les messages du backend a l'ecran
   * @param avertissements
   */
  private afficheMessageAvertissements(avertissements: Map<string, string>): void {
    const alertModel: AlertModel = AlertModelUtils.createAlertModelAvertissements(avertissements, "Avertissements");
    if (alertModel) {
      this.alertStore.addAlert(alertModel);
    }
  }

  /**
   * Affiche
   * @param messages contient le(s) message(s) à afficher
   * @param titre Titre du bloc erreur
   * @param erreurType Type de message
   */
  private afficherMessages(messages: string[], titre: string, erreurType: AlertType) {

    const alertM: AlertModel = new AlertModel();
    alertM.title = titre;
    alertM.type = erreurType;
    alertM.messages = messages;

    this.alertStore.addAlert(alertM);
  }

  public onOrientationSave(orientation: OrientationSuitesInterventionDTO): void {
    if (this.alertStore) {
      this.alertStore.resetAlert();
    }

    orientation.idFicheAppel = this.ficheAppelSocialDto.id;
    if (orientation.id == null) {

      if (this.abonnementOrientation) { this.abonnementOrientation.unsubscribe(); }
      this.abonnementOrientation = this.orientationSuitesInterventionService.create(this.urlApi, orientation).subscribe(() => {
        this.chargerOrientation(orientation.idFicheAppel);
        this.appOrientation.reinitialiserChamp();
      }, (err) => {
      });
    }
  }

  onAjoutReferenceSuitesIntervention(referenceSuitesIntervention: ReferenceSuitesInterventionDTO) {
    this.subscription.add(
      this.referenceSuitesInterventionService.create(this.urlApi, referenceSuitesIntervention)
        .subscribe(() => this.chargerReferenceSuitesIntervention())
    );
    this.appReferenceSuitesIntervention.resetForm();
  }

  onSupprimerReferenceSuitesIntervention(idReference: number) {
    this.subscription.add(
      this.referenceSuitesInterventionService.delete(this.urlApi, idReference)
        .subscribe(() => this.chargerReferenceSuitesIntervention())
    );
  }

  chargerReferenceSuitesIntervention(): void {
    this.subscription.add(
      this.referenceSuitesInterventionService.findAll(this.urlApi, this.ficheAppelSocialDto.id)
        .subscribe((referencesSuitesIntervention: ReferenceSuitesInterventionDTO[]) => {
          this.listeReferenceSuitesIntervention = referencesSuitesIntervention;
          this.checkAucuneSuite();
        })
    );
  }

  /**Charger les références de la reference des suites d'intervention */
  private chargerRefReferenceSuitesIntervention(): void {
    this.subscription.add(
      this.referencesService.getListeReference()
        .subscribe((refReference: ReferenceDTO[]) => this.listeRefReferenceSuitesIntervention = refReference)
    );
  }

  //Consulter un référentiel
  consultReferentiel(consultData: any): void {
    let ficheAppelSocialDto: FicheAppelSocialDTO = this.ficheAppelDataService.getFicheAppelActive();
    this.appContextStore.setvalue("contextConsultationReferentiel", true);
    this.appContextStore.setvalue("consultData", consultData);

    let target = "/editer/appel/" + ficheAppelSocialDto.idAppel + "/fiche/" + ficheAppelSocialDto.id + "/protocoles"
    this.router.navigate([target]);
  }

  //Alimente la liste des référentiels reliés à une fiche d'appel.
  chargerReferentielsRelies(idFicheAppel: number): void {
    if (idFicheAppel) {
      this.subscription.add(this.moyenSocialService.getListeMoyen(idFicheAppel).subscribe(moyenSocialDTOResult => {
        if (moyenSocialDTOResult) {
          this.moyenSocialDTOs = moyenSocialDTOResult;
        }
      }));
    }

  }
  //Alimente la liste des orientations mémorisés dans la BD.
  chargerOrientation(idFicheAppel: number): void {

    if (this.abonnementListeOrientation) { this.abonnementListeOrientation.unsubscribe(); }
    this.abonnementListeOrientation = this.orientationSuitesInterventionService.getListOrientations(this.urlApi, idFicheAppel).subscribe(
      (orientations: OrientationSuitesInterventionDTO[]) => {
        this.listeOrientationRrss = orientations;
        this.checkAucuneSuite();
      });
  }

  confirmerDeleteReferentiel(deleteData: any): void {
    this.idMoyenSocialToDelete = deleteData.id;
    this.messageConfirmDeleteReferentiel = this.translateService.instant("ss-iu-a30002", { 0: deleteData.nomReferentiel });
    this.openModal('confirm_popup_delete_referentiel', 'delete_moyen_btn_oui');
  }

  deleteReferentiel(): void {
    this.closeModal('confirm_popup_delete_referentiel');
    let idFicheAppel = this.ficheAppelDataService.getIdFicheAppelActive();
    if (idFicheAppel) {
      this.subscription.add(this.moyenSocialService.deleteMoyen(idFicheAppel, this.idMoyenSocialToDelete).subscribe(() => {
        this.chargerReferentielsRelies(idFicheAppel);
      }));
    }
  }

  //Supprime une médication de la liste.
  onOrientationDelete(orientation: OrientationSuitesInterventionDTO): void {

    if (this.abonnementOrientation) { this.abonnementOrientation.unsubscribe(); }
    this.abonnementOrientation = this.orientationSuitesInterventionService.delete(this.urlApi, +orientation.id).subscribe(res => {
      //Met à jour la liste dans la vue.
      this.chargerOrientation(this.ficheAppelSocialDto.id);
    }, (err) => {
      this.afficherErreur(err.toString());
    });

  }

  onConsulterAvis(idAvis: number) {
    this.router.navigate(["../" + SectionFicheAppelEnum.AVIS], { relativeTo: this.route, queryParams: { idAvis: idAvis } });
  }

  openModal(id: string, btn: string) {
    this.modalConfirmService.openAndFocus(id, btn);
  }

  closeModal(id: string) {
    this.modalConfirmService.close(id);
  }

  /**
   * Méthode pour afficher un message d'erreur du service.
   * @param err
   */
  private afficherErreur(err: any) {
    let messages: string[] = [];
    const msg = err;
    messages.push(msg);

    const alertM: AlertModel = new AlertModel();
    alertM.title = this.labelErreur;
    alertM.type = AlertType.ERROR;
    alertM.messages = messages;

    this.alertStore.addAlert(alertM);
  }

  /**
   * Cette méthode permet d'initialiser tous les champs de tous les composants que l'on nomme "flèche bleu"
   */
  private initSectionsFlecheBleu(): void {
    this.appOrientation.reinitialiserChamp();
    this.appReferenceSuitesIntervention.resetForm();
  }

  /**
   * Vérifie si orientation ou reference sont ont au moins un item
   * Si c'est le cas on désactive la case à cocher aucune suite ET si elle était coché on la décoche puis on sauvegarde la fiche d'appel dans la BD
   * Ainsi les données sont cohérentes entre l'interface et la BD
   */
  private checkAucuneSuite() {

    let orientationPresente: boolean = false;
    let referenceSuitesInterventionPresente: boolean = false;

    if (this.listeOrientationRrss
      && this.listeOrientationRrss.length > 0) {
      orientationPresente = true;
    }

    if (this.listeReferenceSuitesIntervention
      && this.listeReferenceSuitesIntervention.length > 0) {
      referenceSuitesInterventionPresente = true;
    }

    this.aucuneSuiteDisabled = false;
    if (orientationPresente || referenceSuitesInterventionPresente) {
      this.aucuneSuiteDisabled = true;
    }

    //La case à cocher Aucune suite est cochée ET on la désactive
    // ==> On décoche la case et on sauvegarde en BD pour que les données entre l'interface et la BD soient cohérentes
    if (this.ficheAppelSocialDto.aucuneSuite && this.aucuneSuiteDisabled) {
      this.ficheAppelSocialDto.aucuneSuite = false;
      this.subscription.add(
        this.saveDonnes(false).subscribe()
      );
    }
  }



  onChangmentTypeConfirme(service: TypeficheSelectioneService) {
   
      // Update the mandatoryFields based on the selected value
      if ( this.ficheAppelSocialDto.codeReferenceTypeFiche === "DETAIL") {
        this.mandatoryFields = ["difficultePriorisee", "objectifAatteindre"];
      } else if ( this.ficheAppelSocialDto.codeReferenceTypeFiche === "ABREG") {
        this.mandatoryFields = ["objectifAatteindre"];
      }else {
        this.mandatoryFields = []; // Reset the mandatoryFields if no matching value
      }
  }
}
