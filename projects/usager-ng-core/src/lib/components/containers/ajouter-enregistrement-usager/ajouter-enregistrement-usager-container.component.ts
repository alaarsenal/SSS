import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewContainerRef, ɵConsole } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import { AppContext, AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import { Action, FormTopBarOptions } from "projects/sigct-ui-ng-lib/src/lib/utils/form-top-bar-options";
import { Subscription, forkJoin, Observable } from 'rxjs';
import { StatusEnregisrementEnum } from '../../../enums/status-enregistrements-enum';
import { ReferenceDTO, UsagerDTO, UsagerLieuResidenceDTO } from '../../../models';
import { EnregistrementsUsagerResultatDTO } from '../../../models/enregistrements-usager-resultat-dto';
import { OrganismeDTO } from '../../../models/organisme-dto';
import { ReferencesService } from '../../../services/references.service';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { UsagerService } from '../../../services/usager.service';
import { DatesEnregistrementUiComponent } from '../../ui/dates-enregistrement-ui/dates-enregistrement-ui.component';
import { BaseUsagerContainerComponent } from '../base-usager-container/base-usager-container.component';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import { UtilitaireService } from '../../../services/utilitaire.service';
import { DialogUtilServiceService } from '../../../services/dialog-util-service.service';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { ActivatedRoute, NavigationStart, Router, RouterState } from '@angular/router';
import { UsagerEnregistrementFichireService } from '../../../services/usager-enregistrement-fichier.service';
import { UsagerSanterSocialFichierDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/UsagerSanterSocialFichierDTO';
import { filter } from 'rxjs/operators';
import { VerificateurDeChangementComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/verificateur-de-changement/verificateur-de-changement.component';
import { DatePipe } from '@angular/common';






@Component({
  selector: 'sigct-usager-enregistement-ajout',
  templateUrl: './ajouter-enregistrement-usager-container.component.html',
  styleUrls: ['./ajouter-enregistrement-usager-container.component.css'],
  providers: [DatePipe,ConfirmationDialogService]
})
export class AjouterEnregistrementUsagerContainerComponent extends BaseUsagerContainerComponent implements OnInit, OnDestroy {

  readonly labelEnregistrement = this.translateService.instant("usager.enregistrement.label");
  readonly labelUsagerNonIdentifie: string = this.translateService.instant("usager.identification.usager.non.identifie");

  readonly ACTION_AJOUTER: string = 'Ajouter';
  readonly ACTION_EDITER: string = 'Éditer';
  readonly ACTION_COPIER: string = 'Copier';
  adressePrincipaleUsager : UsagerLieuResidenceDTO = null;

  public usagerDTO: UsagerDTO;

  public isProfilValide: boolean = true;
  public isMilieuVieValide: boolean = true;

  public formTopBarOptions: FormTopBarOptions;
  public labelMenuTop: String = "";
  public detailMenuTop: string = "";

  public idUsagerIdent: number = null;
  /** Indique si le composant est utilisé en contexte d'un appel. */
  private isEnContextAppel: boolean = false;

  private abonnementEnregistrement: Subscription;

  @Input() @Output()
  enregistrement = new EnregistrementsUsagerResultatDTO();

  subscriptions: Subscription = new Subscription();

  // Contenu des listes de valeurs
  listeLienRessourcePro: ReferenceDTO[];

  // liste des organismes depuis la BD
  listeOrganismesBD: OrganismeDTO[];

  // liste des references mesure securite depuis la BD
  listeReferenceMesureSecurite: ReferenceDTO[];

  // liste des references de soins et service depuis la BD
  listeReferenceSoinsService: ReferenceDTO[];

  // liste des references de type de fichier depuis la BD
  listeReferenceTypeFichier: ReferenceDTO[];
  //-------------------------------------------------------------------

  @ViewChild("alertPagContainer", { read: ViewContainerRef, static: true })
  container;


  avertissementPersistant: AlertModel;

  isDernierOrganismeFermeture: boolean = false;

  isOrganismeActifDateFermetureValide: boolean = true;

  //Conteneur pour la liste de valeurs des profils
  public inputOptionsProfils: InputOptionCollection = {
    name: "profils",
    options: []
  };

  //Conteneur pour la liste de valeurs des milieux de vie
  public inputOptionsMilieuxVie: InputOptionCollection = {
    name: "milieuxVie",
    options: []
  };


  //action en cours
  @Input()
  public action: string;

  @Input("idUsager")
  set usagerId(usagerId: number) {
    this.initAdresseUsager(usagerId);
    this.initContextApplicatif(usagerId);
    this.initUsager(usagerId);
  }

  @Input("idEnregistrement")
  set idEnregistrement(id: number) {
    this.enregistrement.id = id;
  }

  @Input("topBarreFixe")
  topBarreFixe: boolean = true;

  @Output("retourListeEnregistrements")
  retourEnregistrements = new EventEmitter<number>();

  @Output("consulterEnregistrement")
  consulterEnregistrement = new EventEmitter<number>();

  @ViewChild("datesEnregistrementUi", { static: true })
  datesEnregistrementUi: DatesEnregistrementUiComponent;

  @ViewChild("appOrganismesEnregistrementUi", { static: true })
  organismesEnregistrementUi: DatesEnregistrementUiComponent;

  @ViewChild("contenuScroll", { static: true })
  contenuScroll: ElementRef;

  @ViewChild("verificateurDeChangementUi", { static: true })
  verificateurDeChangementUi: VerificateurDeChangementComponent;

  constructor(private authenticationService: AuthenticationService,
    private usagerService: UsagerService,
    private fichierService: UsagerEnregistrementFichireService,
    private appContextStore: AppContextStore,
    private utilitaireService: UtilitaireService,
    private translateService: TranslateService,
    private referencesService: ReferencesService,
    private alertStore: AlertStore,
    private alertService: AlertService,
    private dialogUtilService: DialogUtilServiceService,
    public datePipe: DatePipe,
    private modalConfirmService: ConfirmationDialogService,
    private activatedRoute: ActivatedRoute,
    private router: Router) {
    super();
  }

  ngOnInit(): void {
    this.alertStore.resetAlert();
    this.empecheLesErreursAfficheesDansLePopup();
    this.garderLaSessionDuPortalActive();
    this.populerLesOptions();
    this.executerLActionSelonLeParametre();

  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
    if (this.abonnementEnregistrement) {
      this.abonnementEnregistrement.unsubscribe();
    }
  }

  /**
   * Lorsqu'une navigation "externe" est enclenchée.
   * IMPORTANT: On doit sauvegarder les données à l'aide de navigation.sendBeacon()
   */
  autoSaveBeforeUnload(): void {
    //Comportement non demandé pour l'instant.
  }

  private garderLaSessionDuPortalActive() {
    // Garder la session du portail active
    this.subscriptions.add(
      this.authenticationService.setSessionActivePortail().subscribe()
    );
  }

  private empecheLesErreursAfficheesDansLePopup(){
    this.subscriptions.add(
      this.alertStore.state$.subscribe((state: AlertModel[]) => {
        // Empêche les erreurs affichées dans le popup de s'afficher également dans ce composent,
        // car les 2 observent le même AlertStore.
        if (!this.dialogUtilService.isDialogOpened) {
          this.alertService.show(this.container, state);
        }
      })
    );
  }

  private populerLesOptions(){

    this.subscriptions.add(
      (this.referencesService.getListeLienRessourcePro()).subscribe(result => {
        // Récupère de la bd la liste des liens pour les ressource professionelles et sociales.
        this.listeLienRessourcePro = result as ReferenceDTO[];
      })
    );

    //------
    this.subscriptions.add(
      (this.referencesService.getListeMesureSecurite()).subscribe(result => {
        // Récupère de la bd la liste des mesures de securite.
        this.listeReferenceMesureSecurite = result as ReferenceDTO[];
      })
    );

    //------
    this.subscriptions.add(
      (this.referencesService.getListeSoinsService()).subscribe(result => {
        // Récupère de la bd la liste des soins et service.
        this.listeReferenceSoinsService = result as ReferenceDTO[];
      })
    );

    //------
    this.subscriptions.add(
      (this.referencesService.getListeTypeFichier()).subscribe(result => {
        // Récupère de la bd la liste des soins et service.
        this.listeReferenceTypeFichier = result as ReferenceDTO[];
      })
    );

      // Alimente la liste des profils.
      let valeurLibelleSelectionnez: string = this.translateService.instant("girpi.label.selectionnez");

      this.inputOptionsProfils.options.push({ label: valeurLibelleSelectionnez, value: null });

      this.subscriptions = this.referencesService.getListeProfil().subscribe((result: ReferenceDTO[]) => {
          if (result) {
            result.forEach(item => {
              this.inputOptionsProfils.options.push({ label: item.nom, value: '' + item.id });
            })
          };
      });

      // Alimente la liste des milieux de vie.

      this.inputOptionsMilieuxVie.options.push({ label: valeurLibelleSelectionnez, value: null });

      this.subscriptions = this.referencesService.getListeMilieuVie().subscribe((result: ReferenceDTO[]) => {
          if (result) {
            result.forEach(item => {
              this.inputOptionsMilieuxVie.options.push({ label: item.nom, value: '' + item.id });
            })
          };
      });
  }

  executerLActionSelonLeParametre() {

    let paramId: number;
    let copier: Boolean;
    this.activatedRoute.params.subscribe(params => paramId = params['idEnregistrement']);
    this.activatedRoute.url.forEach(i => i.forEach(url =>copier = url.path ==='copier' ? true : false));
    if (!copier) {
      copier = this.action == this.ACTION_COPIER;
    }

    if (paramId != undefined)
     this.enregistrement.id = paramId;


    if (copier) {
      this.copierEnregistrement(this.idUsagerIdent);
      this.action = this.ACTION_AJOUTER;
    } else {
      if (this.enregistrement.id == null || this.enregistrement.id <= 0){
        this.action = this.ACTION_AJOUTER;
        this.genererNouvelEnregistrementUsager(this.idUsagerIdent);
      } else  {
        this.action = this.ACTION_EDITER;
        this.consulterEnregistrementExistant(this.idUsagerIdent);
      }
    }
  }


  consulterEnregistrementExistant(idUsager: number) {
    if (this.isDernierOrganismeFermeture) {
      this.abonnementEnregistrement = this.usagerService.consulterEnregistrementUsager(idUsager, this.enregistrement.id)
        .subscribe((data: EnregistrementsUsagerResultatDTO) => {
          this.initInfosEnregistrement(idUsager, data);
          this.actionConsulterEnregistrement(this.enregistrement.id);
        });
    } else {
      this.abonnementEnregistrement = this.usagerService.editerEnregistrementUsager(idUsager, this.enregistrement.id)
        .subscribe((data: EnregistrementsUsagerResultatDTO) => {
          this.initInfosEnregistrement(idUsager, data);
        });
    }
  }

  copierEnregistrement(idUsager: number) {
    this.abonnementEnregistrement = this.usagerService.copierEnregistrementUsager(idUsager, this.enregistrement.id)
      .subscribe((data: EnregistrementsUsagerResultatDTO) => {
        this.initInfosEnregistrement(idUsager, data);
        if (this.isDernierOrganismeFermeture) {
          this.actionConsulterEnregistrement(this.enregistrement.id);
        }
      });
  }

  private initInfosEnregistrement(usagerId: number, enregistrement: EnregistrementsUsagerResultatDTO): void {
    this.setEnregistramentFromData(enregistrement);
    this.validerAdresseUsagerEnModeEditer(usagerId, enregistrement);
    this.initUsager(usagerId);
  }

  private initContextApplicatif(usagerId): void {
    // Récupère le contexte applicatif.
    this.subscriptions.add(
      this.appContextStore.state$.subscribe((appContext: AppContext) => {
        // Initialise la barre de boutons selon le contexte d'appel.
        this.isEnContextAppel = appContext.isContextAppel;

        const statusEnregistrementsUsager: string = <string>appContext.statusEnregistrementsUsager;

        this.initTopBar(this.isEnContextAppel, statusEnregistrementsUsager);

      })
    );

  }

  private validerAdresseUsagerEnModeAjouter(usagerId : number): void {
    this.validerAdresseUsager(usagerId, this.enregistrement, this.ACTION_AJOUTER);
  }

  private validerAdresseUsagerEnModeEditer(usagerId : number, enregistrement: EnregistrementsUsagerResultatDTO): void {
    this.validerAdresseUsager(usagerId, enregistrement, this.ACTION_EDITER);
  }

  private initAdresseUsager(usagerId : number){
    this.subscriptions.add(
      forkJoin([
        this.utilitaireService.getUsagerLieuResidencePrincipal(usagerId)
      ]).subscribe(results => {
        this.adressePrincipaleUsager = results[0] as UsagerLieuResidenceDTO;
      })
    );
  }

  private validerAdresseUsager(usagerId : number, enregistrement: EnregistrementsUsagerResultatDTO, action: string): void {
    if (usagerId) {

          if (action == this.ACTION_AJOUTER) {
            if (!this.isAdresseUsagerValideEnModeAjouter()) {
              this.retourEnregistrements.emit(usagerId);
            }
          } else {
            const validationAdresse = this.isAdresseUsagerValideEnModeEditer(enregistrement);
            if (!validationAdresse.isAdresseUsagerValide) {
              this.avertissementPersistant = new AlertModel();
              this.avertissementPersistant.title = 'Message d’avertissement';
              this.avertissementPersistant.type = AlertType.WARNING;
              this.avertissementPersistant.messages = [this.translateService.instant(validationAdresse.codMessage)];
              this.alertStore.addAlerts([this.avertissementPersistant]);
            }
          }
    }
  }

  private isAdresseUsagerValideEnModeAjouter(): boolean {
    let isAdresseUsagerValide = false;

    if (this.adressePrincipaleUsager != null) {
      isAdresseUsagerValide = (this.adressePrincipaleUsager.codeRegion != null && this.adressePrincipaleUsager.nomRegion != null);
    }

    return isAdresseUsagerValide;
  }

  private isAdresseUsagerValideEnModeEditer(enregistrement: EnregistrementsUsagerResultatDTO): {isAdresseUsagerValide: boolean, codMessage: string} {

    let returnValid = {
      isAdresseUsagerValide: true,
      codMessage: ''
    }

    if (this.adressePrincipaleUsager == null) {
      returnValid.isAdresseUsagerValide = false;
      returnValid.codMessage = 'us-a90001'
    } else {
      if (! (this.adressePrincipaleUsager.codeRegion != null && this.adressePrincipaleUsager.nomRegion != null) ) {
        returnValid.isAdresseUsagerValide = false;
        returnValid.codMessage = 'us-a90001'
      }

      if (enregistrement.idRegion != undefined && this.adressePrincipaleUsager.codeRegion != enregistrement.codRegion) {
        returnValid.isAdresseUsagerValide = false;
        returnValid.codMessage = 'us-a90002'
      }
    }



    return returnValid;
  }


  private initUsager(usagerId: number) {
    this.idUsagerIdent = usagerId;

    if (this.idUsagerIdent) {

      this.usagerService.getUsager(this.idUsagerIdent).subscribe((res: UsagerDTO) => {

        this.usagerDTO = res;

        // Affiche le nom et le prénom de l'usager dans la barre de menu.
        if (this.usagerDTO.prenom && this.usagerDTO.nom) {
          this.labelMenuTop = this.usagerDTO.prenom + " " + this.usagerDTO.nom;
        } else if (this.usagerDTO.prenom) {
          this.labelMenuTop = this.usagerDTO.prenom;
        } else if (this.usagerDTO.nom) {
          this.labelMenuTop = this.usagerDTO.nom;
        } else {
          this.labelMenuTop = this.labelUsagerNonIdentifie;
        }

        this.appContextStore.setvalue('statusEnregistrementsUsager', this.usagerDTO.statusEnregistrement);

        let infoRegionUsager = this.obtenirRegionSelonLAction();

        this.labelMenuTop = this.labelMenuTop.concat(" - ").concat(this.labelEnregistrement).concat("  (").concat(infoRegionUsager).concat(")");
        this.detailMenuTop = "#" + this.usagerDTO.id;
      });

    } else {
      // Vide le composant
      this.usagerDTO = new UsagerDTO();
      this.idUsagerIdent = this.usagerDTO.id;
      this.labelMenuTop = this.labelUsagerNonIdentifie;
    }
    // passer l'identifant de l'usager au composantes
    this.datesEnregistrementUi.setIdentificationUsager(this.idUsagerIdent);
    this.organismesEnregistrementUi.setIdentificationUsager(this.idUsagerIdent);
  }

  private obtenirRegionSelonLAction() {
    if (this.action == this.ACTION_AJOUTER)
      if (this.adressePrincipaleUsager != null)
        return this.adressePrincipaleUsager.codeRegion.concat(" - ").concat(this.adressePrincipaleUsager.nomRegion);
    if (this.action == this.ACTION_EDITER)
      if (this.enregistrement.codRegion != undefined)
         return this.enregistrement.codRegion.concat(" - ").concat(this.enregistrement.nomRegion);
    return '';
  }

  private initTopBar(isEnContexteAppel: boolean, statusEnregistrement: string) {
    let topBarActions: Action[] = [];
    let topBarActionRetour: Action;

    let topBarActionSauvegarder: Action = { label: this.translateService.instant("button.sauvegarder.label"), tooltip: this.translateService.instant("button.sauvegarder.title"), actionFunction: this.sauvegarderEnregistrement, compId: 'sauvegarderBtn', extraClass: "btn-primary form-btn" };
    let topBarActionAnnuler: Action = { label: this.translateService.instant("button.cancel.label"), actionFunction: this.annulerEnregistrement, compId: 'annulerBtn', extraClass: "btn-default btn-auto-disabled" };

    if (isEnContexteAppel) {
      /** Revenir à la fiche si contexte d'appel **/
      topBarActionRetour = {
        tooltip: this.translateService.instant("usager.bandeau.btnfermer2"),
        actionFunction: this.actionFermer,
        icon: "fa fa-times fa-lg",
        compId: 'retourBtn',
        extraClass: "btn-default btn-auto-disabled"
      };

    } else {
      /** Revenir à la liste si hors contexte d'appel **/
      topBarActionRetour = {
        label: this.translateService.instant("usager.bandeau.btnfermer1"),
        actionFunction: this.actionRetourEnregistrements,
        icon: "fa fa-times fa-lg",
        compId: 'retourBtn',
        extraClass: "btn-default btn-auto-disabled"
      };
    }


    topBarActions = [topBarActionSauvegarder, topBarActionAnnuler, topBarActionRetour];


    // Menu de boutons d'actions en haut et droite
    this.formTopBarOptions = {
      title: { icon: "fa fa fa-user fa-lg" },
      actions: topBarActions
    };
  }

  sauvegarderEnregistrement = (): void => {
    if (this.enregistrement.organismes.filter(o => o.dateFermetureEffective == null).length==0) {
      this.isDernierOrganismeFermeture = true;
      this.modalConfirmService.openAndFocus('confirm_popup_relier_fermer_organisme', 'confi_relier_fermer_organisme_btn_oui');
    }else{
      this.confirmerSauvegardeEnregistrement();
    }
  }

  avertirSurTraitmentDesAlertes = (): void => {
    if (this.enregistrement.id) {
      this.usagerService.getAllAlertesEnregistrements(this.enregistrement.id).subscribe( data => {
        if (data.length > 0) {
          this.modalConfirmService.close('confirm_popup_relier_fermer_organisme');
          this.modalConfirmService.openAndFocus('confirm_popup_avertir_sur_traitment', 'confi_avertir_sur_traitment_btn_oui');
        } else {
          this.confirmerSauvegardeEnregistrement();
        }
      });
    } else {
      this.confirmerSauvegardeEnregistrement();
    }
  }

  confirmerSauvegardeEnregistrement(){
    this.modalConfirmService.close('confirm_popup_avertir_sur_traitment');
    this.alertStore.resetAlert();
    this.contenuScroll.nativeElement.scrollTop = 0;

      this.enregistrement.actif = false;
      if (this.adressePrincipaleUsager != null && this.action == this.ACTION_AJOUTER){
        this.enregistrement.idRegion = this.adressePrincipaleUsager.idRegion;
      }

      if (this.isOrganismeActifDateFermetureValide ) {
        this.enregistrement.medications.forEach(item => item.idEnregistrement = this.enregistrement.id);
        this.abonnementEnregistrement = this.usagerService.ajouterEnregistrementUsager(this.enregistrement.idUsager, this.enregistrement).subscribe(data => {
          this.enregistrement = data;
          this.creerAlert(["Votre document a été sauvegardé avec succès!"],"Confirmation", AlertType.SUCCESS);
          this.action = this.ACTION_EDITER;
          this.idUsagerIdent = data.idUsager;
          this.consulterEnregistrementExistant(this.idUsagerIdent);
        }, (err) => {

          if(err.error === 'us-a-40010'){
           this.alertStore.resetAlert();
           this.creerAlert([this.translateService.instant(err.error)],"Message d'erreur", AlertType.ERROR)
          }

          if(err.error === 'us-a-40011'){
            this.alertStore.resetAlert();
            this.creerAlert([this.translateService.instant(err.error)],"Message d'erreur", AlertType.ERROR)
           }

          if (this.avertissementPersistant !=null){
            this.alertStore.addAlerts([this.avertissementPersistant]);
          }
        });
      }

  }

  annulerEnregistrement = (): void => {
    this.verificateurDeChangementUi.verifierChangments(
       ()=>{ //onBtnOuiClick
        this.executerLActionSelonLeParametre();
        this.verificateurDeChangementUi.closeModal();
      },
      ()=>{ //onBtnNomClick
        this.verificateurDeChangementUi.closeModal();
      }
    )
  }

  actionRetourEnregistrements = (): void => {
    let id = this.idUsagerIdent != null ? this.idUsagerIdent : this.enregistrement.idUsager;
    this.retourEnregistrements.emit(id);
  }

  actionConsulterEnregistrement = (idEnregistrement: number): void => {
    this.consulterEnregistrement.emit(idEnregistrement);
  }

  genererNouvelEnregistrementUsager(idUsager: number) {
    this.abonnementEnregistrement = this.usagerService.genererNouvelEnregistrementUsager(idUsager).subscribe((data: EnregistrementsUsagerResultatDTO) => {
      this.setEnregistramentFromData(data);
      this.validerAdresseUsagerEnModeAjouter(idUsager);
    });
  }

  private setEnregistramentFromData(data: EnregistrementsUsagerResultatDTO) {
    this.enregistrement = data;
    if (this.enregistrement.indicateursMesureSecurite == null) {
      this.enregistrement.indicateursMesureSecurite = [];
    }
    if (this.enregistrement.soinsEtServices == null
           || this.enregistrement.soinsEtServices.filter(m => m.visible).length==0) {
      this.enregistrement.soinsEtServices = [];
    }
    if (this.enregistrement.medications == null
          || this.enregistrement.medications.filter(m => m.visible).length==0) {
      this.enregistrement.medications = [];
    }
    if (this.enregistrement.ressourcesProfessionnelles == null) {
      this.enregistrement.ressourcesProfessionnelles = [];
    }
    if (this.enregistrement.organismes == null) {
      this.enregistrement.organismes = [];
      this.ajouterOrganismeParDefaut(this.enregistrement);
    }
  }

  private ajouterOrganismeParDefaut(enregistrement) {

      const organismePourAjout = new OrganismeDTO();
      organismePourAjout.nomOrganisme = enregistrement.creeParOrganisme;
      organismePourAjout.gestionnaire = enregistrement.creeUsername;
      organismePourAjout.nomGestionnaire = enregistrement.creeFullName;
      organismePourAjout.codeOrganismeRRSS = enregistrement.organismeEnregistreurCodeRRSS;
      organismePourAjout.codeOrganismeMG = enregistrement.organismeEnregistreurCodeMG;
      organismePourAjout.idOrganisme = enregistrement.organismeEnregistreurIdOrganisme;
      enregistrement.organismes.push(organismePourAjout);

  }

     //Messages d'erreurs de validation
  creerAlert(messages: string[], titre: string, erreurType: AlertType) {

    const alertM: AlertModel = new AlertModel();
    alertM.title = titre;
    alertM.type = erreurType;
    alertM.messages = messages;
     const alerts = [alertM];
     if (this.avertissementPersistant !=null){
       alerts.push(this.avertissementPersistant)
     }
      this.alertStore.addAlerts(alerts);
  }

  onAjouterFichier(event) {
    this.alertStore.resetAlert();
    const msgs = this.validerFichier(event);
    if (msgs.length > 0) {
      this.scrollTop();
      this.creerAlert(msgs, "Message d'erreur", AlertType.ERROR);
      return;
    }

    this.subscriptions = this.fichierService.sauvegarder(event.fichier, this.enregistrement.id)
    .subscribe((data: UsagerSanterSocialFichierDTO) => {
      this.enregistrement.fichiers.push(data);
      event.data = this.enregistrement.fichiers;
      event.informeAjoute(this.enregistrement.fichiers);
      this.creerAlert([this.translateService.instant('ss-iu-c00002')],'Confirmation : ', AlertType.SUCCESS);
      this.scrollTop();

    }, (err) => {
      this.contenuScroll.nativeElement.scrollTop = 0;
    });

  }

  public scrollTop() {
    this.contenuScroll.nativeElement.scrollTop = 0;
  }

  private validerFichier(event: any) {

    let msgs: string[] = [];

    if (this.action == this.ACTION_AJOUTER){
      msgs.push(this.translateService.instant('us-e90015'));
      return msgs;
    }
    if (event.fichier.file == null){
      const msg = this.translateService.instant('us-e90016');
      msgs.push(msg);
    }
    if (event.fichier.idReferenceTypeFichier==null) {
      const label = this.translateService.instant('usager.enregistrement.sec.fichier.type');
      msgs.push(this.translateService.instant('general.msg.obligatoire',{ 0:  label }));
    }

    return msgs;
  }

  onListFichier(event){
    if (this.action == this.ACTION_EDITER){
      this.fichierService.liste(this.enregistrement.id).subscribe(data => {
        this.enregistrement.fichiers = data;
        event.data = data;
        event.subject.next(data);
      });
    }
  }

  onSupprimerFichier(event) {
    this.enregistrement.fichiers = event.data;
  }

  onTelechargerFichier(fichier: UsagerSanterSocialFichierDTO) {
    let a= document.createElement('a');
    a.target= '_blank';
    a.href= this.fichierService.getLinktelechargement(this.enregistrement.id, fichier.id);
    a.click();
  }

  isFichierReadOnly() {
    return this.action==this.ACTION_AJOUTER;
  }

  getUrlBaseTelecharge(){
    return this.fichierService.getUrlBaseTelechargement(this.enregistrement.id);
  }

}
