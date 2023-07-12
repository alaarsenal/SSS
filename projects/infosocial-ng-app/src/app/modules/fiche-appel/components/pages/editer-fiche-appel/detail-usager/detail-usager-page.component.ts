import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { Router, UrlTree } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { EnumUrlPageFicheAppelSocial, FicheAppelSocialDTO, ReferenceDTO, UsagerDTO, UsagerIdentificationDTO } from 'projects/infosocial-ng-core/src/lib/models';
import { EnumTypeFicheAppel } from 'projects/infosocial-ng-core/src/lib/models/type-fiche-appel-enum';
import { FicheAppelApiService, ReferencesApiService } from 'projects/infosocial-ng-core/src/lib/services';
import { AppelApiService } from 'projects/infosocial-ng-core/src/lib/services/appel-api.service';
import { FicheAppelDataService } from 'projects/infosocial-ng-core/src/lib/services/fiche-appel-data.service';
import { UsagerApiService } from 'projects/infosocial-ng-core/src/lib/services/usager-api.service';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { DataContexteDetailUsagerPage } from 'projects/sigct-service-ng-lib/src/lib/models/data-contexte-detail-usager-page';
import { InfoAppelCtiDTO } from 'projects/sigct-service-ng-lib/src/lib/models/info-appel-cti-dto';
import { LinkedUsagerDTO } from 'projects/sigct-service-ng-lib/src/lib/models/linked-usager-dto';
import { MessageCtiDTO } from 'projects/sigct-service-ng-lib/src/lib/models/message-cti-dto';
import { StatutFicheAppelEnum } from 'projects/sigct-service-ng-lib/src/lib/models/statut-fiche-appel.enum';
import { AppelAdmParameterService } from 'projects/sigct-service-ng-lib/src/lib/services/appel-adm-parameter/appel-adm-parameter.service';
import { AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import { TypeficheSelectioneService } from 'projects/sigct-ui-ng-lib/src/lib/components/grise-automatique-selon-type-intervention/grise-automatique-selon-type-intervention.component';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { RrssParamsUrl } from 'projects/sigct-ui-ng-lib/src/lib/components/rrss/rrss-params-url';
import { AppelantDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-appelant-initial/appelant-dto';
import { SigctAppelantInitialComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-appelant-initial/sigct-appelant-initial.component';
import { MatIframeDialogComponent } from 'projects/sigct-ui-ng-lib/src/lib/dialogs/mat-iframe-dialog/mat-iframe-dialog.component';
import { StripHtmlPipe } from 'projects/sigct-ui-ng-lib/src/lib/pipes/strip-html/strip-html.pipe';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { DialogueUsagerComponent, UserData } from 'projects/usager-ng-core/src/lib/components/uis';
import { BaseUsagerDTO } from 'projects/usager-ng-core/src/lib/models/base-usager-dto';
import { forkJoin, iif, Observable, of } from 'rxjs';
import { catchError, finalize, map, mergeMap, tap } from 'rxjs/operators';
import { BaseFicheAppelPage } from '../base-fiche-appel-page/base-fiche-appel-page';

@Component({
  selector: 'detail-usager-page',
  templateUrl: './detail-usager-page.component.html',
  styleUrls: ['./detail-usager-page.component.css'],
  providers: [StripHtmlPipe]
})
export class DetailUsagerPageComponent extends BaseFicheAppelPage implements OnInit, OnDestroy {
  private urlRedirection: UrlTree = null;
  usager: BaseUsagerDTO = null;
  public inputOptionCategoriesAppelant: InputOptionCollection = {
    name: "categoriesAppelant",
    options: []
  }

  @ViewChild(SigctAppelantInitialComponent, { static: true })
  appelantComponent: SigctAppelantInitialComponent;

  public ficheAppelDTO: FicheAppelSocialDTO = new FicheAppelSocialDTO();
  private readonly pageApiUpdateEndPoint = EnumUrlPageFicheAppelSocial.USAGER;
  public idAppel: number;
  categoriesAppelant: ReferenceDTO[];
  idUsagerIdent: number = null;
  rrssParamsUrl: RrssParamsUrl = new RrssParamsUrl();
  infoBulleCatgLien: string;
  baseUsager: BaseUsagerDTO;

  private labelSelectionnez: string = 'Sélectionnez...';
  private alertModels: AlertModel[] = [];
  private messagesErrors: string[] = [];
  private messagesWarning: string[] = [];
  private messagesFinalValidation: string[] = [];

  @ViewChild('btninfousager', { read: ElementRef, static: true }) private btnUsagerRef: ElementRef;

  @Output("infoUsagerClick")
  infoUsagerClick = new EventEmitter<void>();

  usagerALier: BaseUsagerDTO = null;

  appelantDTO = new AppelantDTO();

  infoAppelCtiDto: InfoAppelCtiDTO = null;
  linkedUsagerDTOs: LinkedUsagerDTO[] = [];

  /**Cet attribut est declaré juste pour être passé via input au composant msss-sigct-appelant-initial
   * Vu que celui-ci fait usage de ce service dans son implementation.
   * (Il ne devrait pas, selon l'architecture déterminée)
   */
  appelService: AppelApiService;

  constructor(
    private router: Router,
    private ficheAppelDataService: FicheAppelDataService,
    private usagerApiService: UsagerApiService,
    private alertStore: AlertStore,
    private appContextStore: AppContextStore,
    private matDialog: MatDialog,
    private sanitizer: DomSanitizer,
    private confirmationDialogService: ConfirmationDialogService,
    private refApiService: ReferencesApiService,
    private ficheAppelApiService: FicheAppelApiService,
    private translateService: TranslateService,
    public appelApiService: AppelApiService,
    private modalConfirmService: ConfirmationDialogService,
    private appelAdmParameterService: AppelAdmParameterService,
    private typeFicheServie: TypeficheSelectioneService,
    private stripHtmlPipe: StripHtmlPipe) {
    super(ficheAppelDataService);
    this.appelService = this.appelApiService;
  }


  ngOnInit(): void {
    // Initialisation du BaseFicheAppelPageComponent.
    super.ngOnInit();

    this.getIdUsagerIdentIfExist();
    this.idAppel = this.ficheAppelDataService.getIdAppel();

    // Place l'usager actif dans le contexte de l'application afin que le composant affiche correctement le groupe d'âge.
    this.appContextStore.setvalue("usagerEnContexteAppel", this.baseUsager);

    this.subscriptions.add(
      this.typeFicheServie.changementCodeType.subscribe(code => {
        if (code === EnumTypeFicheAppel.NONPERT) {
          this.matDialog.closeAll();
        }
      })
    );

    this.subscriptions.add(
      forkJoin([
        this.initializeLienAppelantInitial$(), // 0
        this.appelAdmParameterService.obtenirAdmParametersRRSS(window["env"].urlPortail).pipe(catchError(e => of(null))), // 1
        this.appelService.obtenirMessageCtiAppel(this.idAppel).pipe(catchError(e => of(null))), // 2
      ]).subscribe(results => {
        if (results) {
          if (results[1]) {
            const result: any = results[1];
            this.rrssParamsUrl.rrssApiWebUrl = result.rrss_urlui;
            this.rrssParamsUrl.rrssApiWebUsername = result.rrss_username;
            this.rrssParamsUrl.rrssApiWebPass = result.rrss_password;
            this.rrssParamsUrl.urlActifRequerant = window.location.href;
          }

          if (results[2]) {
            const messageCti: MessageCtiDTO = results[2] as MessageCtiDTO;
            this.infoAppelCtiDto = {
              nomAppel: messageCti.callerName,
              noTelAppel: messageCti.callerId,
            };
          }

          // Au chargement de l'UI, on vérifie si un usager existe, si non on affiche le popup de recherche d'un usager.
          if (!this.idUsagerIdent) {
            if (!this.typeFicheServie.isNomPert()) {
              this.onBtnInfosUsagerClick();
            }
          }
        }
      })
    );
  }

  private getIdUsagerIdentIfExist() {
    const baseUsager: BaseUsagerDTO = this.ficheAppelDataService.getBaseUsagerFicheAppelActive();
    this.baseUsager = baseUsager;
    this.idUsagerIdent = baseUsager?.id;
  }

  ngOnDestroy(): void {
    // Appel subscriptions.unsubscribe();
    super.ngOnDestroy();

    //Vider les alertes déjà présentes
    if (this.alertStore.state) {
      this.alertStore.resetAlert();
    }
  }

  /**
   * Lorsqu'une navigation "externe" est enclenchée.
   * IMPORTANT: On doit sauvegarder les données à l'aide de navigation.sendBeacon()
   */
  autoSaveBeforeUnload(): void {
    // Sauvegarde possible uniquement si le statut de la fiche est OUVERT.
    if (this.ficheAppelDataService.getFicheAppelActive().statut == StatutFicheAppelEnum.OUVERT) {
      this.ficheAppelApiService.autoSaveFicheAppel(this.ficheAppelDTO, this.pageApiUpdateEndPoint);
      this.appelApiService.autoSaveAppelant(this.appelantComponent.appelantDTO)
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
      tap(() => this.urlRedirection = this.urlRedirection ? this.urlRedirection : this.router.createUrlTree(["/editer", "appel", this.ficheAppelDataService.getIdAppel(), "fiche", this.ficheAppelDataService.getIdFicheAppelActive(), "consultation"])),
      mergeMap((statut: StatutFicheAppelEnum) =>
        // Sauvegarde possible uniquement si le statut de la fiche est OUVERT.
        iif(() => statut == StatutFicheAppelEnum.OUVERT,
          // Si ouvert: la fiche est ouverte, on la sauvegarde
          this.saveDonnees(false),
          // Sinon : la fiche n'est plus Ouverte, on retourne un UrlTree pour redirection vers la consultation.
          of(this.urlRedirection))
      ),
      finalize(() => this.urlRedirection = null)
    );
  }

  /**
   * Lorsque le bouton Annuler est cliqué.
   */
  onAnnuler(): void {
    //Vider les alertes déjà présentes
    if (this.alertStore.state) {
      this.alertStore.resetAlert();
    }

    this.appelantComponent.reinitializeAppelantInitial();

    this.initializeLienAppelantInitial();
  }

  /**
   * Lorsque la fiche active change (lors d'un changement d'onglet).
   * @param idFicheAppel identifiant de la nouvelle fiche d'appel active
   */
  onFicheAppelActiveChange(idFicheAppel: number): void {
    this.idAppel = this.ficheAppelDataService.getIdAppel();
    this.initializeLienAppelantInitial();

    const usager: BaseUsagerDTO = this.ficheAppelDataService.getBaseUsagerFicheAppelActive();
    this.idUsagerIdent = usager?.id;

    // Place l'usager actif dans le contexte de l'application afin que le composant affiche correctement le groupe d'âge.
    this.appContextStore.setvalue("usagerEnContexteAppel", usager);

    this.btnUsagerRef.nativeElement.focus();

    // Si aucun usager est relié et l'UI ciblé est 'usager' on affiher le popup de recherche usager
    if (this.appContextStore?.state?.ongletObject?.urlSuffixeOnglet == "usager" && !this.appContextStore?.state?.ongletObject?.isUsagerLinked) {
      this.appContextStore.setvalue('ongletObject', null);
      this.onBtnInfosUsagerClick();
    }
  }

  /*
  * Lorsque le bouton Sauvegarder est cliqué.
  */
  onSauvegarder(): void {
    this.appelantComponent.resetChampsValides();
    this.subscriptions.add(
      this.saveDonnees(true).subscribe()
    );
  }

  /**
   * Dans l'action d'enregistrement, on cumule tous les messages d'erreurs. Une fois tout est vérifié
   * l'action enrégistrer n'est plus déclencher que si la liste de messages d'erreurs est vide.
   * À la fin quelque soit l'état d'enrégistrement, l'affichage de messages (erreur, avertissement ou succé)
   * est autonome. Par exemple le message de succé n'est plus accessible en présence d'au moins un message d'erreur.
   */
  saveDonnees(avecAlerte: boolean): Observable<boolean> {
    // Sauvegarde possible uniquement si le statut de la fiche est OUVERT.
    if (StatutFicheAppelEnum.FERME == this.ficheAppelDataService.getFicheAppelActive()?.statut) {
      if (avecAlerte) {
        this.alertStore.resetAlert();
        this.alertModels = [];
        const messages: string[] = [this.translateService.instant("ss-sv-e00001")];
        const alertModel: AlertModel = AlertModelUtils.createAlertModel(messages, "Message Erreur", AlertType.ERROR);
        this.alertStore.addAlert(alertModel);
      }
      return of(true);
    }
    if (avecAlerte) {
      this.alertStore.resetAlert();
      this.alertModels = [];
    }

    // Lance la sauvegarde de la fiche et de l'appelant sur le serveur et attend que les 2 traitements
    // soient terminés avant de poursuivre.
    return forkJoin([this.appelApiService.addAppelant(this.appelantComponent.appelantDTO),
    this.ficheAppelApiService.updateFicheAppel(this.ficheAppelDTO, this.pageApiUpdateEndPoint)]).pipe(
      map(results => {
        this.appelantComponent.appelantDTO = results[0] as AppelantDTO;
        const ficheAppelDto: FicheAppelSocialDTO = results[1] as FicheAppelSocialDTO;

        if (avecAlerte) {
          if (ficheAppelDto) {
            this.afficheMessageValidationFinales(ficheAppelDto.validationsFinales);
          }
          this.populateWarningMsgWhenAppelantCommDTOIsDirty();
          this.aggregateAndReleaseAlertModel();
          this.reinitialiseMsgStack();
        }

        return true;
      })
    );

  }

  /**
   * Affiche le module Usager dans une fenêtre popup afin de rechercher et de relier un usager..
   */
  onBtnInfosUsagerClick(): void {
    if (this.appContextStore.state.isContextAppel) {
      this.subscriptions.add(
        this.usagerApiService.fetchAllUsagerLinkedToGivenFicheAppels(this.ficheAppelDataService.getIdFicheAppelActive(), this.idAppel).subscribe((result: LinkedUsagerDTO[]) => {
          this.linkedUsagerDTOs = result;
          this.buildPopupContent();
        })
      );
    }
  }

  private buildPopupContent(): void {
    this.alertStore.resetAlert();

    if (!this.typeFicheServie.isNomPert()) {
      this.appContextStore.setvalue("contexteDetailUsagerPage", this.getContexteDetailUsagerPage());

      const matDialogConfig = new MatDialogConfig();
      matDialogConfig.disableClose = true;
      matDialogConfig.autoFocus = false;
      matDialogConfig.restoreFocus = true;
      matDialogConfig.width = "90vw";
      matDialogConfig.maxWidth = "90vw";
      matDialogConfig.height = "calc(100% - 120px)";
      matDialogConfig.data = <UserData>{
        idUsager: this.idUsagerIdent,
        enContexteAppel: true,
        idAppel: this.idAppel,
        idFicheAppelActive: this.ficheAppelDataService.getIdFicheAppelActive(),
        linkedUsagerDTOs: this.linkedUsagerDTOs,
        infoAppelCtiDto: this.infoAppelCtiDto,
      };
      const dialogRef = this.matDialog.open(DialogueUsagerComponent, matDialogConfig);

      this.subscriptions.add(
        dialogRef.afterOpened().subscribe(() => {
          // Indique l'ouverture du popup pour masquer les msg erreur.
          this.ficheAppelDataService.setDialogueUsagerOpened(true);
        })
      );

      this.subscriptions.add(
        dialogRef.afterClosed().subscribe((valeurRetour: BaseUsagerDTO | UrlTree | null) => {
          this.appContextStore.setvalue("contexteDetailUsagerPage", null);

          // Indique la fermeture du popup pour afficher les msg erreur.
          this.ficheAppelDataService.setDialogueUsagerOpened(false);

          if (valeurRetour) {
            if (valeurRetour instanceof UrlTree) {
              // Garde l'url de redirection dans une variable pour que l'autoSaveBeforeRoute l'utilise
              this.urlRedirection = valeurRetour as UrlTree;
              this.router.navigateByUrl(this.urlRedirection);
            } else {
              const baseUsager: BaseUsagerDTO = valeurRetour as BaseUsagerDTO;

              // Vérifie si l'usager est déjà lié à une autre fiche dans le même appel.
              if (this.isUsagerLieAutreFiche(baseUsager.id)) {
                // Cet usager a déjà été relié à l'intervention.
                const message = this.translateService.instant("so-iu-e00010");
                const title = this.translateService.instant("sigct.ss.error.label");
                let erreur: AlertModel = AlertModelUtils.createAlertModel([message], title, AlertType.ERROR);
                this.alertStore.addAlert(erreur);
              } else {
                // Parce qu'un usager aurait pu être relié entre temps, on récupère l'usager relié dans la BD.
                this.subscriptions.add(
                  this.usagerApiService.getUsagerFicheAppel(this.ficheAppelDataService.getIdFicheAppelActive()).subscribe((usagerRelie: LinkedUsagerDTO) => {
                    // Si un usager est déjà lié et est différent de l'usager sélectionné.
                    if (usagerRelie && usagerRelie.idUsagerIdent != baseUsager.id) {
                      this.usagerALier = baseUsager;
                      // Un autre usager a déjà été relié à la fiche. Voulez-vous le remplacer par l'usager en cours?
                      this.confirmationDialogService.openAndFocus("confirmer-relier-usager-popup", "confirmer-remplacer-usager-btn-oui");
                    } else {
                      // Relie l'usager à nouveau au cas où son âge aurait été modifié
                      this.relierUsager(baseUsager);
                    }
                  })
                );
              }
            }
          } else {
            // Le popup s'est fermé sans retourner d'usager (sans relier un usager). Par contre, l'utilisateur a peut être modifié
            // le groupe d'âge de l'usager en contexte d'appel pendant sa navigation dans la fenêtre de dialogue. On doit donc
            // s'assurer de sauvegarder dans InfoSanté tout changement apporté au groupe d'âge.

            // On vérifie si le groupe d'âge de l'usager en contexte d'appel diffère du groupe d'âge de l'usager lié à la fiche.
            const baseUsager: BaseUsagerDTO = this.ficheAppelDataService.getBaseUsagerFicheAppelActive();
            const usagerEnContexte: BaseUsagerDTO = this.appContextStore.state.usagerEnContexteAppel;
            if (JSON.stringify(baseUsager) != JSON.stringify(usagerEnContexte)) {
              // Relie l'usager à nouveau au cas, car son âge a été modifié
              this.relierUsager(usagerEnContexte);
            } else {
              // Demande un rafraichissement des fiches pour mettre à jour l'usager dans l'onglet, car l'utilisateur a peut être
              // édité l'usager déjà lié et on veux voir ces modifs.
              this.rafraichirFichesAppels();
            }
          }
        })
      );
    }
  }

  /**
   * Retourne les données nécessaires à la conversion de la fiche d'appel en une note complémentaire.
   * @returns un DataContexteDetailUsagerPage
   */
  private getContexteDetailUsagerPage(): DataContexteDetailUsagerPage {
    if (!this.ficheAppelDTO) {
      return null;
    }

    return <DataContexteDetailUsagerPage>{
       idFicheAppel: this.ficheAppelDTO.id ,
       saisieDifferee: this.ficheAppelDataService.isAppelSaisieDifferee(),
      };
  }

  /**
   * Vérifie si l'usager idUsagerIdent est déjà lié à une autre fiche dans le même appel.
   * @param idUsagerIdent identifiant de l'usager à valider
   */
  private isUsagerLieAutreFiche(idUsagerIdent: number): boolean {
    if (idUsagerIdent) {
      const listeFicheAppel: FicheAppelSocialDTO[] = this.ficheAppelDataService.getListeFicheAppel();
      // Recherche une fiche d'appel ayant le même usager lié.
      let ficheAppel: FicheAppelSocialDTO = null;
      ficheAppel = listeFicheAppel.find((item: FicheAppelSocialDTO) => item.usager?.usagerIdentification?.id === idUsagerIdent);

      // Vérifie si la fiche d'appel est diférente de la fiche d'appel en cours.
      if (ficheAppel?.id && ficheAppel?.id != this.ficheAppelDTO.id) {
        return true;
      }
    }
    return false;
  }

  /**
   * Relie l'usager à la fiche active.
   * @param baseUsager usager à relier
   */
  relierUsager(baseUsager: BaseUsagerDTO): void {
    if (baseUsager) {
      // this.idUsagerIdent = baseUsager.id;
      let usagerIdent: UsagerIdentificationDTO = new UsagerIdentificationDTO();
      usagerIdent.id = baseUsager.id;

      let usagerDto: UsagerDTO = new UsagerDTO();
      usagerDto.id = this.ficheAppelDataService.getFicheAppelActive().usager?.id;
      usagerDto.usagerAnonyme = false;
      usagerDto.usagerIdentification = usagerIdent;

      if (baseUsager.groupeAgeOptions) {
        if (baseUsager.groupeAgeOptions.groupeId) {
          let referenceGroupeAge: ReferenceDTO = new ReferenceDTO();
          referenceGroupeAge.id = baseUsager.groupeAgeOptions.groupeId;
          referenceGroupeAge.code = baseUsager.groupeAgeOptions.groupe;
          usagerDto.referenceGroupeAge = referenceGroupeAge;
        }
        usagerDto.ageAnnees = (baseUsager.groupeAgeOptions.annees ? +baseUsager.groupeAgeOptions.annees : null);
        usagerDto.ageMois = (baseUsager.groupeAgeOptions.mois ? +baseUsager.groupeAgeOptions.mois : null);
        usagerDto.ageJours = (baseUsager.groupeAgeOptions.jours ? +baseUsager.groupeAgeOptions.jours : null);
        usagerDto.usagerIdentification.dtNaiss = baseUsager.groupeAgeOptions.dateNaissance ? baseUsager.groupeAgeOptions.dateNaissance : null
      }

      const idFicheAppel = this.ficheAppelDataService.getIdFicheAppelActive();

      let ficheAppelSocialDto: FicheAppelSocialDTO = new FicheAppelSocialDTO();
      ficheAppelSocialDto.id = idFicheAppel;

      usagerDto.ficheAppel = ficheAppelSocialDto;

      this.subscriptions.add(
        this.usagerApiService.relierUsager(idFicheAppel, usagerDto).subscribe((usagerDto: UsagerDTO) => {
          // Demande un rafraichissement des fiches pour afficher le nouvel usager dans l'onglet.
          this.rafraichirFichesAppels();
        })
      );
    }
  }

  /**
   * Rafraichir les fiches d'appel pour afficher les informations de l'usager.
   */
  private rafraichirFichesAppels() {
    // L'identifiant est d'abord retiré pour forcer le rafraichissement du composant.
    this.idUsagerIdent = null;
    this.ficheAppelDataService.doRefreshListeFicheAppel();
  }

  /**
   * Récupère la fiche d'appel et la liste des catégories d'appelant.
   * Alimente this.ficheAppelDTO et this.inputOptionCategoriesAppelant
   */
  private initializeLienAppelantInitial(): void {
    this.initializeLienAppelantInitial$().subscribe();
  }

  /**
   * Observable qui récupère la fiche d'appel et la liste des catégories d'appelant.
   * Alimente this.ficheAppelDTO et this.inputOptionCategoriesAppelant
   * @returns 
   */
  private initializeLienAppelantInitial$(): Observable<void> {
    const id = this.ficheAppelDataService.getFicheAppelActive()?.id;
    if (id) {
      return forkJoin([
        this.refApiService.getListeCategorieAppelant(),
        this.ficheAppelApiService.getFicheAppel(id)
      ]).pipe(map(results => {
        this.inputOptionCategoriesAppelant.options = [
          { label: this.labelSelectionnez, value: null, description: this.labelSelectionnez }
        ];
        const refCategoriesAppelant: ReferenceDTO[] = results[0] as ReferenceDTO[];
        if (refCategoriesAppelant) {
          refCategoriesAppelant.forEach((item: ReferenceDTO) => {
            this.inputOptionCategoriesAppelant.options.push({ label: item.simpleNom, value: item.code, description: item.description });
          });
        }
        this.ficheAppelDTO = results[1];

        return;
      }
      ));
    }
    return of(void 0);
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

  private populateWarningMsgWhenAppelantCommDTOIsDirty() {
    if (this.appelantComponent.isAppelantCommDTODirty()) {
      let params = {
        0: this.translateService.instant("usager.communications.title"),
        1: "communication",
      };
      this.messagesWarning.push(this.translateService.instant("usager.modif.zone.gris", params))
    }
  }

  private aggregateAndReleaseAlertModel() {
    this.populateAlertSuccess();
    this.populateAlertErrors();
    this.populateAlertWarning();

    this.alertStore.addAlerts(this.alertModels);
  }

  private populateAlertErrors() {
    if (this.messagesErrors.length > 0) {
      let alertError: AlertModel = new AlertModel();
      alertError.title = this.translateService.instant("girpi.error.label");
      alertError.type = AlertType.ERROR;
      alertError.messages = this.messagesErrors;
      this.alertModels.push(alertError)
    }
  }

  private populateAlertSuccess() {
    if (this.messagesErrors.length == 0) {
      let msg: string[] = [];
      let title = this.translateService.instant("ss.msg.succes.confirmation");
      msg.push(this.translateService.instant("ss.msg.succes.confirmation.text"));
      let alertModel: AlertModel = AlertModelUtils.createAlertModel(msg, title, AlertType.SUCCESS);

      this.alertModels.push(alertModel)
    }
  }

  private populateAlertWarning() {
    if (this.messagesErrors.length == 0 && this.messagesWarning.length > 0) {
      let alertWarning: AlertModel = new AlertModel();
      alertWarning.messages = this.messagesWarning;
      alertWarning.title = this.translateService.instant("usager.msg.avertissement");
      alertWarning.type = AlertType.WARNING;
      this.alertModels.push(alertWarning)
    }
  }

  private reinitialiseMsgStack() {
    this.messagesWarning = [];
    this.messagesErrors = [];
    this.messagesFinalValidation = [];
  }

  openModal(id: string) {
    this.modalConfirmService.open(id);
  }

  closeModal(id: string) {
    this.modalConfirmService.close(id);
  }

  onChangmentTypeConfirme(service: TypeficheSelectioneService) {
  }

  onBtnRechercherIsiswClick() {
    const matDialogConfig = new MatDialogConfig();

    matDialogConfig.disableClose = false;
    matDialogConfig.autoFocus = false;
    matDialogConfig.restoreFocus = true;
    matDialogConfig.width = "90vw";
    matDialogConfig.maxWidth = "90vw";
    matDialogConfig.height = "calc(100% - 120px)";
    matDialogConfig.data = {
      url: this.sanitizer.bypassSecurityTrustResourceUrl(window["env"].urlIsiswHistoRecherche)
    };

    this.matDialog.open(MatIframeDialogComponent, matDialogConfig);
  }
}
