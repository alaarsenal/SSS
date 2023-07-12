import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router, UrlTree, RouterEvent, NavigationEnd} from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import AuthenticationUtils from 'projects/sigct-service-ng-lib/src/lib/auth/authentication-utils';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import { MaterialModalDialogService } from 'projects/sigct-service-ng-lib/src/lib/material-modal-dialog/material-modal-dialogl.service';
import { InfoAppelCtiDTO } from 'projects/sigct-service-ng-lib/src/lib/models/info-appel-cti-dto';
import { AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import { MenuItem } from 'projects/sigct-ui-ng-lib/src/lib/components/menus/menu-interface';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { VerificateurDeChangementComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/verificateur-de-changement/verificateur-de-changement.component';
import { BaseUsagerPageComponent } from 'projects/usager-ng-app/src/app/components/pages/base-usager-page/base-usager-page.component';
import { EditerUsagerContainerComponent } from 'projects/usager-ng-core/src/lib/components/containers';
import { BaseUsagerDTO } from 'projects/usager-ng-core/src/lib/models/base-usager-dto';
import { Observable, of, Subscription } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { LinkedUsagerDTO } from '../../../../../../sigct-service-ng-lib/src/lib/models/linked-usager-dto';
import { AppelAnterieurDTO } from '../../../models/appel-anterieur-dto';
import { UsagerService } from '../../../services/usager.service';
import { ConsulterAppelAnterieurUsagerContainerComponent } from '../../containers/consulter-appel-anterieur-usager/consulter-appel-anterieur-usager-container.component';

export interface UserData {
  idUsager?: number;
  enContexteAppel?: boolean;
  idAppel?: number;
  idFicheAppelActive?: number;
  linkedUsagerDTOs: LinkedUsagerDTO[];
  infoAppelCtiDto: InfoAppelCtiDTO;
}

export enum Action {
  CONSULTER_USAGER,
  EDITER_USAGER,
  LISTER_APPELS_ANTERIEURS,
  CONSULTER_APPEL_ANTERIEUR,
  RECHERCHER_USAGER,
  CONSULTER_ENREGISTREMENTS,
  AJOUTER_ENREGISTREMENT,
  CONSULTER_ENREGISTREMENT,
  EDITER_ENREGISTREMENT,
  COPIER_ENREGISTREMENT,
}




@Component({
  selector: 'app-dialogue-usager',
  templateUrl: './dialogue-usager.component.html',
  styleUrls: ['./dialogue-usager.component.css'],
  providers: [ConfirmationDialogService],
})
export class DialogueUsagerComponent extends BaseUsagerPageComponent implements OnInit {

  private menuItemAppelsUsager: MenuItem;

  // Action du menu en cours
  actionEnCours: Action = null;
  // Identifiant de l'usager en traitement
  idUsager: number = null;
  // Informations sur la fiche d'appel antérieure à consulter
  appelAnterieurDto: AppelAnterieurDTO;
  // Informations provenant de la téléphonie (CTI)
  infoAppelCtiDto: InfoAppelCtiDTO = null;
  // Conteneur de souscriptions à détruire lors du onDestoy
  subscriptions: Subscription = new Subscription();
  alerts: AlertModel[];

  @ViewChild("sigctUsagerEdition", { static: false })
  sigctUsagerEdition: EditerUsagerContainerComponent;

  infobulleButtonFermer: string;

  @ViewChild("verifiDeChangementUi", { static: true })
  verificateurDeChangementUi: VerificateurDeChangementComponent;

  @ViewChild('consulterAppelAnterieur', { static: false })
  consulterAppelAnterieur: ConsulterAppelAnterieurUsagerContainerComponent;

  linkedUsagerDTOs: LinkedUsagerDTO[] = [];

  constructor(
    private dialogRef: MatDialogRef<DialogueUsagerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserData,
    protected appContextStore: AppContextStore,
    protected route: ActivatedRoute,
    protected router: Router,
    protected authenticationService: AuthenticationService,
    protected usagerService: UsagerService,
    private alertStore: AlertStore,
    private translateService: TranslateService,
    private materialModalDialogService: MaterialModalDialogService,
    private changeDetector: ChangeDetectorRef) {
    super(route, router, authenticationService, appContextStore, usagerService)
  }

  ngOnInit() {
    super.ngOnInit();

    this.linkedUsagerDTOs = this.data?.linkedUsagerDTOs;
    this.infoAppelCtiDto = this.data?.infoAppelCtiDto;

    if (this.data?.idUsager) {
      this.idUsager = this.data.idUsager;
      // Se positionne sur l'usager en consultation
      this.actionConsulterUsager();
    } else {
      // Par défaut, on se positionne sur la recherche
      this.actionRechercherUsager();
    }
    this.infobulleButtonFermer = this.data && this.data.enContexteAppel ? "usager.bandeau.btnfermer.contexteAppel" : "usager.bandeau.btnfermer.contexteHorsAppel";
    this.subscriptions.add(this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationEnd) {
        this.onFermerDialog();
      }
    }));
  }

  // Action Rechercher un usager du menu gauche
  actionRechercherUsager = () => {
    this.naviguerVers(Action.RECHERCHER_USAGER, null);
  }

  // Action Consulter un usager du menu gauche
  actionConsulterUsager = () => {
    this.naviguerVers(Action.CONSULTER_USAGER, this.idUsager);
  }

  // Action Éditer un usager du menu gauche
  actionEditerUsager = () => {
    this.naviguerVers(Action.EDITER_USAGER, this.idUsager);
  }

  // Action Lister les appels d'un usager du menu gauche
  actionListerAppelsUsager = () => {
    this.naviguerVers(Action.LISTER_APPELS_ANTERIEURS, this.idUsager);
  }

  // Action Consulter la liste des enregistrements d'un usager du menu gauche
  actionConsulterEnregistrementsUsager = () => {
    this.naviguerVers(Action.CONSULTER_ENREGISTREMENTS, this.idUsager);
  }

  // Action Ajouter un enregistrement à un usager du menu gauche
  actionAjouterEnregistrementUsager = () => {
    this.naviguerVers(Action.AJOUTER_ENREGISTREMENT, this.idUsager);
  }

  // Action Consulter un enregistrement d'un usager
  actionConsulterEnregistrementUsager = (event: number) => {
    this.idEnregistrement = event;
    this.naviguerVers(Action.CONSULTER_ENREGISTREMENT, this.idUsager);
  }

  // Action Editer un enregistrement d'un usager
  actionEditerEnregistrementUsager = (event: number) => {
    this.idEnregistrement = event;
    this.naviguerVers(Action.EDITER_ENREGISTREMENT, this.idUsager);
  }

  // Action Copier un enregistrement d'un usager
  actionCopierEnregistrementUsager = (event: number) => {
    this.idEnregistrement = event;
    this.naviguerVers(Action.COPIER_ENREGISTREMENT, this.idUsager);
  }

  /**
   * Fermeture du popup.
   */
  onFermerDialog() {
    if (this.actionEnCours == Action.EDITER_USAGER) {
      // Si on quitte l'éditon d'un usager, on doit manuellement lancer la sauvegarde,
      // car le mécanisme de sauvegarde automatique ignore que l'on quitte.
      this.subscriptions.add(
        this.sauvegarderUsagerSiActif().subscribe()
      );

      this.fermerDialog();
    } else if (this.actionEnCours == Action.CONSULTER_APPEL_ANTERIEUR && this.consulterAppelAnterieur?.isDirty()) {
      // Si on quitte le container de la consultation et que des modifs sont en cours, on doit demander une confirmation.
      this.subscriptions.add(
        this.materialModalDialogService.popupConfirmer("ss-iu-a00004").subscribe((result: boolean) => {
          if (result === true) {
            this.fermerDialog();
          }
        })
      );
    } else {
      this.fermerDialog();
    }
  }

  /**
   * Fermeture de la boite de dialogue et navigation vers urlRedirection.
   * @param urlRedirection 
   */
  onFermerDialogAndRedirectTo(urlRedirection: UrlTree): void {
    this.fermerDialog(urlRedirection);
  }

  private fermerDialog(urlRedirection: UrlTree = null): void {
    // Vide les critères de recherche à la fermeture du popup.
    localStorage.removeItem("rechercher");

    this.dialogRef.close(urlRedirection);
  }

  onRetourEnregistements(): void {
    this.onConsulterEnregistrementsUsager(this.idUsager);
  }
  /**
   * Fermeture du popup avec retour de l'usager à relier.
   */
  onRelierUsager(usager: BaseUsagerDTO) {
    // Vide les critères de recherche à la fermeture du popup.
    localStorage.removeItem("rechercher");

    this.dialogRef.close(usager);
  }

  /**
   * Indique si l'action en cours est la consultation d'un usager.
   */
  isConsultationUsagerEnCours(): boolean {
    return this.actionEnCours == Action.CONSULTER_USAGER;
  }

  /**
   * Indique si l'action en cours est l'édition d'un usager.
   */
  isEditionUsagerEnCours(): boolean {
    return this.actionEnCours == Action.EDITER_USAGER;
  }

  /**
   * Indique si l'action en cours est la liste des appels antérieurs d'un usager.
   */
  isListerAppelsAnterieursEnCours(): boolean {
    return this.actionEnCours == Action.LISTER_APPELS_ANTERIEURS;
  }

  /**
   * Indique si l'action en cours est la consultation d'un appel antérieur.
   */
  isConsultationAppelAnterieurEnCours(): boolean {
    return this.actionEnCours == Action.CONSULTER_APPEL_ANTERIEUR;
  }

  /**
   * Indique si l'action en cours est la recherche d'un usager.
   */
  isRechercheUsagerEnCours(): boolean {
    return this.actionEnCours == Action.RECHERCHER_USAGER;
  }

  /**
   * Indique si l'action en cours est la consultation des enregistrements d'un usager.
   */
  isConsulterEnregistrementsUsagerEnCours(): boolean {
    return this.actionEnCours == Action.CONSULTER_ENREGISTREMENTS;
  }

  /**
   * Indique si l'action en cours est la consultation des enregistrements d'un usager.
   */
  isEditerEnregistrementsUsagerEnCours(): boolean {
    return this.actionEnCours == Action.EDITER_ENREGISTREMENT;
  }

  /**
   * Indique si l'action en cours est l'ajout d'un enregistrement pour un usager.
   */
  isAjouterEnregistrementUsagerEnCours(): boolean {
    return this.actionEnCours == Action.AJOUTER_ENREGISTREMENT;
  }

  /**
   * Indique si l'action en cours est la consultation d'un enregistrement pour un usager.
   */
  isConsulterEnregistrementUsagerEnCours(): boolean {
    return this.actionEnCours == Action.CONSULTER_ENREGISTREMENT;
  }

  /**
  * Indique si l'action en cours est la copie des enregistrements d'un usager.
  */
  isCopieEnregistrementsUsagerEnCours(): boolean {
    return this.actionEnCours == Action.COPIER_ENREGISTREMENT;
  }

  /**
   * Affiche la section correspondant à l'action demandée.
   * @param actionCible
   * @param idUsager
   */
  naviguerVers(actionCible: Action, idUsager: number) {
    this.subscriptions.add(
      this.validerUsagerActif(idUsager).subscribe((isActif: boolean) => {
        if (isActif) {
          if (this.verificateurDeChangementUi.isExisteChangements()) {
            this.verificateurDeChangementUi.verifierChangments(
              () => { //onBtnOuiClick
                this.confirmerNaviguerVers(actionCible, idUsager);
                this.verificateurDeChangementUi.closeModal();
                this.verificateurDeChangementUi.reset();
              },
              () => { //onBtnNomClick
                this.verificateurDeChangementUi.closeModal();
              }
            )
          } else if (this.actionEnCours == Action.CONSULTER_APPEL_ANTERIEUR
            && actionCible != Action.CONSULTER_APPEL_ANTERIEUR
            && this.consulterAppelAnterieur?.isDirty()) {
            // Si on quitte le container de la consultation et que des modifs sont en cours, on demande une confirmation.
            this.subscriptions.add(
              this.materialModalDialogService.popupConfirmer("ss-iu-a00004").subscribe((result: boolean) => {
                if (result === true) {
                  this.confirmerNaviguerVers(actionCible, idUsager);
                }
              })
            );
          } else {
            this.confirmerNaviguerVers(actionCible, idUsager);
          }
        } else {
          // La navigation vers un usager inactif est impossible. 
          // On redirige vers la recherche.
          this.confirmerNaviguerVers(Action.RECHERCHER_USAGER, idUsager);
        }
      })
    );
  }

  /**
   * Vérifie si la navigation vers actionCible est possible, lance la sauvegarde et navigue vers la cible.
   * @param actionCible
   * @param idUsager
   */
  private confirmerNaviguerVers(actionCible: Action, idUsager: number) {
    if (this.actionEnCours != actionCible) {
      if (this.actionEnCours == Action.EDITER_USAGER && actionCible != Action.EDITER_USAGER) {
        // Si on quitte l'éditon d'un usager, on doit manuellement lancer la sauvegarde,
        // car le mécanisme de sauvegarde automatique ignore que l'on quitte.
        this.subscriptions.add(
          this.sauvegarderUsagerSiActif().subscribe(
            () => {
              this.actionsApresSauvegarde(actionCible, idUsager);
            }, (error: HttpErrorResponse) => {
              console.log(error.message);
            }
          )
        );
      } else {
        this.actionsApresSauvegarde(actionCible, idUsager);
      }
    }
  }

  /**
   * Navigue vers actionCible.
   * @param actionCible
   * @param idUsager
   */
  private actionsApresSauvegarde(actionCible: Action, idUsager: number) {
    // Garde en mémoire l'identifiant de l'usager à traiter.
    this.idUsager = idUsager;
    // Modifie l'action en cours, ceci affiche le composant correspondant dans le HTML.
    this.actionEnCours = actionCible;
    // Permet de rafraichir les @ViewChild, car initiallement ils sont à undefined si un ngIf les masque.
    this.changeDetector.detectChanges();
    this.creerLeftMenuItems();
  }

  /**
   * Lorsque l'édition d'un usager est demandée.
   * @param idUsager identifiant de l'usager à éditer
   */
  onEditerUsager(idUsager: number) {
    this.naviguerVers(Action.EDITER_USAGER, idUsager);
  }

  /**
   * Lorsque la consultation d'une fiche d'appel antérieure est demandée.
   * @param appelAnterieur
   */
  onConsulterFicheAppel(appelAnterieur: AppelAnterieurDTO): void {
    this.appelAnterieurDto = appelAnterieur;
    this.naviguerVers(Action.CONSULTER_APPEL_ANTERIEUR, this.idUsager);
  }

  /**
   * Lorsque l'ajout d'une note complémentaire à une fiche d'appel antérieure est terminée.
   */
  onAfterTerminerAjoutNote(): void {
    this.onConsulterFicheAppel(this.appelAnterieurDto);
  }

  /**
   * Lorsque le retour d'une relance vers la consultaiton est actionné.
   */
  onRelanceReturnEvent(): void {
    this.onConsulterFicheAppel(this.appelAnterieurDto);
  }

  /**
   * Lorsque la consultation d'un usager est demandée.
   * @param idUsager identifiant de l'usager à consulter
   */
  onConsulterUsager(idUsager: number) {
    this.naviguerVers(Action.CONSULTER_USAGER, idUsager);
  }

  /**
   * Lorsque la recherche d'usagers est demandé.
   */
  onRechercherUsager() {
    this.naviguerVers(Action.RECHERCHER_USAGER, null);
  }

  /**
   * Lorsque la liste des enregistrements est demandé.
   * @param idUsager identifiant de l'usager
   */
  onConsulterEnregistrementsUsager(idUsager: number) {
    this.naviguerVers(Action.CONSULTER_ENREGISTREMENTS, idUsager);
  }

  /**
   * Lorsque l'ajout d'un enregistrement est demandé.
   * @param idUsager identifiant de l'usager
   */
  onAjouterEnregistrementUsager(idUsager: number) {
    this.naviguerVers(Action.AJOUTER_ENREGISTREMENT, idUsager);
  }

  /**
  * Lorsque la consultation d'un enregistrement est demandée.
  * @param idUsager identifiant de l'usager
  */
  onConsulterEnregistrementUsager(idUsager: number) {
    this.naviguerVers(Action.CONSULTER_ENREGISTREMENT, idUsager);
  }

  onEditerEnregistrement(idUsager: number): void {
    this.naviguerVers(Action.EDITER_ENREGISTREMENT, idUsager);
  }

  onCopierEnregistrement(idEnregistrement: number): void {
    this.idEnregistrement = idEnregistrement
    this.naviguerVers(Action.COPIER_ENREGISTREMENT, this.idUsager);
  }

  /**
   * @Override
   */
  protected creerLeftMenuItems(): void {
    const hasRoleConsult: boolean = AuthenticationUtils.hasRole('ROLE_US_USAGER_CONSULT');
    const hasRoleModif: boolean = AuthenticationUtils.hasRole('ROLE_US_USAGER_MODIF');

    // Rechercher un usager
    this.menuItemRechercherUsager =
    {
      id: "menuItemDialogueUsagerComponentRechercherId",
      title: "usager.menuvert.btnrechercher",
      icon: "fa fa-search",
      action: this.actionRechercherUsager,
      isAction: true,
      isActive: this.actionEnCours == Action.RECHERCHER_USAGER,
      disabled: false,
      visible: hasRoleConsult
    };

    // Consulter un usager
    this.menuItemConsulterUsager =
    {
      id: "menuItemDialogueUsagerComponentConsulterId",
      title: "usager.menuvert.btnconsulter",
      icon: "fa fa-user",
      action: this.actionConsulterUsager,
      isAction: true,
      isActive: this.actionEnCours == Action.CONSULTER_USAGER,
      disabled: this.idUsager == null,
      visible: this.actionEnCours != Action.RECHERCHER_USAGER && hasRoleConsult
    };

    // Modifier un usager
    this.menuItemEditerUsager =
    {
      id: "menuItemDialogueUsagerComponentModifierId",
      title: "usager.menuvert.btnmodifier",
      icon: "fa fa-edit",
      action: this.actionEditerUsager,
      isAction: true,
      isActive: this.actionEnCours == Action.EDITER_USAGER,
      disabled: this.idUsager == null,
      visible: this.actionEnCours != Action.RECHERCHER_USAGER && hasRoleModif
    };

    // Liste des appels de l'usager
    this.menuItemAppelsUsager =
    {
      id: "menuItemDialogueUsagerComponentAppelsId",
      title: "usager.menuvert.btnlstappel",
      icon: "fa fa-folder-open",
      action: this.actionListerAppelsUsager,
      isAction: true,
      isActive: this.actionEnCours == Action.LISTER_APPELS_ANTERIEURS || this.actionEnCours == Action.CONSULTER_APPEL_ANTERIEUR,
      disabled: this.idUsager == null,
      visible: this.actionEnCours != Action.RECHERCHER_USAGER && hasRoleConsult
    };

    // Consulter la liste des enregistrements d'un usager
    this.menuItemEnregistrementsUsager =
    {
      id: "menuItemDialogueUsagerComponentEnregistrementId",
      title: "usager.menuvert.btnenregistrement",
      icon: "fa icon-address-card-o",
      action: this.actionConsulterEnregistrementsUsager,
      isAction: true,
      isActive: this.actionEnCours == Action.CONSULTER_ENREGISTREMENTS,
      disabled: this.idUsager == null,
      visible: this.actionEnCours != Action.RECHERCHER_USAGER && hasRoleConsult
    };

    this.leftMenuItems = [
      this.menuItemRechercherUsager,
      this.menuItemConsulterUsager,
      this.menuItemEditerUsager,
      this.menuItemAppelsUsager,
      this.menuItemEnregistrementsUsager];
    this.calculerCuleurIconeEnregistrements();
  }

  /**
   * Lance la sauvegarde de l'usager en cours s'il est actif.
   */
  private sauvegarderUsagerSiActif(): Observable<void> {
    return this.validerUsagerActif(this.idUsager).pipe(concatMap((isActif: boolean) => {
      if (isActif) {
        // Sauvegarde l'usager si actif
        return this.sigctUsagerEdition.sauvegarderUsager().pipe(map(_ => {
          return of(null);
        }));
      } else {
        return of(null);
      }
    }));
  }

  /**
   * Valide si l'usager est actif. Retourne true si l'usager est actif ou si idUsagerIdent = null.
   * @param idUsagerIdent identifiant de l'usager
   * @returns true si l'usager est actif ou si idUsagerIdent = null
   */
  private validerUsagerActif(idUsagerIdent: number): Observable<boolean> {
    if (idUsagerIdent) {
      return this.usagerService.isUsagerActif(idUsagerIdent).pipe(map((isActif: boolean) => {
        if (!isActif) {
          // L'usager n'est plus actif. Ses informations ne peuvent être modifiées.
          const msg: string = this.translateService.instant("ss-iu-e30008");
          const label: string = this.translateService.instant("sigct.ss.error.label");
          const alert: AlertModel = AlertModelUtils.createAlertModel([msg], label, AlertType.ERROR);
          this.alerts = [alert];
          //          this.alertStore.setAlerts([alertM]);
        }

        return isActif;
      }));
    } else {
      return of(true);
    }
  }
}
