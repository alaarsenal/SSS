import { formatNumber } from '@angular/common';
import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import { MaterialModalDialogService } from 'projects/sigct-service-ng-lib/src/lib/material-modal-dialog/material-modal-dialogl.service';
import { KeepAliveService } from 'projects/sigct-service-ng-lib/src/lib/services/keep-alive.service';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { Action, FormTopBarOptions } from 'projects/sigct-ui-ng-lib/src/lib/utils/form-top-bar-options';
import { InputOption, InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { USAGERS_FUSION_STORAGE_ID } from 'projects/usager-ng-core/src/config';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { catchError, concatMap, map } from 'rxjs/operators';
import { UsagerCommDTO, UsagerLieuResidenceDTO } from '../../../models';
import { ReferenceDTO } from '../../../models/reference-dto';
import { UsagerDTO } from '../../../models/usager-dto';
import { UsagerFusionDTO } from '../../../models/usager-fusion-dto';
import { ReferencesService } from '../../../services/references.service';
import { UsagerFusionApiService } from '../../../services/usager-fusion-api.service';
import { UsagerService } from '../../../services/usager.service';
import { UtilitaireService } from '../../../services/utilitaire.service';
import FusionUtils from '../../../utils/fusion-utils';
import UsagerUtils from '../../../utils/usager-utils';
import { FusionCommunicationsUsagerComponent } from '../../ui/fusion-communications-usager-ui/fusion-communications-usager-ui.component';
import { FusionLieuxResidenceUsagerComponent } from '../../ui/fusion-lieux-residence-usager-ui/fusion-lieux-residence-usager-ui.component';

const MAX_LENGTH_DETAIL: number = 255;




@Component({
  selector: 'sigct-usager-fusion-container',
  templateUrl: './fusionner-usager-container.component.html',
  styleUrls: ['./fusionner-usager-container.component.css']
})
export class FusionnerUsagerContainerComponent implements OnInit, OnDestroy, AfterViewInit {
  private subscriptions: Subscription = new Subscription();

  private inputOptionSelectionnez: InputOption;
  private isReferencesChargees: boolean = false;

  private listeSexe: ReferenceDTO[];
  private listeLangue: ReferenceDTO[];

  private dateDebutFusion: Date;

  idUsager1: number = null;
  idUsager2: number = null;

  usager1Dto: UsagerFusionDTO;
  usager2Dto: UsagerFusionDTO;
  usagerFusionDto: UsagerFusionDTO = new UsagerFusionDTO();

  usager1DetailChecked: boolean = false;
  usager2DetailChecked: boolean = false;

  listeCommunicationUsager1: UsagerCommDTO[] = [];
  listeCommunicationUsager2: UsagerCommDTO[] = [];
  listeLieuResidenceUsager1: UsagerLieuResidenceDTO[] = [];
  listeLieuResidenceUsager2: UsagerLieuResidenceDTO[] = [];

  isNomValide: boolean = true;
  isPrenomValide: boolean = true;
  isDtNaissValide: boolean = true;
  isSexeValide: boolean = true;
  isDetailValide: boolean = true;

  isNamValide: boolean = true;
  isExpirationValide: boolean = true;
  isLangueValide: boolean = true;
  isMalentendantValide: boolean = true;
  isNomPrenomMereValide: boolean = true;
  isNomPrenomPereValide: boolean = true;
  isDoublonPotentielValide: boolean = true;

  dtNaissOptions: InputOptionCollection = {
    name: "dt-naiss-options",
    options: []
  };
  expirationOptions: InputOptionCollection = {
    name: "expiration-options",
    options: []
  };
  langueOptions: InputOptionCollection = {
    name: "langue-options",
    options: []
  };
  namOptions: InputOptionCollection = {
    name: "nam-options",
    options: []
  };
  nomOptions: InputOptionCollection = {
    name: "nom-options",
    options: []
  };
  ouiNonOptions: InputOptionCollection = {
    name: "oui-non-options",
    options: []
  };
  prenomOptions: InputOptionCollection = {
    name: "prenom-options",
    options: []
  };
  nomPrenomMereOptions: InputOptionCollection = {
    name: "nom-prenom-mere-options",
    options: []
  };
  nomPrenomPereOptions: InputOptionCollection = {
    name: "nom-prenom-pere-options",
    options: []
  };
  sexeOptions: InputOptionCollection = {
    name: "sexe-options",
    options: []
  };

  // Section Communications
  typeEquipementCommOptions: InputOption[];
  typeCoordonneeCommOptions: InputOption[];

  // Section Adresses
  typeLieuResidenceOptions: InputOption[];

  ouiLabel: string;
  nonLabel: string;
  selectionnezLabel: string;

  formTopBarOptions: FormTopBarOptions;
  labelMenuTop: string = this.translateService.instant("sigct.usager.fusion.titre");

  @Input("idUsager1")
  set usagerId1(idUsagerIdent: number) {
    this.idUsager1 = idUsagerIdent;
    this.subscriptions.add(
      this.chargerReferences().subscribe((val) => {
        this.initUsager1();
      })
    );
  }

  @Input("idUsager2")
  set usagerId2(idUsagerIdent: number) {
    this.idUsager2 = idUsagerIdent;
    this.subscriptions.add(
      this.chargerReferences().subscribe((val) => {
        this.initUsager2();
      })
    );
  }

  @Input()
  topBarreFixe: boolean = true;

  @Input()
  topBarreVisible: boolean = true;

  @Output("retourListe")
  retourRecherche = new EventEmitter<void>();

  @ViewChild("fusionCommunicationsUsagerUi")
  fusionCommunicationsUsagerComponent: FusionCommunicationsUsagerComponent;

  @ViewChild("fusionLieuxResidenceUsagerUi")
  fusionLieuxResidenceUsagerComponent: FusionLieuxResidenceUsagerComponent;

  @ViewChild("alertContainer", { read: ViewContainerRef, static: true })
  container: ViewContainerRef;

  constructor(
    private router: Router,
    private alertStore: AlertStore,
    private alertService: AlertService,
    private utilitaireService: UtilitaireService,
    private translateService: TranslateService,
    private usagerService: UsagerService,
    private usagerFusionApiService: UsagerFusionApiService,
    private referencesService: ReferencesService,
    private materialModalDialogService: MaterialModalDialogService,
    private keepAliveService: KeepAliveService) {
  }

  ngOnInit() {
    this.dateDebutFusion = new Date();

    this.subscriptions.add(
      this.alertStore.state$.subscribe((state: AlertModel[]) => {
        this.alertService.show(this.container, state);
      })
    );

    // Récupère un libellé bidon pour s'assurer que le fichier des libellés est chargé avant de récupérer les vrais libellés.
    this.subscriptions.add(
      this.translateService.get("bidon").subscribe(_ => {
        this.ouiLabel = this.translateService.instant("sigct.ss.boolean.true");
        this.nonLabel = this.translateService.instant("sigct.ss.boolean.false");
        this.selectionnezLabel = this.translateService.instant("option.select.message");

        this.initTopBar();
      })
    );
  }

  ngAfterViewInit(): void {
    this.focusFirstElement();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  /**
   * Charge les références servant à alimenter les différentes listes déroulantes.
   * @returns
   */
  private chargerReferences(): Observable<void> {
    // Si les options oui/non, de langue ou de sexe sont vides, on les récupère de la bd.
    if (!this.isReferencesChargees) {
      return forkJoin([
        this.translateService.get(["option.select.message", "sigct.ss.boolean.true", "sigct.ss.boolean.false"]), //0
        this.referencesService.getListeSexe(),      //1
        this.referencesService.getListeLangue(),    //2
        this.referencesService.getListeTypeEquip(), //3
        this.referencesService.getListeCoord(),     //4
        this.referencesService.getListeAdresse(),   //5
      ]).pipe(map(results => {
        if (results[0]) {
          const labels: string[] = results[0] as string[];

          this.selectionnezLabel = labels["option.select.message"];
          this.ouiLabel = labels["sigct.ss.boolean.true"];
          this.nonLabel = labels["sigct.ss.boolean.false"];
        }

        // Initialise l'option "Sélectionnez..."
        this.inputOptionSelectionnez = {
          value: null,
          label: this.selectionnezLabel,
          description: this.selectionnezLabel
        };

        // Initialise les options Oui/Non
        this.ouiNonOptions.options = [
          this.inputOptionSelectionnez,
          { value: String(true), label: this.ouiLabel, description: "" },
          { value: String(false), label: this.nonLabel, description: "" }
        ];

        if (results[1]) {
          this.listeSexe = results[1] as ReferenceDTO[];
        }

        if (results[2]) {
          this.listeLangue = results[2] as ReferenceDTO[];
        }

        if (results[3]) {
          this.typeEquipementCommOptions = FusionUtils.creerInputOptionsFromReferences(results[3] as ReferenceDTO[], this.inputOptionSelectionnez);
        }

        if (results[4]) {
          this.typeCoordonneeCommOptions = FusionUtils.creerInputOptionsFromReferences(results[4] as ReferenceDTO[], this.inputOptionSelectionnez);
        }

        if (results[5]) {
          this.typeLieuResidenceOptions = FusionUtils.creerInputOptionsFromReferences(results[5] as ReferenceDTO[], this.inputOptionSelectionnez);
        }

        this.isReferencesChargees = true;

        return;
      })
      );
    }
    return of(void 0);
  }

  /**
   * Initialisation de la barre de bouton horizontale.
   */
  private initTopBar() {
    let topBarActions: Action[] = [];

    let topBarActionFusionner: Action = {
      label: this.translateService.instant("sigct.usager.fusion.btnfusionner"),
      actionFunction: this.actionFusionner,
      compId: 'btn-fusionner',
      extraClass: "btn-primary"
    };
    topBarActions.push(topBarActionFusionner);

    let topBarActionAnnuler: Action = {
      label: this.translateService.instant("sigct.usager.fusion.btnannuler"),
      actionFunction: this.actionAnnuler,
      compId: 'btn-annuler',
      extraClass: "btn-default"
    };
    topBarActions.push(topBarActionAnnuler);

    let topBarActionRetour: Action = {
      tooltip: this.translateService.instant("sigct.usager.fusion.btnrevenirinfobulle"),
      actionFunction: this.actionRetourRecherche,
      icon: "fa fa-times fa-lg",
      compId: 'btn-retour-recherche',
      extraClass: "btn-default"
    };
    topBarActions.push(topBarActionRetour);

    this.formTopBarOptions = {
      title: { icon: "fa fa fa-compress fa-lg" },
      actions: topBarActions
    };
  }

  /**
   * Récupère les données de l'usager 1.
   */
  private initUsager1() {
    if (this.idUsager1) {
      // Récupère l'usager1
      this.subscriptions.add(
        forkJoin(
          [this.usagerService.getUsager(this.idUsager1),                    // 0
          this.utilitaireService.listUsagerCommunications(this.idUsager1),  // 1
          this.utilitaireService.getAllUsagerLieuResidences(this.idUsager1) // 2
          ]).subscribe((results) => {
            if (results[0]) {
              this.usager1Dto = results[0] as UsagerFusionDTO;
              this.usager1Dto.expiration = this.formaterExpiration(this.usager1Dto.anneeExpr, this.usager1Dto.moisExpr);
              this.usager1Dto.nomPrenomMere = this.formaterNomPrenom(this.usager1Dto.prenomMere, this.usager1Dto.nomMere);
              this.usager1Dto.nomPrenomPere = this.formaterNomPrenom(this.usager1Dto.prenomPere, this.usager1Dto.nomPere);
              this.usager1Dto.malentendantTxt = this.usager1Dto.malentendant != null ? String(this.usager1Dto.malentendant) : null;
              this.usager1Dto.doublonPotentielTxt = this.usager1Dto.doublonPotentiel != null ? String(this.usager1Dto.doublonPotentiel) : null;
            }

            if (results[1]) {
              // Récupère la liste des communications de l'usager.
              this.listeCommunicationUsager1 = results[1] as UsagerCommDTO[];
            }

            if (results[2]) {
              // Récupère la liste des lieux de résidence de l'usager.
              this.listeLieuResidenceUsager1 = results[2] as UsagerLieuResidenceDTO[];
            }

            this.peuplerListesDeroulantes();
            this.peuplerUsagerFusionDto();
            this.validerChargementInitial();
          })
      );
    } else {
      // Vide l'usager 1
      this.usager1Dto = null;

      this.peuplerListesDeroulantes();
      this.peuplerUsagerFusionDto();
    }
  }

  /**
   * Récupère les données de l'usager 2.
   */
  private initUsager2(): void {
    if (this.idUsager2) {
      // Populer l'usager1
      this.subscriptions.add(
        forkJoin(
          [this.usagerService.getUsager(this.idUsager2),                    // 0
          this.utilitaireService.listUsagerCommunications(this.idUsager2),  // 1
          this.utilitaireService.getAllUsagerLieuResidences(this.idUsager2) // 2
          ]).subscribe((results) => {
            if (results[0]) {
              this.usager2Dto = results[0] as UsagerFusionDTO;
              this.usager2Dto.expiration = this.formaterExpiration(this.usager2Dto.anneeExpr, this.usager2Dto.moisExpr);
              this.usager2Dto.nomPrenomMere = this.formaterNomPrenom(this.usager2Dto.prenomMere, this.usager2Dto.nomMere);
              this.usager2Dto.nomPrenomPere = this.formaterNomPrenom(this.usager2Dto.prenomPere, this.usager2Dto.nomPere);
              this.usager2Dto.malentendantTxt = this.usager2Dto.malentendant != null ? String(this.usager2Dto.malentendant) : null;
              this.usager2Dto.doublonPotentielTxt = this.usager2Dto.doublonPotentiel != null ? String(this.usager2Dto.doublonPotentiel) : null;
            }

            if (results[1]) {
              // Récupère la liste des communications de l'usager.
              this.listeCommunicationUsager2 = results[1] as UsagerCommDTO[];
            }

            if (results[2]) {
              // Récupère la liste des lieux de résidence de l'usager.
              this.listeLieuResidenceUsager2 = results[2] as UsagerLieuResidenceDTO[];
            }

            this.peuplerListesDeroulantes();
            this.peuplerUsagerFusionDto();
            this.validerChargementInitial();
          })
      );
    } else {
      // Vide l'usager 2
      this.usager2Dto = null;

      this.peuplerListesDeroulantes();
      this.peuplerUsagerFusionDto();
    }
  }

  private resetErreurs(): void {
    this.alertStore.resetAlert();

    this.isNomValide = true;
    this.isPrenomValide = true;
    this.isDtNaissValide = true;
    this.isSexeValide = true;
    this.isDetailValide = true;

    this.isNamValide = true;
    this.isExpirationValide = true;
    this.isLangueValide = true;
    this.isMalentendantValide = true;
    this.isNomPrenomMereValide = true;
    this.isNomPrenomPereValide = true;
    this.isDoublonPotentielValide = true;

    this.fusionCommunicationsUsagerComponent.resetErreurs();
    this.fusionLieuxResidenceUsagerComponent.resetErreurs();
  }

  /**
   * Avise le parent qu'on désire fusionner les usagers
   */
  actionFusionner = (): void => {
    this.resetErreurs();

    this.subscriptions.add(
      // Lance la validation de la fusion
      this.validerFusion().subscribe((result: boolean) => {
        if (result) {
          // La fusion est valide, on sauvegarde
          this.sauvegarderUsagerFusion();
        }
      })
    );
  }

  /**
   * Annule les modifications et recharge les données
   */
  actionAnnuler = (): void => {
    this.resetErreurs();

    this.dateDebutFusion = new Date();

    this.initUsager1();
    this.initUsager2();
  }

  /**
   * Avise le parent qu'on désire retourner à la recherche.
   */
  actionRetourRecherche = (): void => {
    this.retourRecherche.emit();
  }

  /**
   * Met le focus sur le premier élément.
   */
  focusFirstElement(): void {
    // Met le focus sur le bouton Fusionner car il y a un problème à le mettre sur le premier chosen actif.
    const element = document.querySelector('#btn-fusionner');
    if (element instanceof HTMLElement) {
      element.focus();
    }
  }

  /**
   * Lorsque l'utilisateur clique sur la case à cocher du détail de l'usager 1, copie le détail dans la fusion.
   * @param event
   */
  onUsager1DetailClick(event: MatCheckboxChange): void {
    this.usagerFusionDto.detail = "";

    if (this.usager2DetailChecked) {
      this.usagerFusionDto.detail = this.usager2Dto.detail;
    }

    if (event.checked) {
      if (this.usagerFusionDto.detail) {
        this.usagerFusionDto.detail += " ";
      }
      const detail: string = this.usagerFusionDto.detail + this.usager1Dto.detail;
      if (detail.length > MAX_LENGTH_DETAIL) {
        // La limite de {{0}} caractères est dépassée. Les informations au-delà de la limite permise seront perdues.
        const msg = this.translateService.instant("us-iu-a30002", { 0: MAX_LENGTH_DETAIL });
        this.subscriptions.add(
          this.materialModalDialogService.popupAvertissement(msg, "185px").subscribe()
        );
      }
      this.usagerFusionDto.detail = detail.substr(0, MAX_LENGTH_DETAIL);
    }

    this.isDetailValide = (this.usagerFusionDto.detail != null);
  }

  /**
   * Lorsque l'utilisateur clique sur la case à cocher du détail de l'usager 2, copie le détail dans la fusion.
   * @param event
   */
  onUsager2DetailClick(event: MatCheckboxChange): void {
    this.usagerFusionDto.detail = "";

    if (this.usager1DetailChecked) {
      this.usagerFusionDto.detail = this.usager1Dto.detail;
    }

    if (event.checked) {
      if (this.usagerFusionDto.detail) {
        this.usagerFusionDto.detail += " ";
      }
      const detail: string = this.usagerFusionDto.detail + this.usager2Dto.detail;
      if (detail.length > MAX_LENGTH_DETAIL) {
        // La limite de {{0}} caractères est dépassée. Les informations au-delà de la limite permise seront perdues.
        const msg = this.translateService.instant("us-iu-a30002", { 0: MAX_LENGTH_DETAIL });
        this.subscriptions.add(
          this.materialModalDialogService.popupAvertissement(msg, "185px").subscribe()
        );
      }
      this.usagerFusionDto.detail = detail.substr(0, MAX_LENGTH_DETAIL);
    }

    this.isDetailValide = (this.usagerFusionDto.detail != null);
  }

  /**
   * Formate l'expiration du NAM est concaténant l'annnée d'expiration avec le mois d'expiration.
   * @param anneeExpr
   * @param moisExpr
   * @returns
   */
  private formaterExpiration(anneeExpr: number, moisExpr: number): string {
    let expiration: string = null;

    if (anneeExpr) {
      expiration = "" + anneeExpr;
    }

    if (moisExpr) {
      if (expiration) {
        expiration += "-";
      }
      expiration += formatNumber(moisExpr, "fr-CA", "2.0-0");
    }

    return expiration;
  }

  /**
   * Formate un NAM provenant de la bd en ajoutant des tirets à tous les 4 caractères.
   * Ex: LAFC69122200  --> LAFC-6912-2200
   */
  private formaterNam(nam: string): string {
    let frmtNam: string = null;

    if (nam) {
      if (nam.length < 5) {
        frmtNam = nam.substring(0, 4)
      } else if (nam.length < 9) {
        frmtNam = nam.substring(0, 4) + "-" + nam.substring(4, 8)
      } else {
        frmtNam = nam.substring(0, 4) + "-" + nam.substring(4, 8) + "-" + nam.substring(8);
      }
    }

    return frmtNam;
  }

  /**
   * Formate le nom et le prénom en concaténant le nom suivi du prénom.
   * @param prenom
   * @param nom
   * @returns
   */
  private formaterNomPrenom(prenom: string, nom: string): string {
    let nomPrenom: string = "";

    if (nom) {
      nomPrenom = nom;
    }

    if (prenom) {
      if (nomPrenom) {
        nomPrenom += ", ";
      }
      nomPrenom += prenom;
    }

    return nomPrenom ? nomPrenom : null;
  }

  /**
   * Récupère l'usager fusionné.
   * @returns
   */
  private getUsagerFusionDto(): UsagerFusionDTO {
    if (!this.usagerFusionDto) {
      return null;
    }

    this.usagerFusionDto.dateDebutFusion = this.dateDebutFusion;

    if (this.usagerFusionDto.expiration) {
      if (this.usagerFusionDto.expiration == this.usager1Dto.expiration) {
        this.usagerFusionDto.anneeExpr = this.usager1Dto.anneeExpr;
        this.usagerFusionDto.moisExpr = this.usager1Dto.moisExpr;
      } else if (this.usagerFusionDto.expiration == this.usager2Dto.expiration) {
        this.usagerFusionDto.anneeExpr = this.usager2Dto.anneeExpr;
        this.usagerFusionDto.moisExpr = this.usager2Dto.moisExpr;
      }
    }

    if (this.usagerFusionDto.nomPrenomMere) {
      if (this.usagerFusionDto.nomPrenomMere == this.usager1Dto.nomPrenomMere) {
        this.usagerFusionDto.nomMere = this.usager1Dto.nomMere;
        this.usagerFusionDto.prenomMere = this.usager1Dto.prenomMere;
      } else if (this.usagerFusionDto.nomPrenomMere == this.usager2Dto.nomPrenomMere) {
        this.usagerFusionDto.nomMere = this.usager2Dto.nomMere;
        this.usagerFusionDto.prenomMere = this.usager2Dto.prenomMere;
      }
    }

    if (this.usagerFusionDto.nomPrenomPere) {
      if (this.usagerFusionDto.nomPrenomPere == this.usager1Dto.nomPrenomPere) {
        this.usagerFusionDto.nomPere = this.usager1Dto.nomPere;
        this.usagerFusionDto.prenomPere = this.usager1Dto.prenomPere;
      } else if (this.usagerFusionDto.nomPrenomPere == this.usager2Dto.nomPrenomPere) {
        this.usagerFusionDto.nomPere = this.usager2Dto.nomPere;
        this.usagerFusionDto.prenomPere = this.usager2Dto.prenomPere;
      }
    }

    this.usagerFusionDto.malentendant = StringUtils.isBlank(this.usagerFusionDto.malentendantTxt) ? null : this.usagerFusionDto.malentendantTxt === "true";
    this.usagerFusionDto.doublonPotentiel = StringUtils.isBlank(this.usagerFusionDto.doublonPotentielTxt) ? null : this.usagerFusionDto.doublonPotentielTxt === "true";

    this.usagerFusionDto.listeCommunication = this.fusionCommunicationsUsagerComponent.getListeCommFusionnes();
    this.usagerFusionDto.listeLieuResidence = this.fusionLieuxResidenceUsagerComponent.getListeLieuResFusionnes();

    this.usagerFusionDto.niveauIdent = UsagerUtils.calculerNiveauIdent(this.usagerFusionDto, this.usagerFusionDto.listeCommunication, this.usagerFusionDto.listeLieuResidence);

    return this.usagerFusionDto;
  }

  /**
   * Peuple l'usager fusionné en fusionnant les données de usager1 et usager2.
   */
  private peuplerUsagerFusionDto(): void {
    this.usagerFusionDto = new UsagerFusionDTO();

    if (this.usager1Dto && this.usager2Dto) {
      this.usagerFusionDto.idSource1 = this.usager1Dto.id;
      this.usagerFusionDto.idSource2 = this.usager2Dto.id;

      // Identification
      this.usagerFusionDto.nom = FusionUtils.equalsOuUnique(this.usager1Dto.nom, this.usager2Dto.nom);
      this.usagerFusionDto.prenom = FusionUtils.equalsOuUnique(this.usager1Dto.prenom, this.usager2Dto.prenom);
      this.usagerFusionDto.dtNaiss = FusionUtils.equalsOuUnique(this.usager1Dto.dtNaiss, this.usager2Dto.dtNaiss);
      this.usagerFusionDto.sexeCode = FusionUtils.equalsOuUnique(this.usager1Dto.sexeCode, this.usager2Dto.sexeCode);
      this.usagerFusionDto.detail = FusionUtils.equalsOuUnique(this.usager1Dto.detail, this.usager2Dto.detail);

      // Informations supplémentaires
      this.usagerFusionDto.nam = FusionUtils.equalsOuUnique(this.usager1Dto.nam, this.usager2Dto.nam);
      this.usagerFusionDto.expiration = FusionUtils.equalsOuUnique(this.usager1Dto.expiration, this.usager2Dto.expiration);
      this.usagerFusionDto.langueCode = FusionUtils.equalsOuUnique(this.usager1Dto.langueCode, this.usager2Dto.langueCode);
      this.usagerFusionDto.malentendantTxt = FusionUtils.equalsOuUnique(this.usager1Dto.malentendantTxt, this.usager2Dto.malentendantTxt);
      this.usagerFusionDto.nomPrenomMere = FusionUtils.equalsOuUnique(this.usager1Dto.nomPrenomMere, this.usager2Dto.nomPrenomMere);
      this.usagerFusionDto.nomPrenomPere = FusionUtils.equalsOuUnique(this.usager1Dto.nomPrenomPere, this.usager2Dto.nomPrenomPere);
      this.usagerFusionDto.doublonPotentielTxt = FusionUtils.equalsOuUnique(this.usager1Dto.doublonPotentielTxt, this.usager2Dto.doublonPotentielTxt);
    }
  }

  /**
   * Peuple le contenu des listes déroulantes avec les données de usager1 et usager2.
   */
  private peuplerListesDeroulantes(): void {
    this.nomOptions.options = [];
    this.prenomOptions.options = [];
    this.dtNaissOptions.options = [];
    this.namOptions.options = [];
    this.nomPrenomMereOptions.options = [];
    this.nomPrenomPereOptions.options = [];

    if (this.usager1Dto && this.usager2Dto) {
      // Identification
      this.nomOptions.options = FusionUtils.creerInputOptionsFromValues(this.usager1Dto.nom, this.usager2Dto.nom, this.inputOptionSelectionnez);
      this.prenomOptions.options = FusionUtils.creerInputOptionsFromValues(this.usager1Dto.prenom, this.usager2Dto.prenom, this.inputOptionSelectionnez);
      this.dtNaissOptions.options = FusionUtils.creerInputOptionsFromValues(this.usager1Dto.dtNaiss, this.usager2Dto.dtNaiss, this.inputOptionSelectionnez);
      this.sexeOptions.options = FusionUtils.creerInputOptionsFromRefCodes(this.usager1Dto.sexeCode, this.usager2Dto.sexeCode, this.listeSexe, this.inputOptionSelectionnez);

      // Informations supplémentaires
      this.namOptions.options = FusionUtils.creerInputOptionsFromValuesEtLibelles(this.usager1Dto.nam, this.formaterNam(this.usager1Dto.nam), this.usager2Dto.nam, this.formaterNam(this.usager2Dto.nam), this.inputOptionSelectionnez);
      this.expirationOptions.options = FusionUtils.creerInputOptionsFromValues(this.usager1Dto.expiration, this.usager2Dto.expiration, this.inputOptionSelectionnez);
      this.langueOptions.options = FusionUtils.creerInputOptionsFromRefCodes(this.usager1Dto.langueCode, this.usager2Dto.langueCode, this.listeLangue, this.inputOptionSelectionnez);
      this.nomPrenomMereOptions.options = FusionUtils.creerInputOptionsFromValues(this.usager1Dto.nomPrenomMere, this.usager2Dto.nomPrenomMere, this.inputOptionSelectionnez);
      this.nomPrenomPereOptions.options = FusionUtils.creerInputOptionsFromValues(this.usager1Dto.nomPrenomPere, this.usager2Dto.nomPrenomPere, this.inputOptionSelectionnez);
    }
  }

  /**
   * Sauvegarde dans la BD l'usager résultant de la fusion.
   */
  private sauvegarderUsagerFusion(): void {
    const usagerFusionDto: UsagerFusionDTO = this.getUsagerFusionDto();

    this.subscriptions.add(
      this.usagerFusionApiService.sauvegarderUsagerFusion(usagerFusionDto).subscribe((usagerIdent: UsagerDTO) => {

        // Remplace l'id des usagers sources dans SA_USAGER et SO_USAGER par l'id de la fusion.
        this.subscriptions.add(
          this.updateSaSoUsager(usagerFusionDto.idSource1, usagerFusionDto.idSource2, usagerIdent.id).subscribe(result => {
            // Retire les usagers fusionnés du storage.
            sessionStorage.removeItem(USAGERS_FUSION_STORAGE_ID);

            this.subscriptions.add(this.usagerService.solrIndexUsagers([usagerIdent.id]).subscribe(rs => {
              // Goto consultation de l'usager fusionner.
              this.router.navigate([usagerIdent.id, "consulter"]);
            }));
          })
        );
      })
    );
  }

  /**
   * Remplace l'id des usagers sources dans SA_USAGER et SO_USAGER par l'id de la fusion.
   * @param idUsagerIdentSource1
   * @param idUsagerIdentSource2
   * @param idUsagerIdentFusion
   * @returns
   */
  private updateSaSoUsager(idUsagerIdentSource1: number, idUsagerIdentSource2: number, idUsagerIdentFusion: number): Observable<void> {
    return forkJoin([
      this.usagerFusionApiService.updateUsagersFusionSante(idUsagerIdentSource1, idUsagerIdentSource2, idUsagerIdentFusion),
      this.usagerFusionApiService.updateUsagersFusionSocial(idUsagerIdentSource1, idUsagerIdentSource2, idUsagerIdentFusion)]).pipe(map(results => {
        return;
      }));
  }

  /**
   * Effectue une validation après le chargement initial pour vérifier le contenu des usagers à fusionner.
   * Un message d'avertissement est affiché si la validation échoue.
   */
  private validerChargementInitial(): void {
    this.alertStore.resetAlert();

    if (this.usager1Dto && this.usager2Dto) {
      // Vérifie si le nom, prénom, date de naissance et le sexe des 2 usagers sont identiques.
      let usagersIdentiques: boolean = (this.usager1Dto.nom == this.usager2Dto.nom &&
        this.usager1Dto.prenom == this.usager2Dto.prenom &&
        this.usager1Dto.dtNaiss == this.usager2Dto.dtNaiss &&
        this.usager1Dto.sexeCode == this.usager2Dto.sexeCode);

      if (usagersIdentiques) {
        usagersIdentiques = this.listeCommunicationUsager1.some((usagerComm1Dto: UsagerCommDTO) => {
          let coordSansPoste1: string = usagerComm1Dto.coordonnees?.split("#")[0];

          return this.listeCommunicationUsager2.some((usagerComm2Dto: UsagerCommDTO) => {
            let coordSansPoste2: string = usagerComm2Dto.coordonnees?.split("#")[0];

            if (coordSansPoste1 == coordSansPoste2) {
              return true;
            }
          });
        });
      }

      if (!usagersIdentiques) {
        // Certaines informations des usagers que vous désirez fusionner parmi le nom, le prénom, la date de naissance,
        // le sexe et les communications ne sont pas identiques.
        const messages: string[] = [this.translateService.instant("us-iu-a30004")]
        const alertTitle: string = this.translateService.instant("usager.msg.avertissement");
        const alertModel: AlertModel = AlertModelUtils.createAlertModel(messages, alertTitle, AlertType.WARNING);
        this.alertStore.addAlert(alertModel);
      }
    }
  }

  /**
   * Effectue les validations avant de sauvegarder la fusion.
   * @returns dans un Observable: true si tout est valide ou false si non valide
   */
  private validerFusion(): Observable<boolean> {
    return forkJoin([
      this.keepAliveService.keepAliveSante$().pipe(map(() => true), catchError(error => of(false))),  // 0
      this.keepAliveService.keepAliveSocial$().pipe(map(() => true), catchError(error => of(false))), // 1
      this.validerUsagersNonModifies(this.idUsager1, this.idUsager2), // 2
      this.validerUsagerNonLieFicheAppelOuverte(this.idUsager1),      // 3
      this.validerUsagerNonLieFicheAppelOuverte(this.idUsager2)       // 4
    ]).pipe(concatMap(results => {
      if (results[0] === false || results[1] === false) {
        // Impossible de fusionner les usagers car Info-Santé ou Info-Social n'est pas disponible présentement.
        // Veuillez vous assurer que les services soient fonctionnels avant de recommencer la fusion.
        const messages: string[] = [this.translateService.instant("us-iu-e30011")]
        const alertTitle: string = this.translateService.instant("usager.msg.erreur");
        const alertModel: AlertModel = AlertModelUtils.createAlertModel(messages, alertTitle, AlertType.ERROR);
        this.alertStore.addAlert(alertModel);

        return of(false);
      }

      if (results[2] === false) {
        // Impossible de fusionner les usagers car des informations ont été modifiées pendant la fusion.
        // Veuillez retourner dans la recherche d'usagers et recommencer.
        const messages: string[] = [this.translateService.instant("us-iu-e30012")]
        const alertTitle: string = this.translateService.instant("girpi.error.label");
        const alertModel: AlertModel = AlertModelUtils.createAlertModel(messages, alertTitle, AlertType.ERROR);
        this.alertStore.addAlert(alertModel);
        return of(false);
      }

      if (results[3] === false || results[4] === false) {
        if (results[3] === false) {
          // Impossible de fusionner car l'usager {{0}} est présentement relié à une fiche en cours.
          // Veuillez retourner dans la recherche d'usagers et recommencer plus tard.
          const messages: string[] = [this.translateService.instant("us-iu-e30010", { 0: "#" + this.idUsager1 })]
          const alertTitle: string = this.translateService.instant("girpi.error.label");
          const alertModel: AlertModel = AlertModelUtils.createAlertModel(messages, alertTitle, AlertType.ERROR);
          this.alertStore.addAlert(alertModel);
        }

        if (results[4] === false) {
          // Impossible de fusionner car l'usager {{0}} est présentement relié à une fiche en cours.
          // Veuillez retourner dans la recherche d'usagers et recommencer plus tard.
          const messages: string[] = [this.translateService.instant("us-iu-e30010", { 0: "#" + this.idUsager2 })]
          const alertTitle: string = this.translateService.instant("girpi.error.label");
          const alertModel: AlertModel = AlertModelUtils.createAlertModel(messages, alertTitle, AlertType.ERROR);
          this.alertStore.addAlert(alertModel);
        }
        return of(false);
      }

      const identificationValide: boolean = this.validerIdentificationUsager();
      const infoSuppValide: boolean = this.validerInformationsSupplementaires();
      const communictaionsValide: boolean = this.fusionCommunicationsUsagerComponent.validerCommFusionnes();
      const lieuxResidenceValide: boolean = this.fusionLieuxResidenceUsagerComponent.validerLieuxResidenceFusionnes();

      if (identificationValide && infoSuppValide && communictaionsValide && lieuxResidenceValide) {
        // Vérifie s'il y a des communications supprimées.
        if (this.fusionCommunicationsUsagerComponent.containsCommVides()) {
          // us-iu-c30000=Suppression d'une ou plusieurs communications.
          return this.materialModalDialogService.popupConfirmer("us-iu-c30000").pipe(concatMap((result: boolean) => {
            if (result) {
              // Vérifie s'il y a des lieux de résidence de supprimées.
              if (this.fusionLieuxResidenceUsagerComponent.containsLieuxResidenceVides()) {
                // us-iu-c30001=Suppression d'une ou plusieurs adresses.
                return this.materialModalDialogService.popupConfirmer("us-iu-c30001").pipe(map((result: boolean) => {
                  return result;
                }));
              } else {
                return of(true);
              }
            } else {
              return of(false);
            }
          }));
        } else {
          // Vérifie s'il y a des lieux de résidence de supprimées.
          if (this.fusionLieuxResidenceUsagerComponent.containsLieuxResidenceVides()) {
            // us-iu-c30001=Suppression d'une ou plusieurs adresses.
            return this.materialModalDialogService.popupConfirmer("us-iu-c30001").pipe(map((result: boolean) => {
              return result;
            }));
          } else {
            return of(true);
          }
        }
      } else {
        return of(false);
      }
    }));
  }

  /**
   * Valide la section Identification de l'usager.
   * @returns
   */
  private validerIdentificationUsager(): boolean {
    this.isNomValide = true;
    this.isPrenomValide = true;
    this.isDtNaissValide = true;
    this.isSexeValide = true;
    this.isDetailValide = true;

    let messages: string[] = [];

    if (!this.usagerFusionDto.nom && (this.usager1Dto.nom || this.usager2Dto.nom)) {
      this.isNomValide = false;
      const champ: string = this.translateService.instant("sigct.usager.fusion.nom");
      const msg: string = this.translateService.instant("general.msg.obligatoire", { 0: champ });
      messages.push(msg);
    }

    if (!this.usagerFusionDto.prenom && (this.usager1Dto.prenom || this.usager2Dto.prenom)) {
      this.isPrenomValide = false;
      const champ: string = this.translateService.instant("sigct.usager.fusion.prenom");
      const msg: string = this.translateService.instant("general.msg.obligatoire", { 0: champ });
      messages.push(msg);
    }

    if (!this.usagerFusionDto.dtNaiss && (this.usager1Dto.dtNaiss || this.usager2Dto.dtNaiss)) {
      this.isDtNaissValide = false;
      const champ: string = this.translateService.instant("sigct.usager.fusion.dtnaiss");
      const msg: string = this.translateService.instant("general.msg.obligatoire", { 0: champ });
      messages.push(msg);
    }

    if (!this.usagerFusionDto.sexeCode && (this.usager1Dto.sexeCode || this.usager2Dto.sexeCode)) {
      this.isSexeValide = false;
      const champ: string = this.translateService.instant("sigct.usager.fusion.sexe");
      const msg: string = this.translateService.instant("general.msg.obligatoire", { 0: champ });
      messages.push(msg);
    }

    if (!this.usagerFusionDto.detail && (this.usager1Dto.detail || this.usager2Dto.detail)) {
      this.isDetailValide = false;
      const champ: string = this.translateService.instant("sigct.usager.fusion.details");
      const msg: string = this.translateService.instant("general.msg.obligatoire", { 0: champ });
      messages.push(msg);
    }

    if (messages.length > 0) {
      const alertTitle: string = this.translateService.instant("girpi.error.label");
      const alertModel: AlertModel = AlertModelUtils.createAlertModel(messages, alertTitle, AlertType.ERROR);
      this.alertStore.addAlert(alertModel);
      return false;
    } else {
      return true;
    }
  }

  /**
   * Valide la section Informations supplémentaires.
   * @returns
   */
  private validerInformationsSupplementaires(): boolean {
    this.isNamValide = true;
    this.isExpirationValide = true;
    this.isLangueValide = true;
    this.isMalentendantValide = true;
    this.isNomPrenomMereValide = true;
    this.isNomPrenomPereValide = true;
    this.isDoublonPotentielValide = true;

    let messages: string[] = [];

    if (!this.usagerFusionDto.nam && (this.usager1Dto.nam || this.usager2Dto.nam)) {
      this.isNamValide = false;
      const champ: string = this.translateService.instant("sigct.usager.fusion.nam");
      const msg: string = this.translateService.instant("general.msg.obligatoire", { 0: champ });
      messages.push(msg);
    }

    if (!this.usagerFusionDto.expiration && (this.usager1Dto.expiration || this.usager2Dto.expiration)) {
      this.isExpirationValide = false;
      const champ: string = this.translateService.instant("sigct.usager.fusion.expiration");
      const msg: string = this.translateService.instant("general.msg.obligatoire", { 0: champ });
      messages.push(msg);
    }

    if (!this.usagerFusionDto.langueCode && (this.usager1Dto.langueCode || this.usager2Dto.langueCode)) {
      this.isLangueValide = false;
      const champ: string = this.translateService.instant("sigct.usager.fusion.langueusage");
      const msg: string = this.translateService.instant("general.msg.obligatoire", { 0: champ });
      messages.push(msg);
    }

    if (!this.usagerFusionDto.malentendantTxt && (this.usager1Dto.malentendantTxt || this.usager2Dto.malentendantTxt)) {
      this.isMalentendantValide = false;
      const champ: string = this.translateService.instant("sigct.usager.fusion.malentendant");
      const msg: string = this.translateService.instant("general.msg.obligatoire", { 0: champ });
      messages.push(msg);
    }

    if (!this.usagerFusionDto.nomPrenomMere && (this.usager1Dto.nomPrenomMere || this.usager2Dto.nomPrenomMere)) {
      this.isNomPrenomMereValide = false;
      const champ: string = this.translateService.instant("sigct.usager.fusion.nommere");
      const msg: string = this.translateService.instant("general.msg.obligatoire", { 0: champ });
      messages.push(msg);
    }

    if (!this.usagerFusionDto.nomPrenomPere && (this.usager1Dto.nomPrenomPere || this.usager2Dto.nomPrenomPere)) {
      this.isNomPrenomPereValide = false;
      const champ: string = this.translateService.instant("sigct.usager.fusion.nompere");
      const msg: string = this.translateService.instant("general.msg.obligatoire", { 0: champ });
      messages.push(msg);
    }

    if (!this.usagerFusionDto.doublonPotentielTxt && (this.usager1Dto.doublonPotentielTxt || this.usager2Dto.doublonPotentielTxt)) {
      this.isDoublonPotentielValide = false;
      const champ: string = this.translateService.instant("sigct.usager.fusion.doublonpot");
      const msg: string = this.translateService.instant("general.msg.obligatoire", { 0: champ });
      messages.push(msg);
    }

    if (messages.length > 0) {
      const alertTitle: string = this.translateService.instant("girpi.error.label");
      const alertModel: AlertModel = AlertModelUtils.createAlertModel(messages, alertTitle, AlertType.ERROR);
      this.alertStore.addAlert(alertModel);
      return false;
    } else {
      return true;
    }
  }

  /**
   * Vérifie si les usagers 1 et 2 n'ont pas été modifié pendant la comparaison.
   * @param idUsager1
   * @param idUsager2
   * @returns
   */
  private validerUsagersNonModifies(idUsager1: number, idUsager2: number): Observable<boolean> {
    return forkJoin([
      this.usagerService.getDateDerniereModifUsager(idUsager1),
      this.usagerService.getDateDerniereModifUsager(idUsager2)]).pipe(
        map(results => {
          if (results[0] && results[1]) {
            const dateDernModifUsager1: Date = typeof results[0] == "number" ? new Date(results[0]) : results[0] as Date;
            const dateDernModifUsager2: Date = typeof results[1] == "number" ? new Date(results[1]) : results[1] as Date;

            return dateDernModifUsager1 < this.dateDebutFusion && dateDernModifUsager2 < this.dateDebutFusion;
          }
          return true;
        })
      );
  }

  /**
   * Vérifie si l'usager n'a pas été lié à une fiche d'appel pendant la comparaison.
   * @param idUsager
   * @returns
   */
  private validerUsagerNonLieFicheAppelOuverte(idUsager: number): Observable<boolean> {
    return this.usagerFusionApiService.getNombreFicheAppelOuverteByIdUsagerIdent(idUsager).pipe(
      map((nbFiche: number) => {
        return nbFiche == 0;
      })
    );
  }
}
