import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Params, Router, RouterEvent, RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SectionFicheAppelEnum } from 'projects/infosante-ng-core/src/lib/models';
import { AppelDTO } from 'projects/infosante-ng-core/src/lib/models/appel-dto';
import { FicheAppelDTO } from 'projects/infosante-ng-core/src/lib/models/fiche-appel-dto';
import { AppelApiService } from 'projects/infosante-ng-core/src/lib/services/appel-api.service';
import { FicheAppelDataService } from 'projects/infosante-ng-core/src/lib/services/fiche-appel-data.service';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import { BindingErrorsStore } from 'projects/sigct-service-ng-lib/src/lib/api-errors';
import { MaterialModalDialogService } from 'projects/sigct-service-ng-lib/src/lib/material-modal-dialog/material-modal-dialogl.service';
import { StatutFicheAppelEnum } from 'projects/sigct-service-ng-lib/src/lib/models/statut-fiche-appel.enum';
import { FicheAppelChronoService } from 'projects/sigct-service-ng-lib/src/lib/services/fiche-appel-chrono.service';
import { SigctFicheAppelNonTermineService } from 'projects/sigct-service-ng-lib/src/lib/services/sigct-fiche-appel-non-termine';
import { AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import AgeUtils from 'projects/sigct-service-ng-lib/src/lib/utils/age-utils';
import { TypeficheSelectioneService } from 'projects/sigct-ui-ng-lib/src/lib/components/grise-automatique-selon-type-intervention/grise-automatique-selon-type-intervention.component';
import { MenuItem } from 'projects/sigct-ui-ng-lib/src/lib/components/menus/menu-interface';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { OngletItem } from 'projects/sigct-ui-ng-lib/src/lib/components/onglets/onglet-interface';
import { Action, FormTopBarOptions } from 'projects/sigct-ui-ng-lib/src/lib/utils/form-top-bar-options';
import { Observable, Subscription, forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { HasAutoSave } from '../../../services/auto-save-guard.service';

const ROUTE_EDITER = "editer";
const ROUTE_APPEL = "appel";
const ROUTE_FICHE = "fiche";

export enum EnumTypeConsultationEvaluation {
  DETAIL = "DETAIL"
}

@Component({
  selector: 'editer-fiche-appel-layout',
  templateUrl: './editer-fiche-appel-layout.component.html',
  styleUrls: ['./editer-fiche-appel-layout.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class EditerFicheAppelLayoutComponent implements OnInit, OnDestroy {
  formTopBarOptions: FormTopBarOptions;
  formTopBarOptionsTitle: { icon: "fa fa-user fa-lg", };

  onglets: OngletItem[] = [];

  @ViewChild(RouterOutlet) outlet;

  @ViewChild("alertContainer", { read: ViewContainerRef, static: true })
  alertContainer;

  @ViewChild("ongletPanelContenu", { static: true })
  ongletPanelContenu: ElementRef;

  menuItemConsultation: MenuItem = {
    id: "menuItemEditerFicheAppelLayoutComponentConsultationId",
    title: "sigct.ss.f_appel.sa.btncnsltfiche",
    icon: "fa fa-file-text-o"
  };
  menuItemSaisieDifferee: MenuItem = {
    id: "menuItemEditerFicheAppelLayoutComponentSaisieDiffereeId",
    title: "sigct.sa.f_appel_rapide.menuvert.btnsaisierapideinfobulle",
    icon: "fa fa-pencil"
  };
  menuItemEvaluation: MenuItem = {
    id: "menuItemEditerFicheAppelLayoutComponentEvaluationId",
    title: "sigct.ss.f_appel.sa.btndemeval",
    icon: "fa fa-stethoscope"
  };
  menuItemUsager: MenuItem = {
    id: "menuItemEditerFicheAppelLayoutComponentUsagerId",
    title: "sigct.ss.f_appel.us.btnusager",
    icon: "fa fa-user"
  };
  menuItemProtocoles: MenuItem = {
    id: "menuItemEditerFicheAppelLayoutComponentProtocolesId",
    title: "sigct.ss.f_appel.sa.btnprotocoles",
    icon: "fa fa-suitcase"
  };
  menuItemAvis: MenuItem = {
    id: "menuItemEditerFicheAppelLayoutComponentAvisId",
    title: "sigct.ss.f_appel.btnaviscommuniques",
    icon: "fa fa-envelope-o"
  };
  menuItemIntervention: MenuItem = {
    id: "menuItemEditerFicheAppelLayoutComponentInterventionId",
    title: "sigct.ss.f_appel.sa.btnintrvtn",
    icon: "fa fa-commenting"
  };
  menuItemFichiers: MenuItem = {
    id: "menuItemEditerFicheAppelLayoutComponentFichiersId",
    title: "sigct.ss.f_appel.sa.btnfichattch",
    icon: "fa fa-paperclip"
  };
  menuItemTerminaison: MenuItem = {
    id: "menuItemEditerFicheAppelLayoutComponentTerminaisonId",
    title: "sigct.ss.f_appel.sa.btnterminaison",
    icon: "fa fa-check"
  };
  leftMenuItems: MenuItem[] = [this.menuItemConsultation, this.menuItemSaisieDifferee, this.menuItemEvaluation
    , this.menuItemUsager, this.menuItemProtocoles, this.menuItemAvis, this.menuItemIntervention, this.menuItemFichiers
    , this.menuItemTerminaison];
  titreOngletAjout: string = "sigct.ss.ajoutfichesante.btnajoutconsultation";

  /** Indique si une fenêtre de dialogue est ouverte. */
  private isDialogOpened: boolean = false;

  /** Subscription utilisé pour accumuler les souscriptions à libérer dans le OnDestroy(). */
  private subscriptions: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private appelApiService: AppelApiService,
    private ficheAppelDataService: FicheAppelDataService,
    private modalConfirmService: ConfirmationDialogService,
    private alertStore: AlertStore,
    private alertService: AlertService,
    private appContextStore: AppContextStore,
    private bindingErrorsStore: BindingErrorsStore,
    private ficheAppelNonTermineService: SigctFicheAppelNonTermineService,
    private translateService: TranslateService,
    private typeFiheSelectioneService: TypeficheSelectioneService,
    private ficheAppelChronoService: FicheAppelChronoService,
    private materialModalDialogService: MaterialModalDialogService,) {
  }

  ngOnInit() {
    this.appContextStore.setvalue('isContextAppel', true);
    this.subscriptions.add(
      this.alertStore.state$.subscribe((state: AlertModel[]) => {
        // Empêche les erreurs affichées dans le popup de s'afficher également dans ce composent,
        // car les 2 observent le même AlertStore.
        if (!this.isDialogOpened) {
          this.alertService.show(this.alertContainer, state);
        }
      })
    );

    // On souscrit au changement de fiche active.
    this.subscriptions.add(this.ficheAppelDataService.onFicheAppelActiveChange().subscribe((ficheAppelActive: FicheAppelDTO) => {
      this.typeFiheSelectioneService.initAvecFicheActive();

      this.onFicheAppelActiveChange(ficheAppelActive);
    }));

    // On souscrit au changement de liste de fiches d'appel.
    this.subscriptions.add(this.ficheAppelDataService.onListeFicheAppelChange().subscribe((listeFicheAppel: FicheAppelDTO[]) => {
      this.onListeFicheAppelChange(listeFicheAppel);
    }));

    // On souscrit au changement d'url produit par le menu gauche afin de mettre à jour les liens des onglets.
    this.subscriptions.add(this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationEnd) {
        // Ajuste le menu gauche et les onglets selon l'état de la fiche affichée.
        // Redirige vers la consultation si le menu demandé n'est pas accessible.
        this.ajusterNavigation();
      }
    }));

    // On souscrit au changement d'url produit par les onglets afin de mettre à jour l'apparence des onglets et les liens du menu gauche.
    this.subscriptions.add(this.route.params.subscribe((params: Params) => {
      const idAppel: string = params["idAppel"];
      const idFicheAppel: string = params["idFicheAppel"];

      this.ficheAppelDataService.setIdAppel(+idAppel);
      this.ficheAppelDataService.setIdFicheAppelActive(+idFicheAppel);  // Provoque un onFicheAppelActiveChange()
    }));

    // On souscrit au changement d'état de la fenêtre de dialogue usager.
    this.subscriptions.add(
      this.ficheAppelDataService.onDialogueUsagerOpened().subscribe((opened: boolean) => {
        this.isDialogOpened = opened;
      })
    );

    // On souscrit à la demande de rafraichisement de la liste des fiches d'appel.
    this.subscriptions.add(
      this.ficheAppelDataService.onRefreshListeFicheAppel().subscribe(() => {
        const idAppel = this.ficheAppelDataService.getIdAppel();
        const idFicheAppel = this.ficheAppelDataService.getIdFicheAppelActive();

        this.subscriptions.add(
          this.getListeFicheAppel(idAppel, idFicheAppel).subscribe()
        );
      })
    );

    // On subscrit à demande de changment du code type de la fiche.
    this.subscriptions.add(
      this.typeFiheSelectioneService.changementCodeType.subscribe((code) => {
        this.majFormTopBarActions();
        this.majHyperliensLeftMenu();
        this.genererOnglets();
      })
    );

    // Récupère l'id de l'appel dans l'URL. Si l'id est egal à null on crée un nouvel appel sinon on édite l'appel.
    const idAppel: string = this.route.snapshot.params["idAppel"];
    const idFicheAppelSelected: string = this.route.snapshot.params["idFicheAppel"];

    this.ficheAppelDataService.setIdAppel(+idAppel);

    // Récupère l'appel et ses fiches d'appel.
    this.subscriptions.add(
      this.getListeFicheAppel(+idAppel, +idFicheAppelSelected).subscribe(() => {
        // Démarre le chrono de la fiche d'appel si au moins une fiche d'appel est ouverte et si c'est pas une saisie rapide.
        if (this.ficheAppelDataService.getNbFicheAppelOuverte() > 0) {
          this.startChrono(+idFicheAppelSelected);
          // Maj le bouton pause
          this.majFormTopBarActions();
        }

        // Ajuste le menu gauche et les onglets selon l'état de la fiche affichée.
        // Redirige vers la consultation si le menu demandé n'est pas accessible.
        this.ajusterNavigation();
      })
    );
  }

  /**
   * Sauvegarder automatiquement la fiche d'appel quand on quitte la page
   */
  ngOnDestroy(): void {
    // Arrête et sauvegarde la durée du chrono avant de quitter la fiche d'appel.
    this.stopAndSaveChrono();

    this.subscriptions.unsubscribe();

    this.appContextStore.setvalue('isContextAppel', false);
    this.appContextStore.setvalue("mapUrlsRpi", null);
  }

  /**
   * Lance la sauvegarde automatique du chrono lorsque le navigateur se ferme, ou qu'une navigation
   * externe s'effectue (ex: retour au portail).
   * @param event
   */
  @HostListener('window:beforeunload', ['$event'])
  beforeUnload(event: any) {
    // Arrête et sauvegarde le chrono.
    this.stopAndSaveChrono();
  }

  /**
   * Lance l'autosave du composant actif et ajoute une nouvelle fiche d'appel.
   */
  onAddOngletClick() {
    if (this.outlet?.component) {
      // Vérifie si le composant affiché dans <OUTLET> possède un autosave.
      if ("autoSaveBeforeRoute" in this.outlet.component) {
        const idAppel: number = this.ficheAppelDataService.getIdAppel();

        // Récupère le résultat de l'autosave. Trois types possibles : boolean | Observable<boolean> | Promise<boolean>
        const fnAutoSaveBeforeRoute = (this.outlet.component as HasAutoSave).autoSaveBeforeRoute();

        // Lance l'ajout de la fiche d'appel selon le type de résultat obtenu.
        if (typeof fnAutoSaveBeforeRoute == "boolean") {
          if (fnAutoSaveBeforeRoute === true) {
            this.ajouterFicheAppel(idAppel);
          }
        } else if (typeof fnAutoSaveBeforeRoute == "object") {
          if (fnAutoSaveBeforeRoute instanceof Observable) {
            this.subscriptions.add(
              (fnAutoSaveBeforeRoute as Observable<true>).subscribe((result: boolean) => {
                if (result === true) {
                  this.ajouterFicheAppel(idAppel);
                }
              })
            );
          } else if (fnAutoSaveBeforeRoute instanceof Promise) {
            (fnAutoSaveBeforeRoute as Promise<true>).then((result: boolean) => {
              if (result === true) {
                this.ajouterFicheAppel(idAppel);
              }
            });
          }
        }
      }
    }
  }

  onFicheAppelActiveChange(ficheAppelActive: FicheAppelDTO) {
    if (ficheAppelActive != null) {
      this.majHyperliensLeftMenu();

      this.genererOnglets();
    }
  }

  onListeFicheAppelChange(listeFicheAppel: FicheAppelDTO[]) {
    this.genererOnglets();
  }

  onOngletClick(item: any) {
    // Démarre le chrono de la fiche d'appel si au moins une fiche d'appel est ouverte et si c'est pas une saisie rapide.
    if (this.ficheAppelDataService.getNbFicheAppelOuverte() > 0) {
      this.startChrono(item.id);
    }

    this.appContextStore.setvalue('ongletObject', item);
    this.typeFiheSelectioneService.byPassConfirmation = true;
  }

  /**
   * Arrête le chrono après le clic sur le bouton Pause.
   */
  pause = (): void => {
    // Arrête et sauvegarde le chrono.
    this.stopAndSaveChrono();

    // Fige l'écran avec une boîte de message.
    this.subscriptions.add(
      // Votre consultation est présentement sur pause. Pour reprendre votre rédaction, cliquez sur le bouton [Reprendre].
      this.materialModalDialogService.popupAvertissement("sa-iu-a10001", "200px", "600px", "button.reprendre.label").subscribe(() => {
        this.ficheAppelChronoService.startChrono(this.ficheAppelDataService.getIdFicheAppelActive());
      })
    );
  }

  /**
   * Lorsque l'utilisateur clique sur le bouton Sauvegarder.
   */
  sauvegarder = (): void => {
    // Notifie l'enfant qu'une sauvegarde est demandée.
    this.ficheAppelDataService.doSauvegarder();
  }

  /**
   * Lorsque l'utilisateur clique sur le bouton Annuler.
   * Afficher la popup pour confirmer l'annulation des informations saisies.
   */
  annuler = (): void => {
    this.openModal('confirm_popup_annuler_layout', 'ok_confirm_button');
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

  confirmPopUpAnnuler() {
    this.ficheAppelDataService.doAnnnuler();
    this.closeModal('confirm_popup_annuler_layout');
  }

  /**
   * set message de succes standard
   */
  setMessageSubmitStandard() {
    const alert: AlertModel = new AlertModel();
    //    alert.title = this.getLabel("ficheAppel.msg.succes");
    alert.type = AlertType.SUCCESS;
    if (this.alertStore.state) {
      this.alertStore.setState(this.alertStore.state.concat(alert));
    } else {
      this.alertStore.setState([alert]);
    }

    this.bindingErrorsStore.setState({});
  }

  /**
   * Ajuste le menu gauche et les onglets selon l'état de la fiche affichée.
   * Redirige vers la consultation si le menu demandé n'est pas accessible.
   */
  private ajusterNavigation() {
    // Garde en mémoire la dernière section affichée de la fiche d'appel. Sauf pour NOTE, on sauvegarde sa section parent CONSULTATION.
    let sectionEnCours: SectionFicheAppelEnum = this.obtenirSectionFicheAppelEnCours();

    if (sectionEnCours == SectionFicheAppelEnum.NOTES) {
      sectionEnCours = SectionFicheAppelEnum.CONSULTATION;
    }
    this.ficheAppelDataService.setLastSectionAffFicheAppel(this.ficheAppelDataService.getIdFicheAppelActive(), sectionEnCours);

    this.majFormTopBarActions();
    this.majHyperliensLeftMenu();
    this.genererOnglets();

    this.redirectSiMenuNonVisible();
  }

  /**
   * Ajoute une nouvelle fiche d'appel dans la BD et se positionne dessus.
   */
  private ajouterFicheAppel(idAppel: number) {
    //    const idAppel: number = this.ficheAppelDataService.getIdAppel();
    const typeConsultation: string = EnumTypeConsultationEvaluation.DETAIL;

    this.subscriptions.add(
      this.appelApiService.ajouterFicheAppel(idAppel, typeConsultation).subscribe((idFicheAppel: number) => {
        // Instancie et démarre le chrono de la nouvelle fiche d'appel
        this.startChrono(idFicheAppel);

        // Récupère les fiches pour obtenir la nouvelle fiche.
        this.subscriptions.add(
          this.getListeFicheAppel(idAppel, idFicheAppel).subscribe(() => {
            if (this.ficheAppelDataService.isAppelSaisieDifferee()) {
              // Navigue vers Saisie rapide
              this.router.navigate(["/" + ROUTE_EDITER, ROUTE_APPEL, this.ficheAppelDataService.getIdAppel(), ROUTE_FICHE, idFicheAppel, SectionFicheAppelEnum.SAISIE_DIFFEREE]);
            } else {
              // Navigue vers Demande et évaluation
              this.router.navigate(["/" + ROUTE_EDITER, ROUTE_APPEL, this.ficheAppelDataService.getIdAppel(), ROUTE_FICHE, idFicheAppel, SectionFicheAppelEnum.EVALUATION]);
            }

            //On ajoute une fiche d'appel, on demande d'interroger le nombre de fiche d'appel non termine afin de mettre a jour le "badge" dans le menu du haut
            this.ficheAppelNonTermineService.doRefreshNbListeFicheAppelNonTermine(window["env"].urlSanteApi + '/');
          })
        );
      })
    );
  }

  /**
   * Récupère les fiches d'appel d'un appel.
   * @param idAppel identifiant de l'appel
   * @param idFicheAppelSelected identifiant de la fiche d'appel sélectionnée
   */
  private getListeFicheAppel(idAppel: number, idFicheAppelSelected: number): Observable<void> {
    if (idAppel) {
      return forkJoin([
        this.appelApiService.obtenirAppel(idAppel),
        this.appelApiService.obtenirFicheAppels(idAppel)]).pipe(map(results => {
          if (results[0]) {
            const appelDto: AppelDTO = results[0] as AppelDTO;
            this.ficheAppelDataService.setAppelSaisieDifferee(appelDto.saisieDifferee);
          }

          if (results[1]) {
            let ficheAppelDtos: FicheAppelDTO[] = results[1] as FicheAppelDTO[];

            this.ficheAppelDataService.clear();
            this.ficheAppelDataService.setIdAppel(idAppel);

            if (ficheAppelDtos && ficheAppelDtos.length > 0) {
              // Au début le serivce nous apporte toutes les fiches d'appel liées à l'apple passé en parametres
              // Mais en réalité on aura besoin uniquement des fiches non supprimées avec un statut égale à 'O' ou 'F'
              ficheAppelDtos = ficheAppelDtos.filter(dto => dto.statut == StatutFicheAppelEnum.OUVERT || dto.statut == StatutFicheAppelEnum.FERME);
              // Si toutes les fichiers liées à l'appel passé en parametres ont un statut différent de 'O' ou 'F'
              // l'application sera rediriger vers l'accueil.
              if (ficheAppelDtos.length == 0) {
                this.router.navigate(["/" + "accueil"]);
              }
              this.ficheAppelDataService.setListeFicheAppel(ficheAppelDtos);

              if (!idFicheAppelSelected) {
                if (ficheAppelDtos && ficheAppelDtos.length > 0) {
                  const idFirstFicheAppel: number = ficheAppelDtos[0].id;

                  // Active la première fiche.
                  this.ficheAppelDataService.setIdFicheAppelActive(idFirstFicheAppel);
                }
              } else {
                // Active la fiche demandée.
                this.ficheAppelDataService.setIdFicheAppelActive(idFicheAppelSelected);
              }
            } else {
              // Aucune fiche d'appel n'existe dans l'appel. On en crée une par défaut.
              this.ajouterFicheAppel(idAppel);
            }
          }
          return;
        },
          err => {
            let alert: AlertModel = new AlertModel();
            //          alert.messages = [this.getLabel("ficheAppel.msg.non.trouve")];
            alert.messages = ["ficheAppel.msg.non.trouve"];
            alert.title = "Message d'erreur :";
            alert.type = AlertType.ERROR;
            this.alertStore.setAlerts([alert]);
            return;
          })
        );
    } else {
      // NB: ne devrait pas survenir, car le routing l'empêche.
      let alert: AlertModel = new AlertModel();
      alert.messages = ["L'identifiant de l'appel est obligatoire"];
      alert.title = "Message d'erreur :";
      alert.type = AlertType.ERROR;
      this.alertStore.setAlerts([alert]);
      return of();
    }
  }


  /**
   * Met à jour les boutons présents dans le menu de boutons d'actions en haut et droite selon la section active.
   */
  private majFormTopBarActions() {
    const section: SectionFicheAppelEnum = this.obtenirSectionFicheAppelEnCours();

    const btnPauseInfobulle: string = this.translateService.instant("sigct.ss.menugrise.btnpauseinfobulle");
    const btnSauvegarderLabel: string = this.translateService.instant("sigct.ss.menugrise.btnsvgrd");
    const btnAnnulerLabel: string = this.translateService.instant("sigct.ss.menugrise.btnannuler");

    let actions: Action[] = [];
    // Ajoute le bouton Pause uniquement si au moins une fiche est Ouverte et qu'on est pas en saisie différée.
    if (this.ficheAppelDataService.getNbFicheOuverte() > 0 && !this.ficheAppelDataService.isAppelSaisieDifferee()) {
      actions = [
        { icon: "fa fa-pause", actionFunction: this.pause, compId: 'pauseBtn', extraClass: "btn-primary form-btn", tooltip: btnPauseInfobulle },
      ];
    }

    if (section == SectionFicheAppelEnum.CONSULTATION || section == SectionFicheAppelEnum.NOTES || section == SectionFicheAppelEnum.PROTOCOLES
      || section == SectionFicheAppelEnum.AVIS) {
      // Les bouton Sauvegarder et Annuler ne sont pas visibles en CONSULTATION ou NOTES ou PROTOCOLES ou AVIS.
      this.formTopBarOptions = {
        title: { icon: "" },
        actions: actions
      };
    } else {
      this.formTopBarOptions = {
        title: { icon: "" },
        actions: [
          ...actions,
          { label: btnSauvegarderLabel, actionFunction: this.sauvegarder, compId: 'sauvegarderBtn', extraClass: "btn-primary form-btn" },
          { label: btnAnnulerLabel, actionFunction: this.annuler, compId: 'annulerBtn', extraClass: "btn-default form-btn" }
        ]
      };
    }
  }

  /**
   * Met à jour les liens du menu de gauche.
   */
  private majHyperliensLeftMenu() {
    const isFicheActiveOuverte: boolean = this.ficheAppelDataService.getStatutFicheAppelActive() === StatutFicheAppelEnum.OUVERT;

    const url: string = this.router.url.substring(0, this.router.url.lastIndexOf("/"));
    const section: SectionFicheAppelEnum = this.obtenirSectionFicheAppelEnCours();
    const isSaisieDifferee: boolean = this.ficheAppelDataService.isAppelSaisieDifferee();

    this.menuItemConsultation.link = url + "/" + SectionFicheAppelEnum.CONSULTATION;
    this.menuItemConsultation.visible = true;
    this.menuItemConsultation.isActive = (section == SectionFicheAppelEnum.CONSULTATION || section == SectionFicheAppelEnum.NOTES);

    this.menuItemEvaluation.link = url + "/" + SectionFicheAppelEnum.EVALUATION;
    this.menuItemEvaluation.visible = isFicheActiveOuverte && !isSaisieDifferee;

    this.menuItemSaisieDifferee.link = url + "/" + SectionFicheAppelEnum.SAISIE_DIFFEREE;
    this.menuItemSaisieDifferee.visible = isFicheActiveOuverte && isSaisieDifferee;

    this.menuItemUsager.link = url + "/" + SectionFicheAppelEnum.USAGER;
    this.menuItemUsager.visible = isFicheActiveOuverte;

    this.menuItemProtocoles.link = url + "/" + SectionFicheAppelEnum.PROTOCOLES;
    this.menuItemProtocoles.visible = isFicheActiveOuverte && !isSaisieDifferee;
    this.menuItemProtocoles.disabled = this.typeFiheSelectioneService.isNomPert() || this.typeFiheSelectioneService.isDemress();

    this.menuItemAvis.link = url + "/" + SectionFicheAppelEnum.AVIS;
    this.menuItemAvis.visible = isFicheActiveOuverte && !isSaisieDifferee;
    this.menuItemAvis.disabled = this.typeFiheSelectioneService.isNomPert();

    this.menuItemIntervention.link = url + "/" + SectionFicheAppelEnum.INTERVENTION;
    this.menuItemIntervention.visible = isFicheActiveOuverte && !isSaisieDifferee;

    this.menuItemFichiers.link = url + "/" + SectionFicheAppelEnum.FICHIERS;
    this.menuItemFichiers.visible = isFicheActiveOuverte && !isSaisieDifferee;
    this.menuItemFichiers.disabled = this.typeFiheSelectioneService.isNomPert() || this.typeFiheSelectioneService.isDemress();

    this.menuItemTerminaison.link = url + "/" + SectionFicheAppelEnum.TERMINAISON;
    this.menuItemTerminaison.visible = isFicheActiveOuverte && !isSaisieDifferee;
  }

  /**
   * Récupère la section affichée dans l'url en cours.
   */
  private obtenirSectionFicheAppelEnCours(): SectionFicheAppelEnum {
    let suffixe: SectionFicheAppelEnum = SectionFicheAppelEnum.EVALUATION;

    const url: string = this.router.url;
    if (url) {
      if (url.endsWith(SectionFicheAppelEnum.CONSULTATION)) {
        suffixe = SectionFicheAppelEnum.CONSULTATION;
      } else if (url.endsWith(SectionFicheAppelEnum.EVALUATION)) {
        suffixe = SectionFicheAppelEnum.EVALUATION;
      } else if (url.endsWith(SectionFicheAppelEnum.SAISIE_DIFFEREE)) {
        suffixe = SectionFicheAppelEnum.SAISIE_DIFFEREE;
      } else if (url.endsWith(SectionFicheAppelEnum.USAGER)) {
        suffixe = SectionFicheAppelEnum.USAGER;
      } else if (url.endsWith(SectionFicheAppelEnum.PROTOCOLES)) {
        suffixe = SectionFicheAppelEnum.PROTOCOLES;
      } else if (url.endsWith(SectionFicheAppelEnum.AVIS)) {
        suffixe = SectionFicheAppelEnum.AVIS;
      } else if (url.endsWith(SectionFicheAppelEnum.INTERVENTION)) {
        suffixe = SectionFicheAppelEnum.INTERVENTION;
      } else if (url.endsWith(SectionFicheAppelEnum.FICHIERS)) {
        suffixe = SectionFicheAppelEnum.FICHIERS;
      } else if (url.endsWith(SectionFicheAppelEnum.TERMINAISON)) {
        suffixe = SectionFicheAppelEnum.TERMINAISON;
      } else if (url.endsWith(SectionFicheAppelEnum.RELANCE)) {
        suffixe = SectionFicheAppelEnum.RELANCE;
      } else if (url.endsWith(SectionFicheAppelEnum.NOTES)) {
        suffixe = SectionFicheAppelEnum.NOTES;
      } else if (url.indexOf(SectionFicheAppelEnum.AVIS) != -1) {
        suffixe = SectionFicheAppelEnum.AVIS;
      }
    }
    return suffixe;
  }

  private redirectSiMenuNonVisible(): void {
    // Si la navigation porte sur un menu non visible, on redirige vers le menu CONSULTATION qui est toujours visible.
    const suffixe: string = this.router.url.substr(this.router.url.lastIndexOf("/") + 1);
    if ((suffixe == SectionFicheAppelEnum.EVALUATION && (!this.menuItemEvaluation.visible || this.menuItemEvaluation.disabled)) ||
      (suffixe == SectionFicheAppelEnum.SAISIE_DIFFEREE && (!this.menuItemSaisieDifferee.visible || this.menuItemSaisieDifferee.disabled)) ||
      (suffixe == SectionFicheAppelEnum.USAGER && (!this.menuItemUsager.visible || this.menuItemUsager.disabled)) ||
      (suffixe == SectionFicheAppelEnum.PROTOCOLES && (!this.menuItemProtocoles.visible || this.menuItemProtocoles.disabled)) ||
      (suffixe == SectionFicheAppelEnum.AVIS && (!this.menuItemAvis.visible || this.menuItemAvis.disabled)) ||
      (suffixe == SectionFicheAppelEnum.INTERVENTION && (!this.menuItemIntervention.visible || this.menuItemIntervention.disabled)) ||
      (suffixe == SectionFicheAppelEnum.FICHIERS && (!this.menuItemFichiers.visible || this.menuItemFichiers.disabled)) ||
      (suffixe == SectionFicheAppelEnum.TERMINAISON && (!this.menuItemTerminaison.visible || this.menuItemTerminaison.disabled))) {
      // Redirection vers le menu CONSULTATION qui est toujours visible.
      this.router.navigate(["../" + SectionFicheAppelEnum.CONSULTATION], { relativeTo: this.route.firstChild });
    }
  }

  /**
   * Crée un onglet pour une fiche d'appel.
   * @param ficheAppelDto
   * @return la fiche d'appel sous la fome d'un OngletItem
   */
  private ficheAppelDtoToOngletItem(ficheAppelDto: FicheAppelDTO, urlSuffixe: string): OngletItem {
    let ongletItem: OngletItem = null;

    if (ficheAppelDto) {
      let isUsagerLinked: boolean = ficheAppelDto.usager?.id ? true : false;
      ongletItem = {
        id: ficheAppelDto.id,
        libelle: this.getLibelleOnglet(ficheAppelDto),
        isUsagerLinked: isUsagerLinked,
        urlSuffixeOnglet: urlSuffixe,
        isSelected: this.ficheAppelDataService.getIdFicheAppelActive() == ficheAppelDto.id,
        url: "/" + ROUTE_EDITER + "/" + ROUTE_APPEL + "/" + this.ficheAppelDataService.getIdAppel() + "/" + ROUTE_FICHE + "/" + ficheAppelDto.id + "/" + urlSuffixe
      };
    }
    return ongletItem;
  }

  /**
   * Crée les onglets d'une liste de fiches d'appel.
   */
  private genererOnglets() {
    this.onglets = [];

    if (this.ficheAppelDataService.getListeFicheAppel()) {
      // Boucle sur les fiches d'appel pour créer leurs onglets.
      this.ficheAppelDataService.getListeFicheAppel().forEach((ficheAppel: FicheAppelDTO) => {
        // Récupère la dernière section affichée dans cette fiche d'appel.
        let urlSuffixeOnglet: SectionFicheAppelEnum = this.ficheAppelDataService.getLastSectionAffFicheAppel(ficheAppel.id);

        // Si la fiche n'a jamais été affichée, on affichera la section "Demande et évaluation" ou "Saisie rapide" pour une fiche en saisie différée.
        if (!urlSuffixeOnglet) {
          urlSuffixeOnglet = this.ficheAppelDataService.isAppelSaisieDifferee() ? SectionFicheAppelEnum.SAISIE_DIFFEREE : SectionFicheAppelEnum.EVALUATION;
        }

        // Si la fiche d'appel est fermée et qu'on est positionné sur une autre section que "Consultation" ou "Notes complémentaires",
        // on définit le lien de l'onglet vers la consultation.
        if (ficheAppel.statut == StatutFicheAppelEnum.FERME && urlSuffixeOnglet != SectionFicheAppelEnum.CONSULTATION && urlSuffixeOnglet != SectionFicheAppelEnum.NOTES) {
          urlSuffixeOnglet = SectionFicheAppelEnum.CONSULTATION;
        }

        this.onglets.push(this.ficheAppelDtoToOngletItem(ficheAppel, urlSuffixeOnglet));
      });
    }
  }

  /**
   * Génère le libellé de l'onglet.
   * @param ficheAppelDto
   */
  private getLibelleOnglet(ficheAppelDto: FicheAppelDTO): string {
    let prenomNom: string = "";
    let age: string = null;

    if (ficheAppelDto && ficheAppelDto.usager) {
      if (ficheAppelDto.usager.usagerAnonyme) {
        prenomNom = this.translateService.instant('sigct.ss.f_appel.onglet.usagernonid');
      } else if (ficheAppelDto.usager.usagerIdentification) {
        let isValidPrenom: Boolean = ficheAppelDto.usager.usagerIdentification.prenom &&
          ficheAppelDto.usager.usagerIdentification.prenom != null;
        if (isValidPrenom) {
          prenomNom = ficheAppelDto.usager.usagerIdentification.prenom;
        }

        let isValidNom: Boolean = ficheAppelDto.usager.usagerIdentification.nom &&
          ficheAppelDto.usager.usagerIdentification.nom != null;
        if (isValidNom) {
          prenomNom += " " + ficheAppelDto.usager.usagerIdentification.nom;
        }

        if (prenomNom) {
          prenomNom = prenomNom.trim();
        }
      }
      age = AgeUtils.formaterAgeFormatCourt(ficheAppelDto.usager.ageAnnees, ficheAppelDto.usager.ageMois, ficheAppelDto.usager.ageJours);
    }

    if (!prenomNom || prenomNom == "") {
      prenomNom = this.translateService.instant('sigct.ss.f_appel.onglet.usagernonid');
    }

    if (age && age != "") {
      return prenomNom + " (" + age + ")";
    } else {
      return prenomNom;
    }
  }

  /**
   * Interception des événements keydown.Space pour évité le scroll quand
   * l'élément déclencheur est un bouton image avec un lien.  Uniquement
   * utile pour la navigation au clavier.
   * @param event
   */
  @HostListener('keydown.Space', ['$event'])
  onKeydownSpace(event) {

    let cible = event.target.toString();

    //Si la cible contient un #, cela signifie que l'élément est un url sur la page active et que
    //la rédirection doit être arrêté.  Dans tous les autres cas, on laisse le code continuer.
    if (cible.endsWith("#")) {

      event.preventDefault();

    }
  }

  public onActivate(event) {
    this.scrollTop();
  }

  private scrollTop() {
    this.ongletPanelContenu.nativeElement.scrollTop = 0;
  }

  /**
   * Démarre le chrono si la fiche n'est pas en saisie rapide.
   * @param idFicheAppel
   */
  private startChrono(idFicheAppel: number): void {
    if (!this.ficheAppelDataService.isAppelSaisieDifferee()) {
      this.ficheAppelChronoService.startChrono(idFicheAppel);
    }
  }

  /**
   * Arrête le chrono si la fiche n'est pas en saisie rapide.
   */
  private stopAndSaveChrono(): void {
    if (!this.ficheAppelDataService.isAppelSaisieDifferee()) {
      this.ficheAppelChronoService.stopAndSaveChrono();
    }
  }
}

