import { Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild, ViewContainerRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Event, NavigationEnd, Params, Router, RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FicheAppelSocialDTO } from 'projects/infosocial-ng-core/src/lib/models';
import { AppelApiService } from 'projects/infosocial-ng-core/src/lib/services/appel-api.service';
import { FicheAppelDataService, SectionFicheAppelEnum } from 'projects/infosocial-ng-core/src/lib/services/fiche-appel-data.service';
import { UsagerApiService } from 'projects/infosocial-ng-core/src/lib/services/usager-api.service';
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
import { Action, FormTopBarOptions } from "projects/sigct-ui-ng-lib/src/lib/utils/form-top-bar-options";
import { Observable, Subscription, forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppelDTO } from '../../../models';
import { HasAutoSave } from '../../../services/auto-save-guard.service';

const ROUTE_EDITER = "editer";
const ROUTE_APPEL = "appel";
const ROUTE_FICHE = "fiche";

export enum TypeFicheInterventionEnum {
  DETAIL = "DETAIL"
}

@Component({
  selector: 'editer-fiche-appel-layout',
  templateUrl: './editer-fiche-appel-layout.component.html',
  providers: [AppelApiService, UsagerApiService, ConfirmationDialogService],
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


  menuItemConsultation: MenuItem;
  menuItemEvaluation: MenuItem;
  menuItemUsager: MenuItem;
  menuItemProtocoles: MenuItem;
  menuItemAvis: MenuItem;
  menuItemPlanAction: MenuItem;
  menuItemFichiers: MenuItem;
  menuItemTerminaison: MenuItem;

  leftMenuItems: MenuItem[] = [];
  
  titreOngletAjout: string = "sigct.ss.ajoutfichesocial.btnajoutintervention";

  /** Indique si une fenêtre de dialogue est ouverte. */
  private isDialogOpened: boolean = false;

  /** Subscription utilisé pour accumuler les souscriptions à libérer dans le OnDestroy(). */
  private subscriptionsEditerFicheAppel: Subscription = new Subscription();

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
    private materialModalDialogService: MaterialModalDialogService) {
  }

  ngOnInit() {
    this.appContextStore.setvalue('isContextAppel', true);
    this.appContextStore.setvalue('confirmAnnuler', false);

    this.subscriptionsEditerFicheAppel.add(
      this.alertStore.state$.subscribe((state: AlertModel[]) => {
        // Empêche les erreurs affichées dans le popup de s'afficher également dans ce composent,
        // car les 2 observent le même AlertStore.
        if (!this.isDialogOpened) {
          this.alertService.show(this.alertContainer, state);
        }
      })
    );

    // On souscrit au changement de fiche active.
    this.subscriptionsEditerFicheAppel.add(this.ficheAppelDataService.onFicheAppelActiveChange().subscribe((ficheAppelActive: FicheAppelSocialDTO) => {
      this.onFicheAppelActiveChange(ficheAppelActive);
    }));

    // On souscrit au changement de liste de fiches d'appel.
    this.subscriptionsEditerFicheAppel.add(this.ficheAppelDataService.onListeFicheAppelChange().subscribe((listeFicheAppel: FicheAppelSocialDTO[]) => {
      this.onListeFicheAppelChange(listeFicheAppel);
    }));

    // On souscrit au changement d'url produit par le menu gauche afin de mettre à jour les liens des onglets.
    this.subscriptionsEditerFicheAppel.add(this.router.events.subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        // Garde en mémoire la dernière section affichée de la fiche d'appel.
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
    }));

    // On souscrit au changement d'url produit par les onglets afin de mettre à jour l'apparence des onglets et les liens du menu gauche.
    this.subscriptionsEditerFicheAppel.add(this.route.params.subscribe((params: Params) => {
      const idAppel: string = params["idAppel"];
      const idFicheAppel: string = params["idFicheAppel"];

      this.ficheAppelDataService.setIdAppel(+idAppel);
      this.ficheAppelDataService.setFicheAppelActive(+idFicheAppel);  // Provoque un onFicheAppelActiveChange()
    }));

    // On souscrit au changement d'état de la fenêtre de dialogue usager.
    this.subscriptionsEditerFicheAppel.add(
      this.ficheAppelDataService.onDialogueUsagerOpened().subscribe((opened: boolean) => {
        this.isDialogOpened = opened;
      })
    );

    // On souscrit à la demande de rafraichisement de la liste des fiches d'appel.
    this.subscriptionsEditerFicheAppel.add(
      this.ficheAppelDataService.onRefreshListeFicheAppel().subscribe(() => {
        const idAppel = this.ficheAppelDataService.getIdAppel();
        const idFicheAppel = this.ficheAppelDataService.getIdFicheAppelActive();

        this.subscriptionsEditerFicheAppel.add(
          this.getFicheAppels(idAppel, idFicheAppel).subscribe()
        );
      })
    );

    // On subscrit à demande de changment du code type de la fiche.
    this.subscriptionsEditerFicheAppel.add(
      this.typeFiheSelectioneService.changementCodeType.subscribe((code) => {
        this.majFormTopBarActions();
        this.majHyperliensLeftMenu();
      })
    );

    // Menu de boutons d'actions en haut et droite
    this.majFormTopBarActions();

    // Récupère l'id de l'appel dans l'URL. Si l'id est egal à null on crée un nouvel appel sinon on édite l'appel.
    const idAppel: string = this.route.snapshot.params["idAppel"];
    const idFicheAppelSelected: string = this.route.snapshot.params["idFicheAppel"];

    this.ficheAppelDataService.setIdAppel(+idAppel);

    // Récupère de la BD les fiches de l'appel.
    this.subscriptionsEditerFicheAppel.add(
      this.getFicheAppels(+idAppel, +idFicheAppelSelected).subscribe(() => {
        // Démarre le chrono de la fiche d'appel si au moins une fiche d'appel est ouverte et si c'est pas une saisie rapide.
        if (this.ficheAppelDataService.getNbFicheAppelOuverte() > 0) {
          this.startChrono(+idFicheAppelSelected);
          // Maj le bouton pause
          this.majFormTopBarActions();
        }
      })
    );

    let sectionEnCours: SectionFicheAppelEnum = this.obtenirSectionFicheAppelEnCours();
    // Garde en mémoire la dernière section affichée de la fiche d'appel. Sauf pour NOTE, on sauvegarde sa section parent CONSULTATION.
    if (sectionEnCours == SectionFicheAppelEnum.NOTES) {
      sectionEnCours = SectionFicheAppelEnum.CONSULTATION;
    }
    this.ficheAppelDataService.setLastSectionAffFicheAppel(+idFicheAppelSelected, sectionEnCours);
  }

  /**
   * Met à jour les boutons présents dans le menu de boutons d'actions en haut et droite selon la section active.
   */
  private majFormTopBarActions() {
    const urlSuffixe: string = this.obtenirSectionFicheAppelEnCours();

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

    if (urlSuffixe == SectionFicheAppelEnum.CONSULTATION || urlSuffixe == SectionFicheAppelEnum.NOTES || urlSuffixe == SectionFicheAppelEnum.PROTOCOLES
      || urlSuffixe == SectionFicheAppelEnum.AVIS) {
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
   * Sauvegarder automatiquement la fiche d'appel quand on quitte la page
   */
  ngOnDestroy(): void {
    // Arrête et sauvegarde la durée du chrono avant de quitter la fiche d'appel.
    this.stopAndSaveChrono();

    this.subscriptionsEditerFicheAppel.unsubscribe();

    this.appContextStore.setvalue('isContextAppel', false);
    this.appContextStore.setvalue('confirmAnnuler', false);
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
            this.subscriptionsEditerFicheAppel.add(
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

  onFicheAppelActiveChange(ficheAppelActive: FicheAppelSocialDTO) {
    this.majHyperliensLeftMenu();

    this.genererOnglets();
  }

  onListeFicheAppelChange(listeFicheAppel: FicheAppelSocialDTO[]) {
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
    this.subscriptionsEditerFicheAppel.add(
      // Votre consultation est présentement sur pause. Pour reprendre votre rédaction, cliquez sur le bouton [Reprendre].
      this.materialModalDialogService.popupAvertissement("so-iu-a10001", "200px", "600px", "button.reprendre.label").subscribe(() => {
        this.startChrono(this.ficheAppelDataService.getIdFicheAppelActive());
      })
    );
  }

  /**
   * Lancer la sauvegarde après le click sur le bouton Sauvegarder
   */
  sauvegarder = (): void => {
    // Notifie les observers qu'une sauvegarde est demandée.
    this.ficheAppelDataService.doSauvegarder();
  }

  /**
   * annuler les informations saisis après le click sur le bouton Annuler
   */
  annuler = (): void => {
    this.modalConfirmService.openAndFocus('confirm_popup_annuler_layout', 'ok_confirm_button');
  }

  confirmPopUpAnnuler() {
    this.ficheAppelDataService.doAnnnuler();
    this.modalConfirmService.close('confirm_popup_annuler_layout');
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
   * Ajoute une nouvelle fiche d'appel dans la BD et se positionne dessus.
   */
  private ajouterFicheAppel(idAppel: number) {
    //    const idAppel: number = this.ficheAppelDataService.getIdAppel();
    const typeFicheIntervention: string = TypeFicheInterventionEnum.DETAIL;

    this.subscriptionsEditerFicheAppel.add(
      this.appelApiService.ajouterFicheAppel(idAppel, typeFicheIntervention).subscribe((idFicheAppel: number) => {
        // Instancie et démarre le chrono de la nouvelle fiche d'appel
        this.startChrono(idFicheAppel);

        // Récupère les fiches pour obtenir la nouvelle fiche.
        this.subscriptionsEditerFicheAppel.add(
          this.getFicheAppels(idAppel, idFicheAppel).subscribe(() => {
            // Navigue vers Demande et analyse
            this.router.navigate(["/" + ROUTE_EDITER, ROUTE_APPEL, this.ficheAppelDataService.getIdAppel(), ROUTE_FICHE, idFicheAppel, SectionFicheAppelEnum.EVALUATION]);

            //On ajoute une fiche d'appel, on demande d'interroger le nombre de fiche d'appel non termine afin de mettre a jour le "badge" dans le menu du haut
            this.ficheAppelNonTermineService.doRefreshNbListeFicheAppelNonTermine(window["env"].urlInfoSocial + '/api/');
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
  private getFicheAppels(idAppel: number, idFicheAppelSelected: number): Observable<void> {
    if (idAppel) {
      // Récupère l'appel de la BD.
      return forkJoin([
        this.appelApiService.obtenirAppel(idAppel),
        this.appelApiService.obtenirFicheAppels(idAppel)]).pipe(map(results => {
          if (results[0]) {
            const appelDto: AppelDTO = results[0] as AppelDTO;
            this.ficheAppelDataService.setAppelSaisieDifferee(appelDto.saisieDifferee);
          }

          if (results[1]) {
            let ficheAppelSocialDtos: FicheAppelSocialDTO[] = results[1] as FicheAppelSocialDTO[];

            this.ficheAppelDataService.clear();
            this.ficheAppelDataService.setIdAppel(idAppel);

            if (ficheAppelSocialDtos && ficheAppelSocialDtos.length > 0) {
              // Au début le serivce nous apporte toutes les fiches d'appel liées à l'apple passé en parametres
              // Mais en réalité on aura besoin uniquement des fiches non supprimées avec un statut égale à 'O' ou 'F'
              ficheAppelSocialDtos = ficheAppelSocialDtos.filter(dto => dto?.statut == StatutFicheAppelEnum.OUVERT || dto?.statut == StatutFicheAppelEnum.FERME);
              // Si toutes les fichiers liées à l'appel passé en parametres ont un statut différent de 'O' ou 'F'
              // l'application sera rediriger vers l'accueil.
              if (!ficheAppelSocialDtos || ficheAppelSocialDtos.length == 0) {
                this.router.navigate(["/" + "accueil"]);
              }
              this.ficheAppelDataService.setListeFicheAppel(ficheAppelSocialDtos);

              if (!idFicheAppelSelected) {
                if (ficheAppelSocialDtos && ficheAppelSocialDtos.length > 0) {
                  const idFirstFicheAppel: number = ficheAppelSocialDtos[0].id;

                  // Active la première fiche.
                  this.ficheAppelDataService.setFicheAppelActive(idFirstFicheAppel);
                }
              } else {
                // Active la fiche demandée.
                this.ficheAppelDataService.setFicheAppelActive(idFicheAppelSelected);
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
   * Met à jour les liens du menu de gauche.
   */
  private majHyperliensLeftMenu() {
    const idAppel: string = "" + this.ficheAppelDataService.getIdAppel();
    const idFicheAppelActive: string = "" + this.ficheAppelDataService.getIdFicheAppelActive();

    const isFicheActiveOuverte: boolean = this.ficheAppelDataService.getStatutFicheAppelActive() === StatutFicheAppelEnum.OUVERT;
    const section: SectionFicheAppelEnum = this.obtenirSectionFicheAppelEnCours();

    const url: string = "/" + ROUTE_EDITER + "/" + ROUTE_APPEL + "/" + idAppel + "/" + ROUTE_FICHE + "/" + idFicheAppelActive;

    this.menuItemConsultation = {
      id: "menuItemEditerFicheAppelLayoutComponentConsultationId",
      title: "sigct.so.f_appel.menuver.visuinter",
      link: url + "/" + SectionFicheAppelEnum.CONSULTATION,
      icon: "fa fa-file-text-o",
      visible: true,
      isActive: (section == SectionFicheAppelEnum.CONSULTATION || section == SectionFicheAppelEnum.NOTES)
    };
    this.menuItemEvaluation = {
      id: "menuItemEditerFicheAppelLayoutComponentEvaluationId",
      title: "sigct.so.f_appel.menuver.demanalyse",
      link: url + "/" + SectionFicheAppelEnum.EVALUATION,
      icon: "fa fa-comments",
      visible: isFicheActiveOuverte
    };
    this.menuItemUsager = {
      id: "menuItemEditerFicheAppelLayoutComponentUsagerId",
      title: "sigct.so.f_appel.menuver.usager",
      link: url + "/" + SectionFicheAppelEnum.USAGER,
      icon: "fa fa-user",
      visible: isFicheActiveOuverte,
    };
    this.menuItemProtocoles = {
      id: "menuItemEditerFicheAppelLayoutComponentProtocolesId",
      title: "sigct.so.f_appel.menuver.referentiels",
      link: url + "/" + SectionFicheAppelEnum.PROTOCOLES,
      icon: "fa fa-suitcase",
      visible: isFicheActiveOuverte,
      disabled: !this.typeFiheSelectioneService.isDetail(),
    };
    this.menuItemAvis = {
      id: "menuItemEditerFicheAppelLayoutComponentAvisId",
      title: "sigct.ss.f_appel.btnaviscommuniques",
      link: url + "/" + SectionFicheAppelEnum.AVIS,
      icon: "fa fa-envelope-o",
      visible: isFicheActiveOuverte,
      disabled: this.typeFiheSelectioneService.isNomPert()

    };
    this.menuItemPlanAction = {
      id: "menuItemEditerFicheAppelLayoutComponentPlanActionId",
      title: "sigct.so.f_appel.menuver.planaction",
      link: url + "/" + SectionFicheAppelEnum.PLAN_ACTION,
      icon: "fa fa-commenting",
      visible: isFicheActiveOuverte
    };
    this.menuItemFichiers = {
      id: "menuItemEditerFicheAppelLayoutComponentFichiersId",
      title: "sigct.so.f_appel.menuver.fichattaches",
      link: url + "/" + SectionFicheAppelEnum.FICHIERS,
      icon: "fa fa-paperclip",
      visible: isFicheActiveOuverte,
      disabled: !this.typeFiheSelectioneService.isDetail()
    };
    this.menuItemTerminaison = {
      id: "menuItemEditerFicheAppelLayoutComponentTerminaisonId",
      title: "sigct.so.f_appel.menuver.terminaison",
      link: url + "/" + SectionFicheAppelEnum.TERMINAISON,
      icon: "fa fa-check",
      visible: isFicheActiveOuverte
    };

    this.leftMenuItems = [
      this.menuItemConsultation,
      this.menuItemEvaluation,
      this.menuItemUsager,
      this.menuItemProtocoles,
      this.menuItemAvis,
      this.menuItemPlanAction,
      this.menuItemFichiers,
      this.menuItemTerminaison,
    ];
  }

  private redirectSiMenuNonVisible(): void {
    // Si la navigation porte sur un menu non visible, on redirige vers le menu CONSULTATION qui est toujours visible.
    const suffixe: string = this.router.url.substr(this.router.url.lastIndexOf("/") + 1);
    if ((suffixe == SectionFicheAppelEnum.EVALUATION && !this.menuItemEvaluation.visible) ||
      (suffixe == SectionFicheAppelEnum.USAGER && !this.menuItemUsager.visible) ||
      (suffixe == SectionFicheAppelEnum.PROTOCOLES && !this.menuItemProtocoles.visible) ||
      (suffixe == SectionFicheAppelEnum.AVIS && !this.menuItemAvis.visible) ||
      (suffixe == SectionFicheAppelEnum.PLAN_ACTION && !this.menuItemPlanAction.visible) ||
      (suffixe == SectionFicheAppelEnum.FICHIERS && !this.menuItemFichiers.visible) ||
      (suffixe == SectionFicheAppelEnum.TERMINAISON && !this.menuItemTerminaison.visible)) {
      // Redirection vers le menu CONSULTATION qui est toujours visible.
      this.router.navigate(["../" + SectionFicheAppelEnum.CONSULTATION], { relativeTo: this.route.firstChild });
    }
  }

  /**
   * Récupère la dernière section de l'url introduite par le menu gauche.
   */
  obtenirSectionFicheAppelEnCours(): SectionFicheAppelEnum {
    let suffixe: SectionFicheAppelEnum = SectionFicheAppelEnum.EVALUATION;

    const url = this.router.url;
    if (url) {
      if (url.endsWith(SectionFicheAppelEnum.CONSULTATION)) {
        suffixe = SectionFicheAppelEnum.CONSULTATION;
      } else if (url.endsWith(SectionFicheAppelEnum.EVALUATION)) {
        suffixe = SectionFicheAppelEnum.EVALUATION;
      } else if (url.endsWith(SectionFicheAppelEnum.USAGER)) {
        suffixe = SectionFicheAppelEnum.USAGER;
      } else if (url.endsWith(SectionFicheAppelEnum.PROTOCOLES)) {
        suffixe = SectionFicheAppelEnum.PROTOCOLES;
      } else if (url.endsWith(SectionFicheAppelEnum.AVIS)) {
        suffixe = SectionFicheAppelEnum.AVIS;
      } else if (url.endsWith(SectionFicheAppelEnum.PLAN_ACTION)) {
        suffixe = SectionFicheAppelEnum.PLAN_ACTION;
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

  /**
   * Crée un onglet pour une fiche d'appel.
   * @param ficheAppelSocialDto
   * @return la fiche d'appel sous la fome d'un OngletItem
   */
  private ficheAppelDtoToOngletItem(ficheAppelSocialDto: FicheAppelSocialDTO, urlSuffixe: string): OngletItem {
    let ongletItem: OngletItem = null;

    if (ficheAppelSocialDto) {
      let isUsagerLinked: boolean = ficheAppelSocialDto.usager?.id ? true : false;
      ongletItem = {
        id: ficheAppelSocialDto.id,
        libelle: this.getLibelleOnglet(ficheAppelSocialDto),
        isUsagerLinked: isUsagerLinked,
        urlSuffixeOnglet: urlSuffixe,
        isSelected: this.ficheAppelDataService.getIdFicheAppelActive() == ficheAppelSocialDto.id,
        url: "/" + ROUTE_EDITER + "/" + ROUTE_APPEL + "/" + this.ficheAppelDataService.getIdAppel() + "/" + ROUTE_FICHE + "/" + ficheAppelSocialDto.id + "/" + urlSuffixe
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
      this.ficheAppelDataService.getListeFicheAppel().forEach((ficheAppel: FicheAppelSocialDTO) => {
        // Récupère la dernière section affichée dans cette fiche d'appel.
        let urlSuffixeOnglet: SectionFicheAppelEnum = this.ficheAppelDataService.getLastSectionAffFicheAppel(ficheAppel.id);

        // Si la fiche n'a jamais été affichée, on affichera la section "Demande et évaluation".
        if (!urlSuffixeOnglet) {
          urlSuffixeOnglet = SectionFicheAppelEnum.EVALUATION;
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
   * @param ficheAppelSocialDto
   */
  private getLibelleOnglet(ficheAppelSocialDto: FicheAppelSocialDTO): string {
    let prenomNom: string = "";
    let age: string = null;

    if (ficheAppelSocialDto && ficheAppelSocialDto.usager) {
      if (ficheAppelSocialDto.usager.usagerAnonyme) {
        prenomNom = this.translateService.instant('sigct.ss.f_appel.onglet.usagernonid');
      } else if (ficheAppelSocialDto.usager.usagerIdentification) {
        let isValidPrenom: Boolean = ficheAppelSocialDto.usager.usagerIdentification.prenom &&
          ficheAppelSocialDto.usager.usagerIdentification.prenom != null;
        if (isValidPrenom) {
          prenomNom = ficheAppelSocialDto.usager.usagerIdentification.prenom;
        }

        let isValidNom: Boolean = ficheAppelSocialDto.usager.usagerIdentification.nom &&
          ficheAppelSocialDto.usager.usagerIdentification.nom != null;
        if (isValidNom) {
          prenomNom += " " + ficheAppelSocialDto.usager.usagerIdentification.nom;
        }

        if (prenomNom) {
          prenomNom = prenomNom.trim();
        }
      }
      age = AgeUtils.formaterAgeFormatCourt(ficheAppelSocialDto.usager.ageAnnees, ficheAppelSocialDto.usager.ageMois, ficheAppelSocialDto.usager.ageJours);
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

  resetAlert = (): void => {
    if (this.alertStore.state) {
      let alertModels = this.alertStore.state.filter(alert => alert.type !== AlertType.WARNING_FINAL && alert.type !== AlertType.SUCCESS);
      this.alertStore.resetAlert();
      this.alertStore.addAlerts(alertModels);
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

