import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import { BindingErrorsStore } from 'projects/sigct-service-ng-lib/src/lib/api-errors';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import { MsssM10Service } from 'projects/sigct-service-ng-lib/src/lib/services/msss-m10/msss-m10.service';
import { AppContext, AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { GroupeAgeOptions } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-groupe-age/sigct-group-age.options';
import { Action, FormTopBarOptions } from "projects/sigct-ui-ng-lib/src/lib/utils/form-top-bar-options";
import { nam_validator } from 'projects/sigct-ui-ng-lib/src/lib/utils/nam-validator';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { concatMap, map } from 'rxjs/operators';
import { LinkedUsagerDTO } from '../../../../../../sigct-service-ng-lib/src/lib/models/linked-usager-dto';
import { MsssM10CodePostal, MsssM10Municipalite } from '../../../../../../sigct-service-ng-lib/src/lib/models/msss-m10-models';
import { NiveauIdentificationUsager } from '../../../enums/niveau-identification-usager-enum';
import { ReferenceDTO } from "../../../models";
import { BaseUsagerDTO } from '../../../models/base-usager-dto';
import { RechercheUsagerCritereDTO } from '../../../models/recherche-usager-critere-dto';
import { TypeCoordonneeCommunicationEnum } from '../../../models/type-coordonnee-communication.enum';
import { TypeEquipementCommunicationEnum } from '../../../models/type-equipement-communication.enum';
import { UsagerCommDTO } from '../../../models/usager-comm-dto';
import { UsagerDTO } from '../../../models/usager-dto';
import { UsagerLieuResidenceDTO } from '../../../models/usager-lieu-residence-dto';
import { ReferencesService } from '../../../services/references.service';
import { UsagerService } from '../../../services/usager.service';
import { UtilitaireService } from '../../../services/utilitaire.service';
import { AdressesUsagerComponent } from '../../ui/adresses-usager/adresses-usager.component';
import { CommunicationUsagerComponent } from '../../ui/communication-usager/communication-usager.component';
import { IdentificationUsagerComponent } from '../../ui/identification-usager/identification-usager.component';
import { InformationsSuppUsagerComponent } from '../../ui/informations-supp-usager/informations-supp-usager.component';
import { PopupData, PopupImportCommAddrssLinkedUsagerComponent, TypeDataToBind } from '../../ui/popup-import-comm-addrss-linked-usager/popup-import-comm-addrss-linked-usager.component';
import { BaseUsagerContainerComponent } from '../base-usager-container/base-usager-container.component';

export enum couleurCadenas {
  ROUGE = "rouge",
  JAUNE = "jaune",
  VERT = "vert"
}




@Component({
  selector: 'sigct-usager-edition',
  templateUrl: './editer-usager-container.component.html',
  providers: [ConfirmationDialogService],
  styleUrls: ['./editer-usager-container.component.css']
})
export class EditerUsagerContainerComponent extends BaseUsagerContainerComponent implements OnInit, OnDestroy {
  idUsager: number = null;

  @Input("idUsager")
  set usagerId(idUsager: number) {
    // Alimente les listes de valeurs d'un bloc avant de récupérer le détail de l'usager.
    // ForkJoin lance les traitements en parallèle et effectue le subscribe quand ils sont tous terminés.
    this.subscriptions.add(
      forkJoin([this.referencesService.getListeSexe(), this.referencesService.getListeCoord(),
      this.referencesService.getListeTypeEquip(), this.referencesService.getListePays(),
      this.referencesService.getListeProvince(), this.referencesService.getListeRegion(),
      this.referencesService.getListeAdresse(), this.referencesService.getListeImmeu(),
      this.referencesService.getListeLangue()]).subscribe(result => {
        // Récupère de la bd la liste des sexes.
        this.listeSexe = result[0] as ReferenceDTO[];
        this.listeCoord = result[1] as ReferenceDTO[];
        this.listeTypeEquip = result[2] as ReferenceDTO[];
        // Alimente les listes de valeurs de la section Adresses
        this.listePays = result[3] as ReferenceDTO[];
        this.listeProvince = result[4] as ReferenceDTO[];
        this.listeRegion = result[5] as ReferenceDTO[];
        this.listeTypeAdresse = result[6] as ReferenceDTO[];
        this.listeTypeAppartement = result[7] as ReferenceDTO[];
        // Alimente les listes de valeurs de la section Informations supplémentaires
        this.listeLangue = result[8] as ReferenceDTO[];

        this.initUsager(idUsager);
      })
    );
  }

  @Input("topBarreFixe")
  topBarreFixe: boolean = true;

  /** Subscription utilisé pour accumuler les souscriptions à libérer dans le OnDestroy(). */
  private subscriptions: Subscription = new Subscription();

  /** Indique si le composant est utilisé en contexte d'un appel. */
  private isEnContextAppel: boolean = false;

  formTopBarOptions: FormTopBarOptions;

  noPaddingBottomStyle = { 'padding-bottom': '0' };

  @ViewChild("appIdentificationUsager", { static: false })
  appIdentificationUsager: IdentificationUsagerComponent;

  @ViewChild("appCommunicationUsager", { static: true })
  appCommunicationUsager: CommunicationUsagerComponent;

  @ViewChild("appAdresseUsager", { static: true })
  appAdresseUsager: AdressesUsagerComponent;

  @ViewChild("appInfoSupUsager", { static: true })
  appInfoSupUsager: InformationsSuppUsagerComponent;

  @ViewChild("alertContainer", { read: ViewContainerRef, static: true })
  container;

  public errorsMessages = {}

  // Contenu des listes de valeurs
  listeCoord: ReferenceDTO[];
  listeLangue: ReferenceDTO[];
  listePays: ReferenceDTO[];
  listeProvince: ReferenceDTO[];
  listeRegion: ReferenceDTO[];
  listeSexe: ReferenceDTO[];
  listeTypeAdresse: ReferenceDTO[];
  listeTypeAppartement: ReferenceDTO[];
  listeTypeEquip: ReferenceDTO[];


  public listeResultatCommunication: UsagerCommDTO[];
  public listeResultatAdresse: UsagerLieuResidenceDTO[];
  public msgCadenaUsager: string;
  public classCadenaUsager: string;
  public modeCreation: boolean = false;
  public nbCommsActif: number = 0;
  public nbCommsInactif: number = 0;
  public nbAdrActif: number = 0;
  public nbAdrInactif: number = 0;
  public detailMenuTop: string = "";
  public labelMenuTop: string = "";

  public critereRecherche: RechercheUsagerCritereDTO;

  @Output("modifierUsager")
  modifierUsager = new EventEmitter<number>();

  @Output("relierUsager")
  relierUsager = new EventEmitter<BaseUsagerDTO>();

  @Output("retourListe")
  retourRecherche = new EventEmitter<void>();

  @Input("linkedUsagerDTOs")
  linkedUsagerDTOs: LinkedUsagerDTO[];

  constructor(
    private router: Router,
    private usagerService: UsagerService,
    public utilitaireService: UtilitaireService,
    private referencesService: ReferencesService,
    private alertService: AlertService,
    private alertStore: AlertStore,
    private appContextStore: AppContextStore,
    private authenticationService: AuthenticationService,
    private bindingErrorsStore: BindingErrorsStore,
    private modalConfirmService: ConfirmationDialogService,
    private msssM10Service: MsssM10Service,
    private translateService: TranslateService,
    private spinner: NgxSpinnerService,
    private dialog: MatDialog) {

    super();
  }

  ngOnInit() {
    // Garder la session du portail active
    this.subscriptions.add(
      this.authenticationService.setSessionActivePortail().subscribe()
    );

    this.subscriptions.add(
      this.alertStore.state$.subscribe((state: AlertModel[]) => {
        this.alertService.show(this.container, state);
      })
    );

    // Récupère le contexte applicatif.
    this.subscriptions.add(
      this.appContextStore.state$.subscribe((appContext: AppContext) => {
        // Initialise la barre de boutons selon le contexte d'appel.
        this.isEnContextAppel = appContext.isContextAppel;
        this.initTopBar(this.isEnContextAppel || appContext.isContextCorrectionFicheAppel);
      })
    );
  }

  syncWait(ms: number): void {
    const end = Date.now() + ms
    while (Date.now() < end) continue
  }

  /**
   *
   */
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();

    // Vide la liste des messages pour ne pas qu'ils s'affichent sur la prochaine page.
    this.alertStore.resetAlert();
  }

  /**
   * Lorsqu'une navigation "externe" est enclenchée.
   * IMPORTANT: On doit sauvegarder les données à l'aide de navigation.sendBeacon()
   */
  autoSaveBeforeUnload(): void {
    this.traiterDonneesAvantSauvegardeUsager();
    // Lance la sauvegarde sur le serveur.
    this.usagerService.autoSaveUsager(this.appIdentificationUsager.usager);
  }

  /**
   * Lorsqu'une navigation "interne" est enclenchée. Le routing attend une réponse positive de cette méthode avant
   * de s'exécuter, laissant le temps de sauvegarder les données avant de poursuivre.
   */
  autoSaveBeforeRoute(): Observable<boolean> | Promise<boolean> | boolean {
    return this.validerUsagerActif(this.appIdentificationUsager?.usager?.id).pipe(concatMap((isActif: boolean) => {
      if (isActif) {
        return this.sauvegarderUsager().pipe(map(_ => true));
      }
      return of(true);
    }));
  }

  private initTopBar(isEnContexteAppel: boolean) {
    let topBarActions: Action[] = [];

    let topBarActionSauvegarder: Action = {
      label: this.translateService.instant("button.sauvegarder.label"),
      actionFunction: this.sauvegarder,
      compId: 'enregistrerBtn',
      extraClass: "btn-primary form-btn"
    };
    let topBarActionAnnuler: Action = {
      label: this.translateService.instant("button.cancel.label"),
      actionFunction: this.annuler,
      compId: 'annulerBtn',
      extraClass: "btn-default btn-auto-disabled"
    };

    if (isEnContexteAppel) {
      let topBarActionRetour: Action = {
        tooltip: this.translateService.instant("usager.bandeau.btnfermer2"),
        actionFunction: this.actionFermer,
        icon: "fa fa-times fa-lg",
        compId: 'retourBtn',
        extraClass: "btn-default btn-auto-disabled"
      };

      let topBarActionRelier: Action = {
        label: this.translateService.instant("usager.bandeau.btnrelierusager"),
        actionFunction: this.actionRelierUsager,
        compId: 'relierEtFermerBtn',
        extraClass: "btn-primary form-btn"
      };

      topBarActions = [topBarActionSauvegarder, topBarActionRelier, topBarActionAnnuler, topBarActionRetour];
    } else {
      let topBarActionRetour: Action = {
        label: this.translateService.instant("usager.bandeau.btnfermer1"),
        actionFunction: this.actionRetourRecherche,
        icon: "fa fa-times fa-lg",
        compId: 'retourBtn',
        extraClass: "btn-default btn-auto-disabled"
      };

      topBarActions = [topBarActionSauvegarder, topBarActionAnnuler, topBarActionRetour];
    }

    // Menu de boutons d'actions en haut et droite
    this.formTopBarOptions = {
      title: { icon: "fa fa fa-user fa-lg" },
      actions: topBarActions
    };
  }

  openModal(id: string) {
    this.modalConfirmService.open(id);
  }

  closeModal(id: string) {
    this.modalConfirmService.close(id);
  }


  /**
   * Initialisation de l'usager.
   *  - Récupération et affichage des données de l'usager idUsager.
   *  - Création et affichage d'un nouvel usager si idUsager est null.
   * @param idUsager
   */
  private initUsager(idUsager: number) {
    this.idUsager = idUsager;
    if (this.idUsager) {
      //Journaliser consultation usager
      this.auditConsultation(idUsager);
      this.getUsagerById();
    } else {
      this.creerUsager();
    }

    // Récupère les communications de l'usager.
    this.getListeResultatCommunication();

    // Récupère les adresses de l'usager.
    this.getListeResultatAdresse();

    this.appCommunicationUsager.oldUsagerComm = this.appCommunicationUsager.usagerComm;
  }

  /**
   * soumettre le formulaire identification usager et informations complementaires après le click sur le bouton Sauvegarder
   */
  sauvegarder = (): void => {
    this.alertStore.resetAlert();

    // S'assure que l'usager est actif avant de lancer la sauvegarde.
    this.subscriptions.add(
      this.usagerService.isUsagerActif(this.appIdentificationUsager?.usager?.id).subscribe((isActif: boolean) => {
        if (isActif) {
          this.appIdentificationUsager.form.ngSubmit.emit();
          this.appInfoSupUsager.form.ngSubmit.emit();

          setTimeout(() => {
            this.subscriptions.add(
              this.usagerService.getUsager(this.idUsager).subscribe(
                (usagerDTO: UsagerDTO) => {

                  if (!usagerDTO.prenom && !usagerDTO.nom) {
                    this.labelMenuTop = this.translateService.instant("usager.identification.usager.non.identifie");
                  } else if (usagerDTO.prenom && usagerDTO.nom) {
                    this.labelMenuTop = usagerDTO.prenom + " " + usagerDTO.nom;
                  } else if (usagerDTO.prenom) {
                    this.labelMenuTop = usagerDTO.prenom;
                  } else {
                    this.labelMenuTop = usagerDTO.nom;
                  }

                  this.detailMenuTop = "#" + usagerDTO.id;
                })
            );

          }, 500);
        } else {
          // L'usager n'est plus actif. Ses informations ne peuvent être modifiées.
          const msg = this.translateService.instant("ss-iu-e30008");
          this.creerErreurs([msg]);
        }
      })
    );
  }

  /**
   * annuler les informations saisis après le click sur le bouton Annuler
   */
  annuler = (): void => {
    this.openModal('confirm_popup_annuler');
  }

  actionRetourRecherche = (): void => {
    this.retourRecherche.emit();
  }

  actionFermer = (): void => {
    this.subscriptions.add(
      this.validerUsagerActif(this.appIdentificationUsager?.usager?.id).subscribe((isActif: boolean) => {
        if (isActif) {
          this.subscriptions.add(
            this.sauvegarderUsager().subscribe((usagerDto: UsagerDTO) => {
              this.fermerDialog.emit();
            })
          );
        } else {
          this.fermerDialog.emit();
        }
      })
    );
  }
  /**
   * Sauvegarde l'usager et avise le parent qu'on désire le relier.
   */
  actionRelierUsager = (): void => {
    this.relierUsagerAfterBlurPopUpChoice();
  }

  relierUsagerAfterBlurPopUpChoice = (): void => {
    const groupeAgeOptions: GroupeAgeOptions = this.appIdentificationUsager.usager.groupeAgeOptions;
    this.subscriptions.add(
      this.validerUsagerActif(this.appIdentificationUsager?.usager?.id).subscribe((isActif: boolean) => {
        if (isActif) {
          this.subscriptions.add(
            this.sauvegarderUsager().subscribe((usagerDto: UsagerDTO) => {
              usagerDto.groupeAgeOptions = groupeAgeOptions;
              this.relierUsager.emit(usagerDto);
            })
          );
        }
      })
    );
  }

  /**
   * Sauvegarder la section identification usager et la section informations complementaires
   */
  sauvegarderUsager(): Observable<UsagerDTO> {
    this.traiterDonneesAvantSauvegardeUsager();

    // 6156-Maintenant qu'on sauvegarde l'usager, on retire les critères de recherche de la mémoire
    // afin qu'ils ne soit pas utilisés comme valeur par défaut à nouveau.
    this.usagerService.sauvegarderCritereRecherche(null);

    // Lance la sauvegarde sur le serveur.
    return this.usagerService.sauvegarderUsager(this.appIdentificationUsager.usager);
  }

  private traiterDonneesAvantSauvegardeUsager() {
    this.getCadenasUsager();
    this.appIdentificationUsager.usager.nam = this.appInfoSupUsager.usagerDTO.nam;
    this.appIdentificationUsager.usager.moisExpr = this.appInfoSupUsager.usagerDTO.moisExpr;
    this.appIdentificationUsager.usager.anneeExpr = this.appInfoSupUsager.usagerDTO.anneeExpr;
    this.appIdentificationUsager.usager.langueCode = this.appInfoSupUsager.usagerDTO.langueCode;
    this.appIdentificationUsager.usager.langueNom = this.appInfoSupUsager.usagerDTO.langueNom;
    this.appIdentificationUsager.usager.malentendant = this.appInfoSupUsager.usagerDTO.malentendant;
    this.appIdentificationUsager.usager.doublonPotentiel = this.appInfoSupUsager.usagerDTO.doublonPotentiel;
    this.appIdentificationUsager.usager.nomMere = this.appInfoSupUsager.usagerDTO.nomMere;
    this.appIdentificationUsager.usager.prenomMere = this.appInfoSupUsager.usagerDTO.prenomMere;
    this.appIdentificationUsager.usager.nomPere = this.appInfoSupUsager.usagerDTO.nomPere;
    this.appIdentificationUsager.usager.prenomPere = this.appInfoSupUsager.usagerDTO.prenomPere;

    // Met à jour le groupe d'âge de l'usager en contexte d'appel si présent.
    this.updateGroupeAgeUsagerEnContexteAppel(this.appIdentificationUsager.usager.id, this.appIdentificationUsager.usager.groupeAgeOptions);
  }

  /**
   * Sauvegarder la section identification usager et la section informations complementaires et valide leur contenu.
   */
  sauvegarderEtValiderUsager() {
    this.subscriptions.add(
      // Sauvegarde l'usager sur le serveur.
      this.sauvegarderUsager().subscribe((usagerDto: UsagerDTO) => {

        // Une fois que la sauvegarde est complétée, obtenir les avertissements.
        this.subscriptions.add(
          this.usagerService.obtenirAvertissements(usagerDto.id).subscribe((res: Map<object, string>[]) => {

            let messagesAvertissements: string[] = new Array();
            let messagesAvertissementsFinaux: string[] = new Array();

            //Boucler les avertissements reçus
            Object.values(res["Avertissements"]).forEach((value: any) => {
              messagesAvertissements.push(value);
            });

            Object.values(res["AvertissementsFinaux"]).forEach((value: any) => {
              messagesAvertissementsFinaux.push(value);
            });

            var oldUsagerCommDTO: UsagerCommDTO = new UsagerCommDTO();
            oldUsagerCommDTO.codeTypeEquipComm = TypeEquipementCommunicationEnum.TEL;
            oldUsagerCommDTO.codeTypeCoordComm = TypeCoordonneeCommunicationEnum.PRINC;

            var oldUsagerLieuResidenceDTO: UsagerLieuResidenceDTO = new UsagerLieuResidenceDTO();
            oldUsagerLieuResidenceDTO.codeTypeAdresse = "PRINC"

            if (oldUsagerCommDTO.numero === null) { oldUsagerCommDTO.numero = ""; }
            if (this.appCommunicationUsager.usagerComm.numero === null) { this.appCommunicationUsager.usagerComm.numero = ""; }

            let isDirtyCommunication: boolean = (!oldUsagerCommDTO.equals(this.appCommunicationUsager.usagerComm));
            let isDirtyAdresse: boolean = (!oldUsagerLieuResidenceDTO.equals(this.appAdresseUsager.usagerLieuResidence));
            if (isDirtyCommunication || isDirtyAdresse) {
              if (isDirtyCommunication) {
                messagesAvertissements.push(this.translateService.instant("usager.modif.zone.gris", [this.translateService.instant("usager.communications.title"), "communication"]))
              }
              if (isDirtyAdresse) {
                messagesAvertissements.push(this.translateService.instant("usager.modif.zone.gris", [this.translateService.instant("usager.adresses.title"), "adresse"]));
              }

              this.bindingErrorsStore.setState({});
            }

            if (messagesAvertissementsFinaux.length > 0) {
              //Il y a des avertissements finaux alors les afficher
              let alertAvertissementsFinaux: AlertModel = new AlertModel();
              alertAvertissementsFinaux.messages = messagesAvertissementsFinaux;
              alertAvertissementsFinaux.title = this.translateService.instant("usager.msg.valfinale");
              alertAvertissementsFinaux.type = AlertType.WARNING_FINAL;
              this.alertStore.addAlert(alertAvertissementsFinaux);
            }

            if (messagesAvertissements.length > 0) {
              //Il y a des avertissements alors les afficher
              let alertAvertissements: AlertModel = new AlertModel();
              alertAvertissements.messages = messagesAvertissements;
              alertAvertissements.title = this.translateService.instant("usager.msg.avertissement");
              alertAvertissements.type = AlertType.WARNING;
              this.alertStore.addAlert(alertAvertissements);
            }

            this.afficheMessageSauvegardeReussi();
          })
        );
      })
    );
  }

  /**
   * Met à jour le groupe d'âge de l'usager en contexte d'appel si présent et si c'est le même.
   * @param idUsagerIdent identifiant de l'usager en édition
   * @param groupeAgeOptions nouveau groupe d'âge à attribuer à l'usager
   */
  private updateGroupeAgeUsagerEnContexteAppel(idUsagerIdent: number, groupeAgeOptions: GroupeAgeOptions) {
    // Récupère du store applicatif, l'usager en contexte d'appel.
    let usagerEnContexteAppel: BaseUsagerDTO = this.appContextStore.state.usagerEnContexteAppel;

    if (usagerEnContexteAppel && usagerEnContexteAppel.id == idUsagerIdent) {
      usagerEnContexteAppel.groupeAgeOptions = groupeAgeOptions;
      // Remet l'usager dans le store applicatif.
      this.appContextStore.setvalue("usagerEnContexteAppel", usagerEnContexteAppel);
    }
  }

  /**
   * Déterminer quel affichage appeler selon le nom bre communication actuels
   */
  afficherListeSelonStatut() {
    setTimeout(() => {
      if (!this.appCommunicationUsager.etatDisplayAll) {
        this.getListeResultatCommunication();
      } else {
        this.getListeResultatCommunicationInatif();
      }
    }, 100);
  }


  /**
   * Déterminer quel affichage appeler selon le nombre de communications actuels
   */
  afficherListeAdrSelonStatut() {
    setTimeout(() => {
      if (!this.appAdresseUsager.etatDisplayAll) {
        this.getListeResultatAdresse();
      } else {
        this.getListeResultatAdresseInatif();
      }
    }, 100);
  }

  /**
   * output - sauvegarder/update la section communication
   */
  onSubmitCommunication() {
    this.appCommunicationUsager.usagerComm.idUsagerIdentification = +this.idUsager;
    this.appCommunicationUsager.usagerComm.courriel = this.appCommunicationUsager.usagerComm.courriel?.toLowerCase();

    this.subscriptions.add(this.usagerService.isUsagerActif(this.idUsager).subscribe((result: Boolean) => {
      if (result) {
        if (this.appCommunicationUsager.usagerComm.id) {
          this.appCommunicationUsager.usagerComm.actif = true;
          this.subscriptions.add(
            this.utilitaireService.updateUsagerCommunication(this.appCommunicationUsager.usagerComm).subscribe(res => {
              this.getListeResultatCommunication();
              this.appCommunicationUsager.reinitialiserUsagerCommunication();
              this.afficherListeSelonStatut();
            })
          );
        } else {
          this.subscriptions.add(
            this.utilitaireService.addUsagerCommunication(this.appCommunicationUsager.usagerComm).subscribe(res => {
              if (this.appCommunicationUsager.communicationActif) {
                //C'est un remplacer alors archiver seulement si l'ajout fonctionne !
                this.appCommunicationUsager.communicationActif.actif = false;
                this.subscriptions.add(
                  this.utilitaireService.updateUsagerCommunication(this.appCommunicationUsager.communicationActif).subscribe(res => {
                    this.appCommunicationUsager.reinitialiserUsagerCommunication();
                    this.afficherListeSelonStatut();
                  })
                );
              }

              this.getListeResultatCommunication();
              this.appCommunicationUsager.reinitialiserUsagerCommunication();
              this.afficherListeSelonStatut();
            })
          );
        }
      } else {
        let messages: string[] = [];
        // L'usager n'est plus actif. Ses informations ne peuvent être modifiées.
        const msg = this.translateService.instant("ss-iu-e30008");
        messages.push(msg);
        this.creerErreurs(messages);
      }
    }));
  }


  /**
   * output - sauvegarder/update la section adresse
   */
  submitAdresse() {
    this.spinner.show("spinner-adresse");
    this.appAdresseUsager.usagerLieuResidence.idUsagerIdentification = +this.idUsager;

    this.subscriptions.add(this.usagerService.isUsagerActif(this.idUsager).subscribe((result: Boolean) => {
      if (result) {
        if (this.appAdresseUsager.usagerLieuResidence.id) {
          this.appAdresseUsager.usagerLieuResidence.actif = true;
          this.subscriptions.add(
            this.utilitaireService.updateUsagerLieuResidence(this.appAdresseUsager.usagerLieuResidence).subscribe(res => {
              this.getListeResultatAdresse();
              this.afficherListeAdrSelonStatut();
              this.appAdresseUsager.reinitialiserUsagerAdresse();
            },
              (err) => { this.spinner.hide("spinner-adresse") },
              () => { this.spinner.hide("spinner-adresse") })
          );
        } else {
          this.subscriptions.add(
            this.utilitaireService.addUsagerLieuResidence(this.appAdresseUsager.usagerLieuResidence).subscribe(res => {
              this.getListeResultatAdresse();
              this.afficherListeAdrSelonStatut();
              this.appAdresseUsager.reinitialiserUsagerAdresse();
            },
              (err) => { this.spinner.hide("spinner-adresse") },
              () => { this.spinner.hide("spinner-adresse") })
          );
        }
      } else {
        this.spinner.hide("spinner-adresse");

        let messages: string[] = [];
        // L'usager n'est plus actif. Ses informations ne peuvent être modifiées.
        const msg = this.translateService.instant("ss-iu-e30008");
        messages.push(msg);
        this.creerErreurs(messages);
      }
    }));
  }

  /**
   * output - archiver le moyen de communication
   */
  onArchiverCommunication() {
    this.appCommunicationUsager.makeSelectedElementInactive();
    this.subscriptions.add(
      this.utilitaireService.updateUsagerCommunication(this.appCommunicationUsager.elementSelectionne).subscribe(res => {
        setTimeout(() => { this.getCadenasUsager(); }, 500);
        this.appCommunicationUsager.reinitialiserUsagerCommunication();
        this.afficherListeSelonStatut();
        this.appCommunicationUsager.form.controls['numero'].reset();
      })
    );
  }

  openModalForConfirmerArchiverComm(): void {
    this.subscriptions.add(this.usagerService.isUsagerActif(this.idUsager).subscribe((result: Boolean) => {
      if (result) {
        this.appCommunicationUsager.openModalForConfirmerArchiverCommunication();
      } else {
        let messages: string[] = [];
        // L'usager n'est plus actif. Ses informations ne peuvent être modifiées.
        const msg = this.translateService.instant("ss-iu-e30008");
        messages.push(msg);
        this.creerErreurs(messages);
      }
    }));
  }

  openModalForConfirmerArchiverAdrss(): void {
    this.subscriptions.add(this.usagerService.isUsagerActif(this.idUsager).subscribe((result: Boolean) => {
      if (result) {
        this.appAdresseUsager.openModalForConfirmerArchiverAddress();
      } else {
        let messages: string[] = [];
        // L'usager n'est plus actif. Ses informations ne peuvent être modifiées.
        const msg = this.translateService.instant("ss-iu-e30008");
        messages.push(msg);
        this.creerErreurs(messages);
      }
    }));
  }

  private creerErreurs(messages: string[]) {
    //Vider les alertes déjà présentes
    this.alertStore.resetAlert();
    const alertM: AlertModel = AlertModelUtils.createAlertModel(messages, this.translateService.instant("sigct.ss.error.label"), AlertType.ERROR);
    this.alertStore.addAlert(alertM);
  }

  /**
   * Lorsqu'on demande d'archiver un lieu de résidence
   * @param idUsagerLieuResidence identifiant du lieu de résidence à archiver
   */
  onArchiverAdresse(idUsagerLieuResidence: number) {
    this.subscriptions.add(this.usagerService.isUsagerActif(this.idUsager).subscribe((result: Boolean) => {
      if (result) {
        this.subscriptions.add(
          this.utilitaireService.archiverUsagerLieuResidence(idUsagerLieuResidence).subscribe(res => {
            this.appAdresseUsager.reinitialiserUsagerAdresse();
            this.afficherListeAdrSelonStatut();
          })
        );
      } else {
        let messages: string[] = [];
        // L'usager n'est plus actif. Ses informations ne peuvent être modifiées.
        const msg = this.translateService.instant("ss-iu-e30008");
        messages.push(msg);
        this.creerErreurs(messages);
      }
    }));
  }

  /**
   * Affiche message de sauvegarde réussie
   */
  afficheMessageSauvegardeReussi() {
    let msg: string[] = [];
    const alertM: AlertModel = new AlertModel();
    alertM.title = this.translateService.instant("ss.msg.succes.confirmation");
    alertM.type = AlertType.SUCCESS;
    msg.push(this.translateService.instant("ss.msg.succes.confirmation.text"));
    alertM.messages = msg;

    this.alertStore.addAlert(alertM);

    this.bindingErrorsStore.setState({});
  }


  /**
   * Récupère la liste des communications.
   */
  public getListeResultatCommunication() {
    // Récupère de la bd la liste des communications.
    this.subscriptions.add(
      this.utilitaireService.listUsagerCommunications(+this.idUsager).subscribe((res: UsagerCommDTO[]) => {
        this.listeResultatCommunication = res.filter(comm => comm.actif);
        this.nbCommsActif = this.listeResultatCommunication.length;
        this.appCommunicationUsager.cacherAfficherReduire = this.nbCommsActif === res.length;
        setTimeout(() => { this.getCadenasUsager(); }, 500);
      })
    );
  }


  /**
   * Récupère la liste des communications actifs et inactifs.
   */
  public getListeResultatCommunicationInatif() {

    // Récupère de la bd la liste des communications.
    this.subscriptions.add(
      this.utilitaireService.listUsagerCommunications(+this.idUsager).subscribe((res: UsagerCommDTO[]) => {
        this.listeResultatCommunication = res;
        this.nbCommsInactif = this.listeResultatCommunication.length;
        setTimeout(() => { this.getCadenasUsager(); }, 500);
      })
    );
  }

  /**
   * Récupère la liste des adresse.
   */
  public getListeResultatAdresse() {

    // Récupère de la bd la liste des addresses.
    this.subscriptions.add(
      this.utilitaireService.getAllUsagerLieuResidences(+this.idUsager).subscribe((res: UsagerLieuResidenceDTO[]) => {
        this.listeResultatAdresse = res.filter(res => res.actif);
        this.nbAdrActif = this.listeResultatAdresse.length;
        this.appAdresseUsager.cacherAfficherReduire = this.nbAdrActif === res.length;
        setTimeout(() => { this.getCadenasUsager(); }, 500);
      })
    );
  }

  /**
   * Récupère la liste des adresse actifs et inactifs.
   */
  public getListeResultatAdresseInatif() {

    // Récupère de la bd la liste des addresses.
    this.subscriptions.add(
      this.utilitaireService.getAllUsagerLieuResidences(+this.idUsager).subscribe((res: UsagerLieuResidenceDTO[]) => {
        this.listeResultatAdresse = res;
        this.nbAdrInactif = this.listeResultatAdresse.length;
        setTimeout(() => { this.getCadenasUsager(); }, 500);
      })
    );
  }


  /**
   * Récupère l'Usager selon l'id usager obtenu de l'url
   */
  getUsagerById() {
    this.bindingErrorsStore.setState({});

    if (this.idUsager) {
      this.subscriptions.add(
        this.usagerService.getUsager(this.idUsager).subscribe((usagerDTO: UsagerDTO) => {

          //Récupérer les critères de recherche, l'objet est renseigné uniquement si c'est la création d'un usager et non la modification
          this.critereRecherche = this.usagerService.getCritereRecherhce();

          if (this.critereRecherche) {

            if (this.critereRecherche.nom) {
              usagerDTO.nom = StringUtils.convertFirstLetterToUpperCase(this.critereRecherche.nom);
            }

            if (this.critereRecherche.prenom) {
              usagerDTO.prenom = StringUtils.convertFirstLetterToUpperCase(this.critereRecherche.prenom);
            }

            if (this.critereRecherche.malentendant) {
              usagerDTO.malentendant = this.critereRecherche.malentendant;
            }

            if (this.critereRecherche.doublonPotentiel) {
              usagerDTO.doublonPotentiel = this.critereRecherche.doublonPotentiel;
            }

            if (this.critereRecherche.dateNaissance) {
              usagerDTO.dtNaiss = this.critereRecherche.dateNaissance;
            }

            if (this.critereRecherche.langueCode) {
              usagerDTO.langueCode = this.critereRecherche.langueCode;
            }

            if (this.critereRecherche.sexeCode) {
              usagerDTO.sexeCode = this.critereRecherche.sexeCode;
            }

            if (this.critereRecherche.nam) {
              usagerDTO.nam = this.critereRecherche.nam.toLocaleUpperCase();
            }

          }

          if (!usagerDTO.prenom && !usagerDTO.nom) {
            this.labelMenuTop = this.translateService.instant("usager.identification.usager.non.identifie");
          } else if (usagerDTO.prenom && usagerDTO.nom) {
            this.labelMenuTop = usagerDTO.prenom + " " + usagerDTO.nom;
          } else if (usagerDTO.prenom) {
            this.labelMenuTop = usagerDTO.prenom;
          } else {
            this.labelMenuTop = usagerDTO.nom;
          }

          this.detailMenuTop = "#" + usagerDTO.id;

          this.appContextStore.setvalue('statusEnregistrementsUsager', usagerDTO.statusEnregistrement);

          this.alertStore.resetAlert();

          // Lorsque EditerterUsager est utilisé en contexte d'un appel, on veut afficher le groupe d'âge de l'usager en contexte d'appel.
          // Récupère l'usager en contexte d'appel si présent.
          const usagerEnContexteAppel: BaseUsagerDTO = this.appContextStore.state.usagerEnContexteAppel;

          usagerDTO.groupeAgeOptions = new GroupeAgeOptions();
          // Affiche le groupe d'âge en contexte d'appel en priorité.
          if (this.idUsager == usagerEnContexteAppel?.id) {
            usagerDTO.groupeAgeOptions.dateNaissance = usagerEnContexteAppel.groupeAgeOptions?.dateNaissance;
            if (!usagerEnContexteAppel.groupeAgeOptions?.dateNaissance) {
              usagerDTO.groupeAgeOptions.annees = usagerEnContexteAppel.groupeAgeOptions?.annees;
              usagerDTO.groupeAgeOptions.mois = usagerEnContexteAppel.groupeAgeOptions?.mois;
              usagerDTO.groupeAgeOptions.jours = usagerEnContexteAppel.groupeAgeOptions?.jours;
            }
            usagerDTO.groupeAgeOptions.groupe = usagerEnContexteAppel.groupeAgeOptions?.groupe;
            usagerDTO.groupeAgeOptions.groupeId = usagerEnContexteAppel.groupeAgeOptions?.groupeId;
          } else {
            usagerDTO.groupeAgeOptions.dateNaissance = usagerDTO.dtNaiss;
          }

          if (usagerDTO.moisExpr) {
            if (usagerDTO.moisExpr.toString().length == 1) {
              usagerDTO.moisExpr = "0" + usagerDTO.moisExpr;
            }
          }

          this.appIdentificationUsager.setUsager(usagerDTO);
          this.appAdresseUsager.reinitialiserUsagerAdresse();
          this.appCommunicationUsager.reinitialiserUsagerCommunication();
          this.appInfoSupUsager.usagerDTO = usagerDTO;

          // Report des critères de recherche pour les champs adresses
          if (this.critereRecherche) {

            if (this.critereRecherche.codePostal && this.critereRecherche.codePostal.length == 6) {
              this.subscriptions.add(
                this.msssM10Service.rechercherCodesPostaux(this.critereRecherche.codePostal).subscribe((msssM10CodePostal: MsssM10CodePostal[]) => {
                  if (msssM10CodePostal.length == 1) {
                    this.appAdresseUsager.onCodePostalSelected(msssM10CodePostal[0]);
                  } else {
                    this.gestionMunicipaliteRegion();
                  }
                })
              );
            } else {
              this.gestionMunicipaliteRegion();
            }


            // Si le numéro de téléphone est renseigné on renseigne ce moyen de communication en priorité
            if (this.critereRecherche.telephone) {
              this.appCommunicationUsager.usagerComm.numero = this.critereRecherche.telephone;
            } else {
              // adresse courriel
              if (this.critereRecherche.autreMoyenCommunication) {
                this.appCommunicationUsager.changeMoyenCourelec();
                this.appCommunicationUsager.usagerComm.courriel = this.critereRecherche.autreMoyenCommunication;
              }
            }
          }

          if (this.appIdentificationUsager.usager.niveauIdent == NiveauIdentificationUsager.PARTIEL) {
            this.classCadenaUsager = couleurCadenas.JAUNE;
            this.msgCadenaUsager = "usager.cadenas.jaune.partiel";
          } else if (this.appIdentificationUsager.usager.niveauIdent == NiveauIdentificationUsager.TOTAL) {
            this.classCadenaUsager = couleurCadenas.VERT;
            this.msgCadenaUsager = "usager.cadenas.vert.total";
          } else {
            this.classCadenaUsager = couleurCadenas.ROUGE;
            this.msgCadenaUsager = "usager.cadenas.rouge.anonyme"
          }

        },
          err => {
            let alertM: AlertModel = new AlertModel();
            alertM.messages = [this.translateService.instant("usager.msg.non.trouve")];
            alertM.title = this.translateService.instant("girpi.error.label");
            alertM.type = AlertType.ERROR;
            this.alertStore.addAlert(alertM);
          })
      );
    }

  }

  /**
   * Gestion du report du nom de municipalité et code région lors de l'ajout d'un usager
   */
  private gestionMunicipaliteRegion() {

    let isMunicipaliteTrouve: boolean = false;
    if (this.critereRecherche.municipalite) {

      this.subscriptions.add(
        this.msssM10Service.rechercherMunicipalites(this.critereRecherche.municipalite).subscribe((msssM10Municipalite: MsssM10Municipalite[]) => {
          if (msssM10Municipalite.length == 1) {
            this.appAdresseUsager.onMunicipaliteSelected(msssM10Municipalite[0]);
            isMunicipaliteTrouve = true;
          } else {
            //M10 nous a retourné une liste de municipalité
            if (msssM10Municipalite.length > 1) {
              let regExp = new RegExp('-', 'g');
              let nomMunicipaliteSaisieConverti: string = StringUtils.convertAccentCharacter(this.critereRecherche.municipalite).replace(regExp, ' ');
              let nbMunicipaliteTrouve: number = 0;
              let municipaliteTrouve: MsssM10Municipalite;

              msssM10Municipalite.forEach((muni: MsssM10Municipalite) => {
                // On veut uniquement les municipalités qui sont actives
                if (muni.typeMunicipalite === 'municipalite') {
                  // On sélectionne celle qui a exactement le même nom
                  if (StringUtils.safeEqualsIgnoreCase(StringUtils.convertAccentCharacter(muni.nom).replace(regExp, ' '), nomMunicipaliteSaisieConverti)) {
                    nbMunicipaliteTrouve++;
                    municipaliteTrouve = muni;
                  }
                }
              });

              // Si on a trouvé une seule municipalité on renseigne le champ et onfait appel à M10
              if (nbMunicipaliteTrouve == 1) {
                this.appAdresseUsager.onMunicipaliteSelected(municipaliteTrouve);
                isMunicipaliteTrouve = true;
              }
            }
          }
        })
      );
    }

    // Si on n'a pas trouvé la municipalité on utilise la région (si le code est renseigné)
    if (!isMunicipaliteTrouve && this.critereRecherche.regionCode) {
      this.appAdresseUsager.inputOptionRegion.options.forEach((ioRegion: any) => {
        if (ioRegion.value == this.critereRecherche.regionCode) {
          this.appAdresseUsager.onRegionSelected(ioRegion);
          return true; // Pour sortir de la boucle
        }
      });
    }
  }
  /**
   * Crée un nouvel usager vide.
   */
  private creerUsager() {
    this.subscriptions.add(
      this.usagerService.creerUsager().subscribe(
        (usager: UsagerDTO) => {

          // Lance la navigation vers le nouvel usager
          this.modifierUsager.emit(usager.id);
        },
        err => {
          let alertM: AlertModel = new AlertModel();
          alertM.messages = [err.message.toString()];
          alertM.title = this.translateService.instant("girpi.error.label");;
          alertM.type = AlertType.ERROR;
          this.alertStore.addAlert(alertM);
        })
    );
  }

  isNamValid(nam: string): boolean {
    let isNamValid: boolean = false;
    let namFormat: string;
    if (this.appInfoSupUsager.usagerDTO.nam) {
      if (this.appInfoSupUsager.usagerDTO.nam.length == 12) {
        namFormat = this.appInfoSupUsager.usagerDTO.nam.substring(0, 4) + "-" +
          this.appInfoSupUsager.usagerDTO.nam.substring(4, 8) + "-" +
          this.appInfoSupUsager.usagerDTO.nam.substring(8, 12)

        if (nam_validator(namFormat)) {
          isNamValid = true;
        }
      }
    }
    return isNamValid;
  }


  /**
   * changer la couleur du cadenas selon l'identification de l'usager
   */
  getCadenasUsager() {
    this.appIdentificationUsager.usager.niveauIdent = NiveauIdentificationUsager.ANONYME;
    this.classCadenaUsager = couleurCadenas.ROUGE;
    this.msgCadenaUsager = "usager.cadenas.rouge.anonyme";

    let nbComs: number;
    try {
      nbComs = this.appCommunicationUsager.usagerCommunications.filter(comm => comm.actif).length;
    } catch (e) {
      nbComs = 0;
    }

    let nbAdrs: number;
    let nbCP: number;
    try {
      nbAdrs = this.appAdresseUsager.usagerLieuResidences.filter(add => add.actif && (add.codePostal || add.noCiviq || add.noCiviqSuffx || add.rue)).length;
      let list: UsagerLieuResidenceDTO[] = this.appAdresseUsager.usagerLieuResidences.filter(add => add.actif && (add.codePostal || add.noCiviq || add.noCiviqSuffx || add.rue));
      nbCP = list[0].codePostal.length;
    } catch (e) {
      nbAdrs = 0;
      nbCP = 0;
    }


    if (!this.appIdentificationUsager.usager.nom || !this.appIdentificationUsager.usager.prenom) {
      this.appIdentificationUsager.usager.niveauIdent = NiveauIdentificationUsager.ANONYME;
      this.classCadenaUsager = couleurCadenas.ROUGE;
      this.msgCadenaUsager = "usager.cadenas.rouge.anonyme";
      return;
    } else if (

      (this.appIdentificationUsager.usager.nom
        && this.appIdentificationUsager.usager.prenom
        && this.appIdentificationUsager.usager.dtNaiss
        && this.appIdentificationUsager.usager.sexeCode
      )
      &&
      (
        (this.appCommunicationUsager.usagerCommunications
          && nbComs > 0
        )
        ||
        (this.appAdresseUsager.usagerLieuResidences
          && nbAdrs > 0 && nbCP === 6
        )
        ||
        this.isNamValid(this.appInfoSupUsager.usagerDTO.nam) || (this.appInfoSupUsager.usagerDTO.nomMere && this.appInfoSupUsager.usagerDTO.prenomMere) || (this.appInfoSupUsager.usagerDTO.nomPere && this.appInfoSupUsager.usagerDTO.prenomPere))

    ) {
      this.appIdentificationUsager.usager.niveauIdent = NiveauIdentificationUsager.TOTAL;
      this.classCadenaUsager = couleurCadenas.VERT;
      this.msgCadenaUsager = "usager.cadenas.vert.total";
      return;
    } else if (this.appIdentificationUsager.usager.nom && this.appIdentificationUsager.usager.prenom && this.getCadenasJaune() > 0) {
      this.appIdentificationUsager.usager.niveauIdent = NiveauIdentificationUsager.PARTIEL;
      this.classCadenaUsager = couleurCadenas.JAUNE;
      this.msgCadenaUsager = "usager.cadenas.jaune.partiel";
      return;
    }
  }

  getCadenasJaune(): number {
    let count: number = 0;

    if (this.appIdentificationUsager.usager.groupeAgeOptions.dateNaissance)
      count++;

    if (this.appIdentificationUsager.usager.sexeCode)
      count++;

    if (this.appCommunicationUsager.usagerCommunications) {
      if (this.appCommunicationUsager.usagerCommunications.filter(comm => comm.actif).length > 0)
        count++;
    }

    if (this.appAdresseUsager.usagerLieuResidences) {
      if (this.appAdresseUsager.usagerLieuResidences.filter(add => add.actif && (add.codePostal || add.noCiviq || add.noCiviqSuffx || add.rue)).length > 0)
        count++;
    }

    if (this.isNamValid(this.appInfoSupUsager.usagerDTO.nam))
      count++;

    if (this.appInfoSupUsager.usagerDTO.nomMere && this.appInfoSupUsager.usagerDTO.prenomMere)
      count++;

    if (this.appInfoSupUsager.usagerDTO.nomPere && this.appInfoSupUsager.usagerDTO.prenomPere)
      count++;

    return count;
  }

  /**
   * Nettoyage du code postal à la demande du click sur Code postal inconnu.
   */
  clearCodePostal() {
    if (this.appAdresseUsager.usagerLieuResidence.codePostal) {
      this.appAdresseUsager.form.controls['codePostal'].reset();
    }
  }

  /** Journaliser l'accès à la consultation */
  private auditConsultation(idUsager: number): void {
    this.subscriptions.add(
      this.usagerService.journaliserConsultationUsager(idUsager).subscribe()
    );
  }

  selectCommOrAddressFromLinkedUsager($event: any): void {
    if ($event?.idIdentifLinkedUsager) {
      const idIdentifLinkedUsager: number = +$event.idIdentifLinkedUsager;
      const typeDataToAdd: string = $event.typeDataToAdd;
      let popupData: PopupData;
      if (typeDataToAdd == TypeDataToBind.COMM) {
        this.subscriptions.add(
          this.utilitaireService.listUsagerCommunicationsActifs(idIdentifLinkedUsager, true).subscribe((communications: UsagerCommDTO[]) => {
            if (communications) {
              popupData = { communications: communications, commComponent: this.appCommunicationUsager, typeDataToAdd: typeDataToAdd };
              this.createDialog(popupData);
            }
          })
        );
      } else if (typeDataToAdd == TypeDataToBind.ADDRESS) {
        this.subscriptions.add(
          this.utilitaireService.getAllUsagerLieuResidencesActifs(idIdentifLinkedUsager, true).subscribe((addresses: UsagerLieuResidenceDTO[]) => {
            if (addresses) {
              popupData = { addresses: addresses, addressComponent: this.appAdresseUsager, typeDataToAdd: typeDataToAdd, currentIdUsagerIdentif: +this.idUsager };
              this.createDialog(popupData);
            }
          })
        );
      }
    }
  }

  private createDialog(popupData: PopupData) {
    if (popupData) {
      const dialogRef = this.dialog.open(PopupImportCommAddrssLinkedUsagerComponent, this.getdialogConfig(popupData));
      this.subscriptions.add(dialogRef.afterOpened().subscribe(() => { }));
      this.subscriptions.add(dialogRef.afterClosed().subscribe(() => { }));
    }
  }

  private getdialogConfig(popupData: PopupData): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.restoreFocus = true;
    dialogConfig.width = "88vw";
    dialogConfig.maxWidth = "88vw";
    dialogConfig.height = "calc(100% - 167px)";
    dialogConfig.data = popupData;

    return dialogConfig
  }

  /**
   * Vérifie si l'usager est actif dans la bd. Affiche un message d'erreur si addAlert est true.
   * @param idUsagerIdent identifiant de l'usager
   * @returns
   */
  public validerUsagerActif(idUsagerIdent: number): Observable<boolean> {
    return this.usagerService.isUsagerActif(idUsagerIdent).pipe(map((isActif: boolean) => {
      if (!isActif) {
        this.alertStore.resetAlert();
        // L'usager n'est plus actif. Ses informations ne peuvent être modifiées.
        const msg = this.translateService.instant("ss-iu-e30008");
        this.creerErreurs([msg]);
      }

      return isActif;
    }));
  }
}

