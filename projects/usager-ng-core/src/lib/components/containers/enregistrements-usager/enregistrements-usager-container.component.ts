import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import { AppContext, AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { Action, FormTopBarOptions } from "projects/sigct-ui-ng-lib/src/lib/utils/form-top-bar-options";
import { Subscription } from 'rxjs';
import { StatusEnregisrementEnum } from '../../../enums/status-enregistrements-enum';
import { UsagerDTO, UsagerLieuResidenceDTO } from '../../../models';
import { UsagerService } from '../../../services/usager.service';
import { UtilitaireService } from '../../../services/utilitaire.service';
import { EnregistrementsUsagerUiComponent } from '../../ui/enregistrements-usager-ui/enregistrements-usager-ui.component';
import { BaseUsagerContainerComponent } from '../base-usager-container/base-usager-container.component';





@Component({
  selector: 'sigct-usager-enregistrements',
  templateUrl: './enregistrements-usager-container.component.html',
  styleUrls: ['./enregistrements-usager-container.component.css'],
  providers: [ConfirmationDialogService]
})
export class EnregistrementsUsagerContainerComponent extends BaseUsagerContainerComponent implements OnInit, OnDestroy {

  // identifiant de menu item "enregistrements"
  readonly labelEnregistrements = this.translateService.instant("usager.menuvert.btnenregistrement");
  readonly labelUsagerNonIdentifie: string = this.translateService.instant("usager.identification.usager.non.identifie");

  @ViewChild("alertContainer", { read: ViewContainerRef, static: true })
  alertContainer: ViewContainerRef;

  adressePrincipaleUsager: UsagerLieuResidenceDTO = null;

  messageConfirmerAjoutEnregistrementRegion: string;
  libelleMessageErreur: string;

  messages: string[] = [];

  public usagerDTO: UsagerDTO;

  public formTopBarOptions: FormTopBarOptions;
  public labelMenuTop: String = "";
  public detailMenuTop: string = "";

  private idUsagerIdent: number = null;
  private idEnregistrement: number = null;
  /** Indique si le composant est utilisé en contexte d'un appel. */
  private isEnContextAppel: boolean = false;

  private isFicheEnregistementAjoutableSelonEntentes: boolean = false;


  private subscriptions: Subscription = new Subscription();

  @Input("idUsager")
  set usagerId(usagerId: number) {
    this.initUsager(usagerId);
  }

  @Input("topBarreFixe")
  topBarreFixe: boolean = true;

  @Output("retourListe")
  retourRecherche = new EventEmitter<void>();

  @Output("ajouterEnregistrement")
  ajoutEnregistrement = new EventEmitter<number>();

  @Output("consulterEnregistrement")
  consulterEnregistrement = new EventEmitter<number>();

  @Output("editerEnregistrement")
  editerEnregistrement = new EventEmitter<number>();

  @Output("copierEnregistrement")
  copierEnregistrement = new EventEmitter<number>();

  @ViewChild("appEnregistrementsUsagerUi", { static: true })
  appEnregistrementsUsagerUi: EnregistrementsUsagerUiComponent;

  constructor(private authenticationService: AuthenticationService,
    private alertService: AlertService,
    private alertStore: AlertStore,
    private modalConfirmService: ConfirmationDialogService,
    private utilitaireService: UtilitaireService,
    private usagerService: UsagerService,
    private appContextStore: AppContextStore,
    private translateService: TranslateService) {
    super();
  }

  ngOnInit(): void {
    // Garder la session du portail active
    this.subscriptions.add(
      this.authenticationService.setSessionActivePortail().subscribe()
    );

    // Récupère le contexte applicatif.
    this.subscriptions.add(
      this.appContextStore.state$.subscribe((appContext: AppContext) => {
        // Initialise la barre de boutons selon le contexte d'appel.
        this.isEnContextAppel = appContext.isContextAppel;

        const statusEnregistrementsUsager: string = <string>appContext.statusEnregistrementsUsager;
        // Initialise le lieu de résidence principal de l'usager
        this.initAdresseUsager(this.isEnContextAppel, statusEnregistrementsUsager);
      })
    );

    this.subscriptions.add(
      this.alertStore.state$.subscribe((state: AlertModel[]) => {
        this.alertService.show(this.alertContainer, state);
      })
    );

    this.libelleMessageErreur = this.translateService.instant("girpi.error.label");

    //Vider les alertes déjà présentes
    this.viderMessages();

  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Lorsqu'une navigation "externe" est enclenchée.
   * IMPORTANT: On doit sauvegarder les données à l'aide de navigation.sendBeacon()
   */
  autoSaveBeforeUnload(): void {
    //Comportement non demandé pour l'instant.
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

        this.labelMenuTop = this.labelMenuTop.concat(" - ").concat(this.labelEnregistrements);
        this.detailMenuTop = "#" + this.usagerDTO.id;
      });

    } else {
      // Vide le composant
      this.usagerDTO = new UsagerDTO();
      this.idUsagerIdent = this.usagerDTO.id;
      this.labelMenuTop = this.labelUsagerNonIdentifie;
    }
    this.appEnregistrementsUsagerUi.setIdentificationUsager(this.idUsagerIdent);
  }

  private initTopBar(isEnContexteAppel: boolean, statusEnregistrement: string) {
    let topBarActions: Action[] = [];
    let topBarActionRetour: Action;

    let topBarActionAjouter: Action = {
      label: this.translateService.instant("usager.bandeau.btnajouter"),
      tooltip: this.translateService.instant("usager.bandeau.btnajouter.infobulle"),
      actionFunction: this.ajouterEnregistrement,
      compId: 'ajouterBtn',
      extraClass: "btn-primary form-btn"
    };

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
        actionFunction: this.actionRetourRecherche,
        icon: "fa fa-times fa-lg",
        compId: 'retourBtn',
        extraClass: "btn-default btn-auto-disabled"
      };
    }

    if (statusEnregistrement === StatusEnregisrementEnum.ACTIF || !this.isRoleAjouter()) {
      topBarActions = [topBarActionRetour];
    } else {
      topBarActions = [topBarActionAjouter, topBarActionRetour];
    }

    // Menu de boutons d'actions en haut et droite
    this.formTopBarOptions = {
      title: { icon: "fa fa fa-user fa-lg" },
      actions: topBarActions
    };
  }

  isRoleAjouter() {
    return this.authenticationService.hasAnyRole(['ROLE_US_ENREGISTREMENT_AJOUT', 'ROLE_US_ENREGISTREMENT_AJOUT_TOUS'])
      && (this.authenticationService.hasAnyRole(['ROLE_US_ENREGISTREMENT_CONSULT_TOUS']) || this.isUserSameRegionAsUsager() || this.isFicheEnregistementAjoutableSelonEntentes);
  }

  private initAdresseUsager(isEnContexteAppel: boolean, statusEnregistrement: string): void {
    this.utilitaireService.getUsagerLieuResidencePrincipal(this.idUsagerIdent).subscribe(res => {
      this.adressePrincipaleUsager = res;
      this.initFicheEnregistementAjoutableSelonEntentes(isEnContexteAppel, statusEnregistrement);
    });
  }

  private initFicheEnregistementAjoutableSelonEntentes(isEnContexteAppel: boolean, statusEnregistrement: string): void {
    if (this.adressePrincipaleUsager != null) {
      let idOrganismeCourant = this.authenticationService.getAuthenticatedUser().idOrganismeCourant;
      let idUsagerRegion = this.adressePrincipaleUsager.idRegion;
      if (idUsagerRegion) {
        this.usagerService.isFicheEnregistementAjoutableSelonEntentes(this.idUsagerIdent, idOrganismeCourant, idUsagerRegion).subscribe(res => {
          this.isFicheEnregistementAjoutableSelonEntentes = res;
          this.initTopBar(isEnContexteAppel, statusEnregistrement);
        });

      } else {
        this.initTopBar(isEnContexteAppel, statusEnregistrement);
      }

    } else {
      this.initTopBar(isEnContexteAppel, statusEnregistrement);
    }

  }

  private isUserSameRegionAsUsager(): boolean {
    let isUserSameRegionAsUsager = false;
    if (this.adressePrincipaleUsager != null) {
      isUserSameRegionAsUsager = (this.authenticationService.getAuthenticatedUser().codRegionOrganismeCourant == this.adressePrincipaleUsager.codeRegion);
    }
    return isUserSameRegionAsUsager;
  }

  private isAdresseUsagerValide(): boolean {
    let isAdresseUsagerValide = false;

    if (this.adressePrincipaleUsager != null) {
      isAdresseUsagerValide = (!StringUtils.isBlank(this.adressePrincipaleUsager.codeRegion) && !StringUtils.isBlank(this.adressePrincipaleUsager.nomRegion));
    }

    return isAdresseUsagerValide;
  }

  /**
   * fontions generiques pour ouvrir et fermer une fenetre modal popup
   */
  private openModal(id: string, btn: string) {
    this.modalConfirmService.openAndFocus(id, btn);
  }

  private closeModal(id: string) {
    this.modalConfirmService.close(id);
  }


  //Messages d'erreurs de validation
  private creerErreurs(messages: string[], titre: string, erreurType: AlertType) {
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

  private viderMessages = (): void => {
    this.messages = [];
    this.alertStore.resetAlert();
  }

  ajouterEnregistrement = (): void => {
    //Vider les alertes déjà présentes
    this.viderMessages();

    if (this.idUsagerIdent) {
      this.subscriptions.add(this.usagerService.isUsagerActif(this.idUsagerIdent).subscribe((result: Boolean) => {
        if (result) {
          this.ajouterEnregistrementAction();
        } else {
          const msg = this.translateService.instant("iu-e3000888");
          this.messages.push(msg);
          this.creerErreurs(this.messages, this.libelleMessageErreur, AlertType.ERROR);
        }
      }));
    } else {
      this.ajouterEnregistrementAction();
    }
  }

  private ajouterEnregistrementAction(): void {
    if (this.isAdresseUsagerValide()) {
      // us-c90021=Vous allez ajouter une fiche d'enregistrement dans la région {{0}} - {{1}}. Désirez-vous continuer?
      let params = { 0: this.adressePrincipaleUsager.codeRegion, 1: this.adressePrincipaleUsager.nomRegion };
      this.messageConfirmerAjoutEnregistrementRegion = this.translateService.instant("us-c90021", params);
      this.openModal('confirm_popup_ajouter_enregistrement_region', 'confi_popup_ajouter_enregistrement_region_btn_oui');
    } else {
      // us-e90020=L'usager doit avoir au moins une adresse active de type "Principale" contenant une région pour être enregistré.
      let msg = this.translateService.instant("us-e90020");
      this.messages.push(msg);
      this.creerErreurs(this.messages, this.libelleMessageErreur, AlertType.ERROR);
    }
  }


  confirmerAjouterEnregistrementRegion = (): void => {
    this.ajoutEnregistrement.emit(this.idUsagerIdent);
  }

  actionRetourRecherche = (): void => {
    this.retourRecherche.emit();
  }

  /**
   * Avise le parent qu'on désire consulter un enregistrement
   * @param event identifiant de l'enregistrement à consulter
   */
  onConsulterEnregistrement(event: number): void {
    this.idEnregistrement = event;
    this.consulterEnregistrement.emit(this.idEnregistrement);
  }

  /**
  * Avise le parent qu'on désire editer un enregistrement
  * @param event identifiant de l'enregistrement à consulter
  */
  onModifierEnregistrement(event: number): void {
    this.idEnregistrement = event;
    this.editerEnregistrement.emit(this.idEnregistrement);
  }


  onCopierEnregistrementInactif(event: number): void {
    //appel de les regles de ajoutment
    this.ajouterEnregistrement();

    if (this.messages.length == 0) {
      this.idEnregistrement = event;
      this.copierEnregistrement.emit(this.idEnregistrement);
    }
  }

}
