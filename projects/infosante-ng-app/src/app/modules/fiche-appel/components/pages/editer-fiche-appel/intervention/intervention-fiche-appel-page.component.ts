import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, UrlTree } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SectionFicheAppelEnum } from 'projects/infosante-ng-core/src/lib/models';
import { FicheAppelDTO } from 'projects/infosante-ng-core/src/lib/models/fiche-appel-dto';
import { ProtocoleDTO } from 'projects/infosante-ng-core/src/lib/models/protocole-dto';
import { ReferenceSourceInformationDTO } from 'projects/infosante-ng-core/src/lib/models/reference-source-information-dto';
import { SourcesInformationDTO } from 'projects/infosante-ng-core/src/lib/models/sources-information-dto';
import { EnumUrlPageFicheAppel } from 'projects/infosante-ng-core/src/lib/models/url-page-fiche-appel-enum';
import { AutresSourcesInformationApiService } from 'projects/infosante-ng-core/src/lib/services/autres-sources-information-api.service';
import { FicheAppelApiService } from 'projects/infosante-ng-core/src/lib/services/fiche-appel-api.service';
import { FicheAppelDataService } from 'projects/infosante-ng-core/src/lib/services/fiche-appel-data.service';
import { ProtocoleApiService } from 'projects/infosante-ng-core/src/lib/services/protocole-api.service';
import { ReferencesApiService } from 'projects/infosante-ng-core/src/lib/services/references-api.service';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { BindingErrorsStore } from 'projects/sigct-service-ng-lib/src/lib/api-errors/binding-errors.store';
import { MaterialModalDialogService } from 'projects/sigct-service-ng-lib/src/lib/material-modal-dialog/material-modal-dialogl.service';
import { OrientationSuitesInterventionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/orientation-suites-intervention-dto';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';
import { ReferenceSuitesInterventionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-suites-intervention-dto';
import { StatutFicheAppelEnum } from 'projects/sigct-service-ng-lib/src/lib/models/statut-fiche-appel.enum';
import { SigctOrientationSuitesInterventionService } from 'projects/sigct-service-ng-lib/src/lib/services/sigct-orientation-suites-intervention.service';
import { SigctReferenceSuitesInterventionService } from 'projects/sigct-service-ng-lib/src/lib/services/sigct-reference-suites-intervention.service';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import { InputTextAreaComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/input-textarea/input-textarea.component';
import { SigctOrientationSuitesInterventionComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-orientation-suites-intervention/sigct-orientation-suites-intervention.component';
import { SigctReferenceSuitesInterventionComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-reference-suites-intervention/sigct-reference-suites-intervention.component';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { iif, Observable, of, Subscription } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { AutresSourcesInformationComponent } from '../../../ui/autres-sources-information/autres-sources-information.component';
import { SuiviDTO } from '../../../ui/suivi/suivi-dto';
import { SuiviComponent } from '../../../ui/suivi/suivi.component';
import { BaseFicheAppelPage } from '../base-fiche-appel-page/base-fiche-appel-page';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import { AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';

@Component({
  selector: 'intervention-fiche-appel-page',
  templateUrl: './intervention-fiche-appel-page.component.html',
  styleUrls: ['./intervention-fiche-appel-page.component.css']
})
export class InterventionFicheAppelPageComponent extends BaseFicheAppelPage implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild("autresSourcesInformation", { static: true })
  appAutresSourcesInformation: AutresSourcesInformationComponent;

  @ViewChild("orientationSuitesIntervention", { static: true })
  appOrientationSuitesIntervention: SigctOrientationSuitesInterventionComponent;

  @ViewChild("referenceSuitesIntervention", { static: true })
  appReferenceSuitesIntervention: SigctReferenceSuitesInterventionComponent;

  @ViewChild('appSuivi', { static: true })
  appSuivi: SuiviComponent;

  @ViewChild('champintervention', { static: true })
  champIntervention: InputTextAreaComponent;

  ficheIntervention = new FicheAppelDTO();
  suiviDTO: SuiviDTO;

  private abonnementFiche: Subscription;
  private abonnementRouterSave: Subscription;
  private abonnementRouterLoad: Subscription;
  private abonnementSave: Subscription;

  private autreSourceInformationServiceLectureSub: Subscription;
  private autreSourceInformationServiceEcritureSub: Subscription;
  private autreSourceInformationServiceSupprimerSub: Subscription;
  private refSourceInformationSub: Subscription;
  private subscription: Subscription = new Subscription();

  listeAutresSourcesInformation: SourcesInformationDTO[];
  listeRefAutresSourcesInformation: ReferenceSourceInformationDTO[] = [];

  listeOrientationSuitesIntervention: OrientationSuitesInterventionDTO[];
  listeRefOrientationSuitesIntervention: ReferenceDTO[] = [];

  listeReferenceSuitesIntervention: ReferenceSuitesInterventionDTO[];
  listeRefReferenceSuitesIntervention: ReferenceDTO[] = [];

  listeReferencesRessourceSuivi: ReferenceDTO[];

  listeProtocole: ProtocoleDTO[] = [];

  // On passe une liste statique de codes des fichiers téléchageables. Le jour ou on dispose d'un indicateur DB permettant
  // d'identifier ces fichiers, cette liste sera peuplée via un appel service.
  codeDownloadedFiles: string[] = ["RPI"];

  private urlApi: string = window["env"].urlSanteApi;

  public inputOptionAucuneSuite: InputOptionCollection = {
    name: "acunesuite",
    options: [{ label: 'sigct.sa.f_appel.intervention.aucunesuite', value: 'false' }]
  };

  public inputOptionAutorisationTransmission: InputOptionCollection = {
    name: "autorisationtransmission",
    options: [{ label: 'sigct.sa.f_appel.intervention.usagerautorise', value: 'false' }]
  };

  public inputOptionConsentementenFicheEnregistreur: InputOptionCollection = {
    name: "consentementenOrganismesEnregistreurs",
    options: [{ label: 'sigct.sa.f_appel.intervention.consentementenregistreurs', value: 'false' }]
  };

  aucuneSuiteDisabled: boolean;
  autorisationTransmissionDisabled: boolean;
  consentementenFicheEnregistreurDisabled: boolean;

  idFicheAppel: number;

  constructor(

    private referenceApiService: ReferencesApiService,
    private ficheAppelApiService: FicheAppelApiService,
    private ficheAppelDataService: FicheAppelDataService,
    private translateService: TranslateService,
    private authService: AuthenticationService,
    private autresSourcesInformationApiService: AutresSourcesInformationApiService,
    private materialModalDialogService: MaterialModalDialogService,
    private orientationSuitesInterventionService: SigctOrientationSuitesInterventionService,
    private referenceSuitesInterventionService: SigctReferenceSuitesInterventionService,
    private protocoleApiService: ProtocoleApiService,
    private alertStore: AlertStore,
    private bindingErrorsStore: BindingErrorsStore,
    private route: ActivatedRoute,
    private router: Router,
    private modalConfirmService: ConfirmationDialogService,
    private appContextStore: AppContextStore) {
    super(ficheAppelDataService);
  }

  ngOnInit() {
    // Initialisation du BaseFicheAppelPageComponent
    super.ngOnInit();

    this.idFicheAppel = this.ficheAppelDataService.getIdFicheAppelActive();

    this.chargerDonnees();

    //Charger les références d'autres sources d'information
    this.refSourceInformationSub = this.referenceApiService.getListeSourceInformation().subscribe(
      (refSourceInformation: ReferenceSourceInformationDTO[]) => {
        this.listeRefAutresSourcesInformation = refSourceInformation;
      }
    );

    this.chargerRefOrientationsSuitesIntervention();

    this.chargerRefReferenceSuitesIntervention();

  }

  ngAfterViewInit() {

    if (this.champIntervention) {
      this.setFocusOnIntervention();
    }

  }

  ngOnDestroy() {
    super.ngOnDestroy();

    if (this.autreSourceInformationServiceLectureSub) {
      this.autreSourceInformationServiceLectureSub.unsubscribe();
    }

    if (this.autreSourceInformationServiceEcritureSub) {
      this.autreSourceInformationServiceEcritureSub.unsubscribe();
    }

    if (this.refSourceInformationSub) {
      this.refSourceInformationSub.unsubscribe();
    }

    if (this.autreSourceInformationServiceSupprimerSub) {
      this.autreSourceInformationServiceSupprimerSub.unsubscribe();
    }

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (this.abonnementRouterSave) { this.abonnementRouterSave.unsubscribe(); }
    if (this.abonnementRouterLoad) { this.abonnementRouterLoad.unsubscribe(); }
    if (this.abonnementFiche) { this.abonnementFiche.unsubscribe(); }
    if (this.abonnementSave) { this.abonnementSave.unsubscribe(); }

    // Vide la liste des messages pour ne pas qu'ils s'affichent sur la prochaine page.
    this.alertStore.resetAlert();

  }

  /**
   * Lorsqu'une navigation "externe" est enclenchée.
   * IMPORTANT: On doit sauvegarder les données à l'aide de navigation.sendBeacon()
   */
  autoSaveBeforeUnload(): void {
    // Sauvegarde possible uniquement si le statut de la fiche est OUVERT.
    if (this.ficheIntervention.statut == StatutFicheAppelEnum.OUVERT) {
      this.ficheAppelApiService.autoSaveFicheAppel(this.ficheIntervention, EnumUrlPageFicheAppel.INTERVENTION);
    }
  }

  /**
   * Lorsqu'une navigation "interne" est enclenchée. Le routing attend une réponse positive de cette méthode avant
   * de s'exécuter, laissant le temps de sauvegarder les données avant de poursuivre.
   */
  autoSaveBeforeRoute(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.alertStore.resetAlert();

    this.setFocusOnIntervention();

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
   * Lorsque le bouton Annuler est cliqué.
   */
  onAnnuler(): void {
    this.alertStore.setState([]);
    this.idFicheAppel = this.ficheAppelDataService.getIdFicheAppelActive();
    // this.appAutresSourcesInformation.resetFrom();
    // this.appOrientationSuitesIntervention.resetForm();
    // this.appReferenceSuitesIntervention.resetForm();
    this.chargerDonnees();
  }

  /**
   * Lorsque la fiche active change (lors d'un changement d'onglet).
   * @param idFicheAppel identifiant de la nouvelle fiche d'appel active
   */
  onFicheAppelActiveChange(idFicheAppel: number): void {
    this.idFicheAppel = idFicheAppel;
    // this.appAutresSourcesInformation.resetFrom();
    // this.appOrientationSuitesIntervention.resetForm();
    // this.appReferenceSuitesIntervention.resetForm();
    this.chargerDonnees();
  }

  /**
   * Lorsque le bouton Sauvegarder est cliqué.
   */
  onSauvegarder(): void {
    this.appAutresSourcesInformation.resetChampsValides();
    this.appOrientationSuitesIntervention.resetChampsValides();
    this.appReferenceSuitesIntervention.resetChampsValides();
    this.subscription.add(
      this.saveDonnes(true).subscribe()
    );
  }

  /**
   * Permet de charger les données
   */
  private chargerDonnees() {
    this.chargerIntervention();
    this.chargerAutresSourcesInformation();
    this.chargerOrientationSuitesIntervention();
    this.chargerReferenceSuitesIntervention();
    this.chargerProtocolesRelies(this.idFicheAppel);
  }

  /**
   * Permet de charger Intervention
   */
  private chargerIntervention(): void {
    this.abonnementFiche = this.ficheAppelApiService.getFicheAppel(this.idFicheAppel).subscribe((fiche: FicheAppelDTO) => {
      this.ficheIntervention = fiche;
      this.chargerAppSuivi();
    });
  }

  private chargerAppSuivi(): void {
    if (this.ficheIntervention) {
      this.subscriptions.add(
        this.referenceApiService.getListeRessourceSuivi().subscribe((results: ReferenceDTO[]) => {
          if (CollectionUtils.isNotBlank(results)) {
            this.listeReferencesRessourceSuivi = results;
          }
          this.suiviDTO = {
            siNonAmelioration: this.ficheIntervention.delaiAmelioration,
            referenceRessourceSuiviCode: this.ficheIntervention.referenceRessourceSuiviCode
          }
        })
      );
    }
  }

  /**
   * Permet de charger les autres sources d'information pour la fiche d'appel en cours de consultation/édition
   */
  private chargerAutresSourcesInformation(): void {

    if (this.autreSourceInformationServiceLectureSub) {
      this.autreSourceInformationServiceLectureSub.unsubscribe();
    }
    this.autreSourceInformationServiceLectureSub = this.autresSourcesInformationApiService.getListeAutresSourcesInformation(this.idFicheAppel).subscribe(
      (autresSourcesInformationDto: SourcesInformationDTO[]) => {
        this.listeAutresSourcesInformation = autresSourcesInformationDto;
        this.identifySourceInfoForDownloadFile(autresSourcesInformationDto)
      }
    );

  }

  private identifySourceInfoForDownloadFile(autresSourcesInformationDto: SourcesInformationDTO[]): void {
    autresSourcesInformationDto.forEach(function (sourceInfoDto: SourcesInformationDTO, index: number) {
      let isDownloadUrl: boolean = this.codeDownloadedFiles.includes(sourceInfoDto?.codeRefSourceInformation);
      if (isDownloadUrl) {
        autresSourcesInformationDto[index].isDownloadSource = true;
      }
    }, this);

  }

  chargerOrientationSuitesIntervention(): void {
    this.subscription.add(
      this.orientationSuitesInterventionService.getListOrientations(this.urlApi, this.idFicheAppel)
        .subscribe((orientationsSuitesIntervention: OrientationSuitesInterventionDTO[]) => {
          this.listeOrientationSuitesIntervention = orientationsSuitesIntervention
            ? orientationsSuitesIntervention : [];
          this.checkAucuneSuite();
        })
    );
  }

  /**Charger les références d'orientation des suites d'intervention */
  private chargerRefOrientationsSuitesIntervention(): void {
    this.subscription.add(
      this.referenceApiService.getListeOrientation(false)
        .subscribe((refOrientation: ReferenceDTO[]) => {
          this.listeRefOrientationSuitesIntervention = refOrientation;
        })
    );
  }

  chargerReferenceSuitesIntervention(): void {
    this.subscription.add(
      this.referenceSuitesInterventionService.findAll(this.urlApi, this.idFicheAppel)
        .subscribe((referencesSuitesIntervention: ReferenceSuitesInterventionDTO[]) => {
          this.listeReferenceSuitesIntervention = referencesSuitesIntervention ?
            referencesSuitesIntervention : [];
          this.checkAucuneSuite();
        })
    );
  }

  /**Charger les références de la reference des suites d'intervention */
  private chargerRefReferenceSuitesIntervention(): void {
    this.subscription.add(
      this.referenceApiService.getListeReference()
        .subscribe((refReference: ReferenceDTO[]) => this.listeRefReferenceSuitesIntervention = refReference)
    );
  }

  /**
   * Charge la liste des protocoles reliés à la fiche d'appel.
   * @param idFicheAppel identifiant de la fiche d'appel
   */
  private chargerProtocolesRelies(idFicheAppel: number): void {
    if (idFicheAppel) {
      this.subscription.add(
        this.protocoleApiService.getListeProtocole(idFicheAppel).subscribe((listeProtocoleDto: ProtocoleDTO[]) => {
          this.listeProtocole = listeProtocoleDto;
        })
      );
    }
  }

  private checkAucuneSuite() {
    this.aucuneSuiteDisabled = (
      this.listeOrientationSuitesIntervention
      && this.listeOrientationSuitesIntervention.length > 0)
      || (this.listeReferenceSuitesIntervention
        && this.listeReferenceSuitesIntervention.length > 0
      );

    if (this.ficheIntervention.aucuneSuite && this.aucuneSuiteDisabled) {
      this.ficheIntervention.aucuneSuite = false;
      this.subscription.add(
        this.saveDonnes(true).subscribe()
      );
    }
  }

  /**
   * Ajout d'une autre source d'information pour la fiche d'appel en cours de consultation/édition
   * On renseigne le DTO avec les informations qui ne sont pas saisies à l'écran
   * On fait appel au HTTP.post
   * On fait un reset au formulaire de saisie
   * On recharge les autres sources d'information pour afficher avec l'ajout
   */
  onAjoutAutreSourceInformation(autreSourceInformationDTO: SourcesInformationDTO) {

    if (this.autreSourceInformationServiceEcritureSub) {
      this.autreSourceInformationServiceEcritureSub.unsubscribe();
    }
    this.autreSourceInformationServiceEcritureSub = this.autresSourcesInformationApiService.ajoutAutreSourceInformation(
      autreSourceInformationDTO, this.idFicheAppel).subscribe(() => {
        this.chargerAutresSourcesInformation();
      });

    this.appAutresSourcesInformation.fAutreSourceInformation.reset();

  }

  onAjoutOrientationSuitesIntervention(orientationSuitesIntervention: OrientationSuitesInterventionDTO) {
    this.subscription.add(
      this.orientationSuitesInterventionService.create(this.urlApi, orientationSuitesIntervention)
        .subscribe(() => this.chargerOrientationSuitesIntervention())
    );
    this.appOrientationSuitesIntervention.resetForm();
  }

  onAjoutReferenceSuitesIntervention(referenceSuitesIntervention: ReferenceSuitesInterventionDTO) {
    this.subscription.add(
      this.referenceSuitesInterventionService.create(this.urlApi, referenceSuitesIntervention)
        .subscribe(() => this.chargerReferenceSuitesIntervention())
    );
    this.appReferenceSuitesIntervention.resetForm();
  }

  /**
   * Suppression d'une autre source d'information
   * On fait appel au HTTP.delete
   * On recharge les autres sources d'information pour afficher lal iste à jour
   *
   * @param event de type number contenant l'identifiant de l'autre source d'information à supprimer
   */
  onSupprimerAutreSourceInformation(event: number): void {

    if (this.autreSourceInformationServiceSupprimerSub) {
      this.autreSourceInformationServiceSupprimerSub.unsubscribe();
    }
    this.autreSourceInformationServiceSupprimerSub = this.autresSourcesInformationApiService.supprimerAutreSourceInformation(this.idFicheAppel, event).subscribe(() => {
      this.chargerAutresSourcesInformation();
    });
  }

  onSupprimerOrientationSuitesIntervention(orientation: OrientationSuitesInterventionDTO) {
    this.subscription.add(
      this.orientationSuitesInterventionService.delete(this.urlApi, +orientation.id)
        .subscribe(() => this.chargerOrientationSuitesIntervention())
    );
  }

  /**
   * Supprime un protocole après confirmation de l'utilisateur.
   * @param protocole protocole à supprimer
   */
  onSupprimerProtocole(protocole: ProtocoleDTO): void {
    // ss-iu-a30002={{0}} : vous allez supprimer cette information. Désirez-vous continuer?
    const msgConfirmation: string = this.translateService.instant("ss-iu-a30002", { 0: protocole.titre });

    this.subscription.add(
      this.materialModalDialogService.popupConfirmer(msgConfirmation).subscribe((reponse: boolean) => {
        if (reponse === true) {
          this.subscription.add(
            this.protocoleApiService.supprimerProtocole(protocole.id).subscribe(() => {
              // Met à jour la liste des protocoles
              this.chargerProtocolesRelies(this.idFicheAppel);
            })
          );
        }
      })
    );
  }

  onSupprimerReferenceSuitesIntervention(idReference: number) {
    this.subscription.add(
      this.referenceSuitesInterventionService.delete(this.urlApi, idReference)
        .subscribe(() => this.chargerReferenceSuitesIntervention())
    );
  }

  onConsulterAvis(idAvis: number) {
    this.router.navigate(["../" + SectionFicheAppelEnum.AVIS], { relativeTo: this.route, queryParams: { idAvis: idAvis } });
  }

  onConsulterProtocole(protocole: ProtocoleDTO): void {  
    if (protocole.idDocIdent) {
     //Consulter un référentiel
      if (this.authService.hasAllRoles(['ROLE_SA_RPI_CONSULT'])) {
        let ficheAppel: FicheAppelDTO = this.ficheAppelDataService.getFicheAppelActive();
        this.appContextStore.setvalue("contextConsultationReferentiel", true);
        this.appContextStore.setvalue("consultData", { idDocumentIdentification: protocole.idDocIdent, nomDocument: protocole.titre, typeDocument: protocole.typeDocument });

        let target = "/editer/appel/" + ficheAppel.idAppel + "/fiche/" + ficheAppel.id + "/protocoles"
        this.router.navigate([target]);

      } else {
        this.openModal('confirm_popup_doc_ref_or_pdf_non_access');
      }
    } else {
      this.router.navigate(['../' + SectionFicheAppelEnum.PROTOCOLES], { relativeTo: this.route, queryParams: { idProtocole: protocole.refDocumentDrupal } });
    }
  }

  openModal(id: string) {
    this.modalConfirmService.open(id);
  }

  /**
   * Sauvegarder les données. Si avecAlerte est false, les validations ne sont pas effectuées et
   * aucun message n'est affiché (autoSave).
   * @param avecAlerte indique si les validations et les messages sont affichés.
   */
  saveDonnes(avecAlerte: boolean): Observable<boolean> {
    //Vider les alertes déjà présentes
    this.alertStore.resetAlert();

    if (avecAlerte) {
      let messages: string[] = [];

      const autreSourceNotEmpty = !this.appAutresSourcesInformation.isEmptyForm()
      const orientationFormNotEmpty = !this.appOrientationSuitesIntervention.isEmptyForm();
      const referenceFormNotEmpty = !this.appReferenceSuitesIntervention.isEmptyForm();

      if (orientationFormNotEmpty || referenceFormNotEmpty || autreSourceNotEmpty) {
        const titreAvertissement: string = this.translateService.instant("usager.msg.avertissement");

        if (autreSourceNotEmpty) {
          const titre = this.translateService.instant("sigct.sa.f_appel.intervention.titreautressourcesinformation")
          // Les informations saisies dans la section {{0}} n'ont pas été ajoutées. Cliquez sur la flèche bleue si vous désirez conserver ces informations, sinon les données saisies seront perdues.
          const msg = this.translateService.instant("ss-iu-a30000", { 0: titre });
          messages.push(msg);
          this.creerMessageAlert(messages, titreAvertissement, AlertType.WARNING);
          messages = [];
        }
        if (orientationFormNotEmpty) {
          const titre = this.translateService.instant("sigct.sa.f_appel.intervention.titre")
          const msg = this.translateService.instant("ss-iu-a30000", { 0: titre });
          messages.push(msg);
          this.creerMessageAlert(messages, titreAvertissement, AlertType.WARNING);
          messages = [];
        }
        if (referenceFormNotEmpty) {
          const titre = this.translateService.instant("sigct.sa.f_appel.intervention.titre")
          const msg = this.translateService.instant("ss-iu-a30000", { 0: titre });
          messages.push(msg);
          this.creerMessageAlert(messages, titreAvertissement, AlertType.WARNING);
          messages = [];
        }
      }
    }
    this.doSaveAppSuivi();

    return this.ficheAppelApiService.updateFicheAppel(this.ficheIntervention, EnumUrlPageFicheAppel.INTERVENTION)
      .pipe(map((dto: FicheAppelDTO) => {
        if (avecAlerte) {
          this.bindingErrorsStore.setState({});

          this.afficherMessageSauvegardeReussie();
          this.afficherMessageValidationFinales(dto.validationsFinales);
          this.afficherMessageAvertissements(dto.avertissements);
        }
        return true;
      }));
  }

  private doSaveAppSuivi(): void {
    if (this.appSuivi && this.appSuivi.suiviDTO) {
      this.ficheIntervention.delaiAmelioration = this.appSuivi.suiviDTO.siNonAmelioration;
      this.ficheIntervention.referenceRessourceSuiviCode = this.appSuivi.suiviDTO.referenceRessourceSuiviCode;
    }
  }

  private creerMessageAlert(messages: string[], titre: string, alertType: AlertType): void {
    const alertModel: AlertModel = AlertModelUtils.createAlertModel(messages, titre, alertType);

    this.alertStore.addAlert(alertModel);
  }

  private afficherMessageSauvegardeReussie(): void {
    let msg: string[] = [];
    let title = this.translateService.instant("ss.msg.succes.confirmation");
    msg.push(this.translateService.instant("ss.msg.succes.confirmation.text"));
    let alertModel: AlertModel = AlertModelUtils.createAlertModel(msg, title, AlertType.SUCCESS);

    this.alertStore.addAlert(alertModel);
  }

  private afficherMessageValidationFinales(validationsFinales: Map<string, string>): void {
    const titre: string = this.translateService.instant("usager.msg.valfinale");
    const alertModel: AlertModel = AlertModelUtils.createAlertModelValidationFinales(validationsFinales, titre);
    if (alertModel) {
      this.alertStore.addAlert(alertModel);
    }
  }

  private afficherMessageAvertissements(avertissements: Map<string, string>): void {
    const titre: string = this.translateService.instant("usager.msg.avertissement");
    const alertModel: AlertModel = AlertModelUtils.createAlertModelAvertissements(avertissements, titre);
    if (alertModel) {
      this.alertStore.addAlert(alertModel);
    }
  }

  private setFocusOnIntervention(): void {
    if (this.champIntervention) {
      this.champIntervention.focus();
    }
  }

}
