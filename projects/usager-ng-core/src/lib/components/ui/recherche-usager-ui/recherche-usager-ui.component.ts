import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { MaterialModalDialogService } from 'projects/sigct-service-ng-lib/src/lib/material-modal-dialog/material-modal-dialogl.service';
import { FacetDoublonUsagerEnum } from 'projects/sigct-service-ng-lib/src/lib/models/facet-doublon-usager.enum';
import { InfoAppelCtiDTO } from 'projects/sigct-service-ng-lib/src/lib/models/info-appel-cti-dto';
import { CriteresUsagerDTO } from 'projects/sigct-service-ng-lib/src/lib/models/recherche-fiche-appel-criteres-dto';
import { AppContext, AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import TelephoneUtils from 'projects/sigct-service-ng-lib/src/lib/utils/telephone-utils';
import { TypeficheSelectioneService } from 'projects/sigct-ui-ng-lib/src/lib/components/grise-automatique-selon-type-intervention/grise-automatique-selon-type-intervention.component';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { RechercheUsagerCriteresComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/recherche-usager-criteres/recherche-usager-criteres.component';
import { CodePostalPipe } from 'projects/sigct-ui-ng-lib/src/lib/pipes/code-postal-pipe/code-postal.pipe';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { USAGERS_FUSION_STORAGE_ID } from 'projects/usager-ng-core/src/config';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { StatusEnregisrementEnum } from '../../../enums/status-enregistrements-enum';
import { BaseUsagerDTO } from '../../../models/base-usager-dto';
import { RechercheUsagerCritereDoublonDTO } from '../../../models/recherche-usager-critere-doublon-dto';
import { RechercheUsagerCritereDTO } from '../../../models/recherche-usager-critere-dto';
import { RechercheUsagerResultatDTO } from '../../../models/recherche-usager-resultat-dto';
import { ReferenceDTO } from '../../../models/reference-dto';
import { ResultatRechercheUsagerDTO } from '../../../models/resultat-recherche-usager-dto';
import { UsagerFusionApiService } from '../../../services/usager-fusion-api.service';
import { UsagerService } from '../../../services/usager.service';
import FusionUtils from '../../../utils/fusion-utils';

const NB_CAR_MIN_RECHERCHE: number = 2;
const NB_MAX_USAGER_FUSION: number = 2;
const NB_MAX_ROWS: number = 500;

interface DerniereRecherche {
  critereRecherche: RechercheUsagerCritereDTO;
  selectedRowIndex: number;
}




@Component({
  selector: 'app-recherche-usager-ui',
  templateUrl: './recherche-usager-ui.component.html',
  styleUrls: ['./recherche-usager-ui.component.css'],
  providers: [DatePipe, CodePostalPipe, ConfirmationDialogService]
})
export class RechercheUsagerUiComponent implements OnInit, OnDestroy, AfterViewInit {
  readonly statusEnregisrementActif: StatusEnregisrementEnum = StatusEnregisrementEnum.ACTIF;
  readonly statusEnregisrementInactif: StatusEnregisrementEnum = StatusEnregisrementEnum.INACTIF;

  isRelierUsagerVisible: boolean = false;

  displayedColumns: string[] = ['badgeSante', 'badgeSocial', 'nom', 'prenom', 'dtNaiss', 'sexeCode', 'communication', 'region',
    'codePostal', 'doublonPotentiel', 'actions'];
  data: RechercheUsagerResultatDTO[] = [];

  resultsLength: number = 0; // Correspond au nombre d'usager trouvé (le terme length correspond à la propriété de MatPaginator )
  isLoadingResults: boolean = true;
  isRateLimitReached: boolean = false;

  // Index de la ligne sélectionnée dans la section "Liste des doublons identifiés"
  selectedRowIndex: number = null;

  critereRecherche: RechercheUsagerCritereDTO;

  pageIndex: number = 0;
  pageLength: number = 0;
  pageSize: number = 100;

  listeUsagerFusion: RechercheUsagerResultatDTO[] = [];

  /** Contenu du tableau des doublons. */
  listeInfosDoublon: string[][];
  /** Colonnes affichées dans le tab;eau des doublons. */
  displayedColumnsDoublon: string[] = [];
  /** Indique si le tableau des doublons est affiché */
  displayListeInfosDoublon: boolean = false;

  private subscriptions: Subscription = new Subscription();

  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  @ViewChild("appCriteresRecherche", { static: true })
  appCriteresRecherche: RechercheUsagerCriteresComponent;

  @ViewChild("bottom", { static: true })
  bottomElement: ElementRef;

  //Listes de valeurs
  // public inputOptionPhonetic: InputOptionCollection = {
  //   name: "phonetic",
  //   options: [{ label: "Recherche phonétique", value: "true" }]
  // }

  public inputOptionDoublonPotentiel: InputOptionCollection = {
    name: "doublon-potentiel",
    options: []
  }

  public inputOptionMalentendant: InputOptionCollection = {
    name: "malentendant",
    options: []
  }

  public inputOptionLangue: InputOptionCollection = {
    name: "langue",
    options: []
  };

  public inputOptionSexe: InputOptionCollection = {
    name: "sexe",
    options: []
  };

  public inputOptionRegion: InputOptionCollection = {
    name: "region",
    options: []
  };

  public inputOptionChampDoublon: InputOptionCollection = {
    name: "champ-doublon",
    options: []
  };

  @Input()
  infoAppelCti: InfoAppelCtiDTO = null;

  @Input()
  fusionEnabled: boolean = false;

  /** Peuple la liste des langues */
  @Input("listeLangue")
  public set listeLangue(values: ReferenceDTO[]) {
    this.inputOptionLangue.options = [];

    this.subscriptions.add(
      this.translate.get("option.select.message").subscribe((libelle: string) => {
        if (this.inputOptionLangue.options[0] === undefined) {
          this.inputOptionLangue.options.push({ label: libelle, value: null });
        }

        if (values) {
          values.forEach(item => {
            this.inputOptionLangue.options.push({ label: item.nom, value: item.code });
          });
        }
      })
    );
  }

  /** Peuple la liste des sexes */
  @Input("listeSexe")
  public set listeSexe(values: ReferenceDTO[]) {
    this.inputOptionSexe.options = [];

    this.subscriptions.add(
      this.translate.get("option.select.message").subscribe((libelle: string) => {
        if (this.inputOptionSexe.options[0] === undefined) {
          this.inputOptionSexe.options.push({ label: libelle, value: null });
        }


        if (values) {
          values.forEach(item => {
            this.inputOptionSexe.options.push({ label: item.nom, value: item.code });
          });
        }
      })
    );
  }

  /** Peuple la liste des sexes */
  @Input("listeRegion")
  public set listeRegion(values: ReferenceDTO[]) {
    this.inputOptionRegion.options = [];

    this.subscriptions.add(
      this.translate.get("option.select.message").subscribe((libelle: string) => {
        if (this.inputOptionRegion.options[0] === undefined) {
          this.inputOptionRegion.options.push({ label: libelle, value: null });
        }

        if (values) {
          values.forEach(item => {
            if (item.code != "00") {
              this.inputOptionRegion.options.push({ label: item.nom, value: item.code });
            }
          });
        }
      })
    );
  }

  @Output()
  consulterEnregistrementsUsager: EventEmitter<number> = new EventEmitter();

  @Output("consulterUsager")
  consulterUsager: EventEmitter<number> = new EventEmitter();

  @Output("editerUsager")
  editerUsager: EventEmitter<number> = new EventEmitter();

  @Output("relierUsager")
  relierUsager: EventEmitter<BaseUsagerDTO> = new EventEmitter();

  @Output()
  fusionnerUsager: EventEmitter<number[]> = new EventEmitter();

  //**Constructeur */
  constructor(
    private usagerService: UsagerService,
    private usagerFusionApiService: UsagerFusionApiService,
    private codePostalPipe: CodePostalPipe,
    public datePipe: DatePipe,
    private changeDetectorRefs: ChangeDetectorRef,
    private modalConfirmService: ConfirmationDialogService,
    private materialModalDialogService: MaterialModalDialogService,
    private translate: TranslateService,
    private alertStore: AlertStore,
    private appContextStore: AppContextStore,
    private typeFiheSelectioneService: TypeficheSelectioneService,
    private translateService: TranslateService) {
  }

  /**
   * Initialisation de la page
   */
  ngOnInit() {
    // Récupère le contexte applicatif.
    this.subscriptions.add(
      this.appContextStore.state$.subscribe((appcontext: AppContext) => {
        this.isRelierUsagerVisible = appcontext.isContextAppel || appcontext.isContextCorrectionFicheAppel;
      })
    );

    // Lance la recherche au changement de page.
    this.subscriptions.add(
      this.paginator.page.subscribe(() => {
        this.critereRecherche.pageIndex = this.paginator.pageIndex;

        this.subscriptions.add(
          this.lancerRecherche(this.critereRecherche).subscribe()
        );
      })
    );


    this.subscriptions.add(
      // Récupère un libellé bidon pour s'assurer que le fichier des libellés est chargé avant de récupérer les vrais libellés.
      this.translate.get("bidon").subscribe(() => {
        this.inputOptionDoublonPotentiel.options = [{ label: this.translate.instant("usager.recherche.chkdoublpotentiel"), value: "false" }];
        this.inputOptionMalentendant.options = [{ label: this.translate.instant("usager.recherche.chkmalentendant"), value: "false" }];

        this.inputOptionChampDoublon.options = [
          { label: this.translate.instant("usager.recherche.infocommune.dtnaiss"), value: FacetDoublonUsagerEnum.DATE_NAISSANCE },
          { label: this.translate.instant("usager.recherche.infocommune.nom"), value: FacetDoublonUsagerEnum.NOM },
          { label: this.translate.instant("usager.recherche.infocommune.prenom"), value: FacetDoublonUsagerEnum.PRENOM },
          { label: this.translate.instant("usager.recherche.infocommune.sexe"), value: FacetDoublonUsagerEnum.SEXE },
          { label: this.translate.instant("usager.recherche.infocommune.langue"), value: FacetDoublonUsagerEnum.LANGUE },
          { label: this.translate.instant("usager.recherche.infocommune.nam"), value: FacetDoublonUsagerEnum.NAM },
          { label: this.translate.instant("usager.recherche.infocommune.comm"), value: FacetDoublonUsagerEnum.COMMUNICATION },
          { label: this.translate.instant("usager.recherche.infocommune.codepostal"), value: FacetDoublonUsagerEnum.CODE_POSTAL },
          { label: this.translate.instant("usager.recherche.infocommune.adresse"), value: FacetDoublonUsagerEnum.ADRESSE },
          { label: this.translate.instant("usager.recherche.infocommune.municipalite"), value: FacetDoublonUsagerEnum.MUNICIPALITE },
          { label: this.translate.instant("usager.recherche.infocommune.region"), value: FacetDoublonUsagerEnum.REGION },
          { label: this.translate.instant("usager.recherche.infocommune.nommere"), value: FacetDoublonUsagerEnum.NOM_MERE },
          { label: this.translate.instant("usager.recherche.infocommune.prenommere"), value: FacetDoublonUsagerEnum.PRENOM_MERE },
        ];

        this.paginator._intl.firstPageLabel = this.translate.instant('pagination.premierepage');
        this.paginator._intl.lastPageLabel = this.translate.instant('pagination.dernierepage');
      })
    );

    this.critereRecherche = new RechercheUsagerCritereDTO();

    this.appContextStore.setvalue('statusEnregistrementsUsager', StatusEnregisrementEnum.VIDE);

    this.initUsagersFusionFromStorage();
  }

  ngAfterViewInit(): void {
    // Positionne le focus sur le premier critère.
    this.appCriteresRecherche.resetFocus();
  }

  /**
   * Libérer le modèle.
   */
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public initRecherche(): void {
    // Extraction des critères de recherche
    const rechercher = localStorage.getItem("rechercher");

    if (rechercher) {
      //Assigner les critères de recherches
      const derniereRecherche: DerniereRecherche = JSON.parse(rechercher);

      if (derniereRecherche?.critereRecherche) {
        this.critereRecherche = { ...derniereRecherche.critereRecherche };

        this.paginator.pageIndex = this.critereRecherche.pageIndex;
        this.paginator.pageSize = this.critereRecherche.pageSize;
        this.paginator.length = this.critereRecherche.length;

        this.pageIndex = this.paginator.pageIndex;
        this.pageSize = this.paginator.pageSize;
        this.pageLength = this.paginator.length;

        this.sort.active = this.critereRecherche.colonneTri;
        if (this.critereRecherche.tri === "asc") {
          this.sort.direction = "asc";
        } else {
          this.sort.direction = "desc";
        }

        // Si la dernière recherche s'est faite avec des critères de recherche de doublons.
        if (this.critereRecherche.listeChampDoublon?.length > 0) {
          // Prend une copie des critères pour la 1ère recherche
          let critereRecherche1: RechercheUsagerCritereDTO = { ...derniereRecherche.critereRecherche };

          // La 1ère recherche ne doit pas contenir de critère sur les doublons, car on désire uniquement peupler
          // la section "Liste des doublons identifiés".
          critereRecherche1.critereDoublon = null;
          critereRecherche1.nbRows = 0;

          this.subscriptions.add(
            this.lancerRecherche(critereRecherche1).subscribe(() => {

              if (this.critereRecherche.critereDoublon) {
                // Prend une copie des critères pour la 2e recherche
                let critereRecherche2: RechercheUsagerCritereDTO = { ...derniereRecherche.critereRecherche };

                this.selectedRowIndex = derniereRecherche.selectedRowIndex;

                // La section "Liste des doublons identifiés" contient maintenant des données et des critères de recherche de doublons sont présents. 
                // On lance une 2e recherche comme si l'utilisateur sélectionnait un doublon pour filtrer les résultats.
                this.subscriptions.add(
                  this.lancerRecherche(critereRecherche2).subscribe(() => {
                    // Scroll au bas de la page
                    this.scrollToBottom();
                  })
                );
              }
            })
          );
        } else {
          this.subscriptions.add(
            this.lancerRecherche(this.critereRecherche).subscribe(() => {
            })
          );
        }
      }
    }
  }

  /**
   * Scroll au bas de la page.
   */
  private scrollToBottom() {
    this.bottomElement.nativeElement.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
  }

  /**
   *
   * @param afficher
   * @param type
   * @param direction
   */
  private tri(afficher: any, type: any, direction: string): any {

    afficher.sort(function (a, b) {
      let keyA = eval("a." + type),
        keyB = eval("b." + type);

      if (typeof keyA === "string") {
        if (keyA && keyB) {
          keyA = keyA.toLocaleLowerCase();
          keyB = keyB.toLocaleLowerCase();

          let res = keyA.localeCompare(keyB);

          return res;
        }
      }

      if (typeof keyA === "boolean") {
        return (keyA === keyB) ? 0 : keyB ? -1 : 1;
      }

      return -1;

    });


    //Les données affichées comme dans une file, donc les premières données seront affichée
    //à la fin si on n'applique pas un reverse.
    if (direction === "desc") {//asc

      afficher.reverse();

    }

    return afficher;//Trier;

  }


  /**
   * Trie le tableau de résultat.
   *
   * @param afficher
   * @param type
   */
  private trier(afficher: any, type: any): any {

    if (type === 'dtNaiss') {
      type = 'date_naissance';
      afficher = this.tri(afficher, type, this.sort.direction);
    }
    if (type === 'sexeCode') {
      type = 'sexe_code';
      afficher = this.tri(afficher, type, this.sort.direction);
    }
    if (type === 'communication') {
      type = 'communication_coordonnees_aff';
      afficher = this.tri(afficher, type, this.sort.direction);
    }
    if (type === 'region') {
      type = 'adresse_region_code_aff';
      afficher = this.tri(afficher, type, this.sort.direction);
    }
    if (type === 'codePostal') {
      type = 'adresse_code_postal_aff';
      afficher = this.tri(afficher, type, this.sort.direction);
    }
    if (type === 'nom') {
      afficher = this.tri(afficher, "nom", this.sort.direction);
    }
    if (type === 'prenom') {
      afficher = this.tri(afficher, "prenom", this.sort.direction);
    }
    if (type === 'doublonPotentiel') {
      afficher = this.tri(afficher, "doublon_potentiel", this.sort.direction);
    }

    return afficher;

  }

  /**
   * Permet de garder les crières de recherche dans la session.
   */
  private sauvegarderCriteres(derniereRecherche: DerniereRecherche) {
    localStorage.setItem("rechercher", JSON.stringify(derniereRecherche));
  }

  /**
   * Permet de garder les usagers à fusionner dans la session.
   */
  private usagersFusionToStorage() {
    sessionStorage.setItem(USAGERS_FUSION_STORAGE_ID, JSON.stringify(this.listeUsagerFusion));
  }

  /**
   * Permet de récupérer les usagers à fusionner de la session.
   */
  private initUsagersFusionFromStorage() {
    const usagersFusion: string = sessionStorage.getItem(USAGERS_FUSION_STORAGE_ID);

    if (usagersFusion) {
      this.listeUsagerFusion = JSON.parse(usagersFusion);
    } else {
      this.listeUsagerFusion = [];
    }
  }

  public getCriteresRecherche(): RechercheUsagerCritereDTO {
    const criteresUsagerDto: CriteresUsagerDTO = this.appCriteresRecherche.getCritereRecherche();
    const rechercheUsagerCritereDto: RechercheUsagerCritereDTO = {
      idUsagerIdent: criteresUsagerDto.idUsagerIdent,
      nom: criteresUsagerDto.nom,
      prenom: criteresUsagerDto.prenom,
      dateNaissance: criteresUsagerDto.dateNaissance,
      telephone: criteresUsagerDto.telephone,
      phonetique: criteresUsagerDto.phonetique,
      langueCode: criteresUsagerDto.langueCode,
      nam: criteresUsagerDto.nam,
      sexeCode: criteresUsagerDto.sexeCode,
      autreMoyenCommunication: criteresUsagerDto.autreMoyenCommunication,
      doublonPotentiel: criteresUsagerDto.doublonPotentiel,
      malentendant: criteresUsagerDto.malentendant,
      codePostal: criteresUsagerDto.codePostal,
      municipalite: criteresUsagerDto.municipalite,
      regionCode: criteresUsagerDto.regionCode,
      adresse: criteresUsagerDto.adresse,
      colonneTri: this.sort.active,
      tri: this.sort.direction.toString(),
      rechercheAvancee: criteresUsagerDto.rechercheAvancee,
      idRfGroupeAge: criteresUsagerDto.idRfGroupeAge,
      listeChampDoublon: criteresUsagerDto.listeChampDoublon,
      pageIndex: this.paginator.pageIndex,
      pageSize: this.paginator.pageSize,
      length: this.paginator.length,
      nbRows: NB_MAX_ROWS,
    };

    return rechercheUsagerCritereDto;
  }

  /**
   * Recherche des usagers par le bouton Rechercher
   */
  rechercheSOLR() {
    this.alertStore.resetAlert();

    if (this.appCriteresRecherche.isEmpty()) {
      // Si le tableau d'alerte est vide on fait apparaitre la fenêtre modale
      this.openModal("au_moins_un");

      this.resultsLength = 0;
      return null;
    }

    if (!this.appCriteresRecherche.validerNbCarMinCriteres(NB_CAR_MIN_RECHERCHE)) {
      // Si des critères sont non valides, ils sont allumés en rouge lors de la validation.
      return null;
    }

    this.paginator.pageIndex = 0;

    this.critereRecherche = this.getCriteresRecherche();
    this.critereRecherche.nbRows = this.critereRecherche.listeChampDoublon?.length > 0 ? 0 : NB_MAX_ROWS + 1;

    this.subscriptions.add(
      this.usagerService.rechercherNbUsagers(this.critereRecherche).subscribe((nbUsagers: number) => {
        if (nbUsagers >= NB_MAX_ROWS) {
          this.openModal("trop_resultat")
          this.resultsLength = 0;
          return;
        } else {
          this.lancerRecherche(this.critereRecherche).subscribe();
        }
      })
    );
  }

  /**
   * Lance la recherche d'usager avec les critères présents dans critereRecherche.
   * @param critereRecherche critères de recherche
   */
  private lancerRecherche(critereRecherche: RechercheUsagerCritereDTO): Observable<void> {
    // Sauvegarde les critères dans le storage
    this.sauvegarderCriteres({ critereRecherche: critereRecherche, selectedRowIndex: this.selectedRowIndex });

    return this.usagerService.rechercherUsager(critereRecherche).pipe(map((resultat: ResultatRechercheUsagerDTO) => {
      let afficher: RechercheUsagerResultatDTO[] = [];
      let afficherTotal: RechercheUsagerResultatDTO[] = [];

      this.data = null;

      // Indicateur sur l'état de la requête.
      this.isLoadingResults = false;
      this.isRateLimitReached = false;

      let totalResultatNonVide = 0;

      this.displayListeInfosDoublon = critereRecherche.listeChampDoublon?.length > 0;

      // Met à jour le contenu de la liste des "Liste des doublons identifiés" lorsqu'on recherche des informations identique (listeChampDoublon),
      // mais que l'utilisateur n'a pas encore sélectionné de doublons à rechercher (critereDoublon).
      if (critereRecherche.listeChampDoublon?.length > 0 && !critereRecherche.critereDoublon) {
        this.listeInfosDoublon = null;
        this.selectedRowIndex = null;

        if (resultat.listeDoublons?.length > 0) {
          // La première ligne de listeDoublons contient le nom des facets contenu dans chaque colonne.
          this.displayedColumnsDoublon = resultat.listeDoublons[0];
          this.displayedColumnsDoublon.push("actions");
          resultat.listeDoublons.splice(0, 1); // Retire la 1ere ligne contenant le nom des facets
          this.listeInfosDoublon = resultat.listeDoublons;
        }
      }

      if (resultat.listeUsagers?.length > 0) {
        for (let i = 0; i < resultat.listeUsagers.length; i++) {
          afficherTotal.push(resultat.listeUsagers[i]);
          if (resultat.listeUsagers[i].id) {
            totalResultatNonVide++;
          }
        }

        this.resultsLength = totalResultatNonVide;

      } else {
        this.resultsLength = 0;
      }

      if (this.resultsLength < this.critereRecherche.length) {
        this.paginator.pageIndex = 0;
        this.critereRecherche.length = this.resultsLength;
      }

      let debut = this.paginator.pageIndex * this.paginator.pageSize;
      let fin = debut + this.paginator.pageSize;

      let afficherTrier = [];

      afficher = this.trier(afficherTotal, this.sort.active);

      if (this.resultsLength < fin) {
        fin = this.resultsLength;
      }

      for (let i = debut; i < fin; i++) {
        if (afficher[i]) {
          afficherTrier.push(this.setResultatSOLR(afficher[i]));
        }

      }

      this.paginator.length = this.resultsLength;

      this.pageIndex = this.paginator.pageIndex;
      this.pageSize = this.paginator.pageSize;
      this.pageLength = this.paginator.length;

      this.data = afficherTrier;
      this.changeDetectorRefs.detectChanges();

      return;
    },
      (err) => {
        console.error(err);
        this.isLoadingResults = false;
        // Lève l'indicateur d'erreur
        this.isRateLimitReached = true;
        this.data = [];
        return;
      }
    )
    );
  }

  /**
   * Trie les résultats lorsque l'utilisateur clique sur une entête de colonne.
   */
  onResultatHeaderClick(): void {
    this.paginator.pageIndex = 0;

    // Relance la dernière recherche 
    this.critereRecherche.colonneTri = this.sort.active;
    this.critereRecherche.tri = this.sort.direction.toString();

    this.subscriptions.add(
      this.lancerRecherche(this.critereRecherche).subscribe()
    );
  }

  /**
   * Récupère la valeur à afficher dans une colonne du tableau des "Liste des doublons identifiés".
   * @param data valeurs de toutes les colonnes d'une ligne
   * @param name nom de la colonne
   * @returns la valeur de la colonne demandée
   */
  getDoublonColValue(data: string[], name: string): string {
    let value: string = "";
    const idx: number = this.displayedColumnsDoublon?.indexOf(name);
    if (idx > -1) {
      value = data[idx];
    }

    if (name == FacetDoublonUsagerEnum.CODE_POSTAL) {
      value = this.codePostalPipe.transform(value);
    } else if (name == FacetDoublonUsagerEnum.COMMUNICATION) {
      value = this.formaterCommunicationAff(value);
    } else if (name == FacetDoublonUsagerEnum.LANGUE) {
      value = FusionUtils.getLabelFromInputOptions(value.toUpperCase(), this.inputOptionLangue.options);
    } else if (name == FacetDoublonUsagerEnum.NAM && value.length == 12) {
      value = value.substring(0, 4).toUpperCase() + "-" + value.substring(4, 8) + "-" + value.substring(8, 12);
    } else if (name == FacetDoublonUsagerEnum.REGION) {
      value = FusionUtils.getLabelFromInputOptions(value.toUpperCase(), this.inputOptionRegion.options);
    } else if (name == FacetDoublonUsagerEnum.SEXE) {
      value = value.toUpperCase();
    }

    return value;
  }

  /**
   * Formate l'affichage d'une communication selon qu'il s'agit d'un numéro de téléphone ou d'un courriel.
   * @param value valeur à afficher
   * @returns valeur formatée
   */
  private formaterCommunicationAff(value: string): string {
    let commAff: string = "";

    if (value) {
      if (StringUtils.isDigits(value)) {
        commAff = TelephoneUtils.formatTelephone(value);
      } else if (value.indexOf("#") > -1) {
        commAff = TelephoneUtils.formatTelephoneAvecPoste(value, false);
      } else {
        commAff = value;
      }
    }
    return commAff;
  }

  /**
   * Lance la recherche des usagers doublons. Lorsque l'utilisateur sélectionne un doublon dans la liste des "Liste des doublons identifiés", 
   * des critères de recherche sont créés à partir du doublon sélectionné.
   * @param names nom des facets constituant le doublon
   * @param data valeurs des facets du doublon
   */
  onRechercherDoublon(names: string[], data: string[]): void {
    this.critereRecherche.critereDoublon = this.creerCriteresRechercheFromDoublon(names, data);
    this.critereRecherche.nbRows = NB_MAX_ROWS + 1;

    this.paginator.pageIndex = 0;

    this.critereRecherche.pageIndex = this.paginator.pageIndex;

    this.subscriptions.add(
      this.lancerRecherche(this.critereRecherche).subscribe(() => {
        this.scrollToBottom();
      })
    );
  }

  /**
   * Création des critères de recherche à partir du contenu d'un doublon.
   * @param facetNames 
   * @param data 
   * @returns 
   */
  creerCriteresRechercheFromDoublon(facetNames: string[], data: string[]): RechercheUsagerCritereDoublonDTO {
    let critereDoublon: RechercheUsagerCritereDoublonDTO = null;

    if (facetNames && facetNames.length > 0) {
      critereDoublon = new RechercheUsagerCritereDoublonDTO();

      facetNames?.forEach((facetName: string, index: number) => {
        switch (facetName) {
          case FacetDoublonUsagerEnum.ADRESSE: critereDoublon.adresse = data[index]; break;
          case FacetDoublonUsagerEnum.CODE_POSTAL: critereDoublon.codePostal = data[index]; break;
          case FacetDoublonUsagerEnum.COMMUNICATION: critereDoublon.communication = data[index]; break;
          case FacetDoublonUsagerEnum.DATE_NAISSANCE: critereDoublon.dateNaissance = data[index]; break;
          case FacetDoublonUsagerEnum.LANGUE: critereDoublon.langueCode = data[index]; break;
          case FacetDoublonUsagerEnum.MUNICIPALITE: critereDoublon.municipalite = data[index]; break;
          case FacetDoublonUsagerEnum.NAM: critereDoublon.nam = data[index]; break;
          case FacetDoublonUsagerEnum.NOM: critereDoublon.nom = data[index]; break;
          case FacetDoublonUsagerEnum.NOM_MERE: critereDoublon.nomMere = data[index]; break;
          case FacetDoublonUsagerEnum.PRENOM: critereDoublon.prenom = data[index]; break;
          case FacetDoublonUsagerEnum.PRENOM_MERE: critereDoublon.prenomMere = data[index]; break;
          case FacetDoublonUsagerEnum.REGION: critereDoublon.regionCode = data[index]; break;
          case FacetDoublonUsagerEnum.SEXE: critereDoublon.sexeCode = data[index]; break;
        }
      });
    }
    return critereDoublon;
  }

  /**
   * Lorsque l'utilisateur sélectionne une ligne dans la liste des "Liste des doublons identifiés", on surligne la ligne en bleu.
   * @param event 
   * @param rowIndex 
   */
  onRowClick(event: MouseEvent, rowIndex: number): void {
    if (((event.target as Element).nodeName == "I") || ((event.target as Element).nodeName == "BUTTON")) {
      this.selectedRowIndex = rowIndex;

      // Sauvegarde les critères dans le storage
      this.sauvegarderCriteres({ critereRecherche: this.critereRecherche, selectedRowIndex: this.selectedRowIndex });
    }
  }

  /**
   * fontions generiques pour ouvrir et fermer une fenetre modal popup
   */
  openModal(id: string) {
    this.modalConfirmService.open(id);
  }

  closeModal(id: string) {
    this.modalConfirmService.close(id);
  }

  /**
   * Lors de la fermeture d'une fenêtre modale onremet le focus sur le champ date de naissance
   * @param id
   */
  onModalClose(id: string) {
    this.appCriteresRecherche.resetFocus();
  }

  /**
   * Exécute la recherche sur l'événement "Entrée"
   */
  onEnterKeydown() {
    this.rechercheSOLR();
  }

  /**
   * Ajoute un usager à la liste des usagers à fusionner
   * @param usager usager à ajouter à la fusion
   */
  onAjouterUsagerFusion(usager: RechercheUsagerResultatDTO): void {
    this.alertStore.resetAlert();

    // S'assure que l'usager est actif avant de relier l'usager.
    this.subscriptions.add(
      this.usagerService.isUsagerActif(usager?.id).subscribe((isActif: boolean) => {
        if (isActif) {
          // Vérifie la présence de l'usager dans la liste.
          if (this.listeUsagerFusion.find((value: RechercheUsagerResultatDTO) => value.id == usager.id)) {
            // Cet usager est déjà sélectionné pour la fusion.
            this.materialModalDialogService.popupAvertissement("us-iu-a30001", "170px").subscribe();
          } else {
            if (this.listeUsagerFusion.length < NB_MAX_USAGER_FUSION) {
              // S'assure que l'usager n'est pas lié à une fiche d'appel ouverte.
              this.subscriptions.add(
                this.usagerFusionApiService.getNombreFicheAppelOuverteByIdUsagerIdent(usager.id).subscribe((nbFiche: number) => {
                  if (nbFiche == 0) {
                    this.listeUsagerFusion.push(usager);
                    this.usagersFusionToStorage();
                  } else {
                    // Cet usager est présentement relié à une fiche en cours. Veuillez recommencer plus tard.
                    this.materialModalDialogService.popupAvertissement("us-iu-a30007", "170px").subscribe();
                  }
                })
              );
            } else {
              // Vous pouvez fusionner seulement deux usagers à la fois.
              this.materialModalDialogService.popupAvertissement("us-iu-a30000", "170px").subscribe();
            }
          }
        } else {
          // L'usager n'est plus actif. Ses informations ne peuvent être modifiées.
          this.creerMessageErreur("ss-iu-e30008");
        }
      })
    );
  }

  /**
   * Redirection vers l'interface de Consultation
   *
   * @param id
   */
  onConsulterUsager(id: number) {
    // S'assure que l'usager est actif avant de relier l'usager.
    this.subscriptions.add(
      this.usagerService.isUsagerActif(id).subscribe((isActif: boolean) => {
        if (isActif) {
          this.consulterUsager.emit(id);
        } else {
          // L'usager n'est plus actif. Ses informations ne peuvent être modifiées.
          this.creerMessageErreur("ss-iu-e30008");
        }
      })
    );
  }

  /**
   * Navigue vers la liste des enregistrements de l'usager.
   * @param idUsagerIdent identifiant de l'usager
   */
  onConsulterEnregistrementsUsager(idUsagerIdent: number): void {
    this.consulterEnregistrementsUsager.emit(idUsagerIdent);
  }

  /**
   * Redirection vers l'interface d'édition
   *
   * @param id
   */
  onModifierUsager(id: number) {
    // S'assure que l'usager est actif avant de modifier l'usager.
    this.subscriptions.add(
      this.usagerService.isUsagerActif(id).subscribe((isActif: boolean) => {
        if (isActif) {
          // Avant d'éditer l'usager choisi on met la mémorisation des critères de recherche à NULL afin qu'elle ne soit pas utilisée
          this.usagerService.sauvegarderCritereRecherche(null);
          this.editerUsager.emit(id);
        } else {
          // L'usager n'est plus actif. Ses informations ne peuvent être modifiées.
          this.creerMessageErreur("ss-iu-e30008");
        }
      })
    );
  }

  /**
   * Relie l'usager à l'appel courrant.
   * @param usager usager à relier
   */
  onRelierUsager(usager: RechercheUsagerResultatDTO) {
    this.subscriptions.add(
      this.usagerService.isUsagerActif(usager.id).subscribe((result: Boolean) => {
        if (!result) {
          // L'usager n'est plus actif.  Veuillez relier un autre usager.
          this.creerMessageErreur("iu-e3000887");
        } else {
          this.relierUsager.emit(usager);
        }
      })
    );
  }

  /**
   * Retire l'usager de la liste lorsque le X d'un usager est cliqué.
   */
  onRemoveUsagerFusion(usager: RechercheUsagerResultatDTO): void {
    const index: number = this.listeUsagerFusion.indexOf(usager);

    if (index > -1) {
      this.listeUsagerFusion.splice(index, 1);
      this.usagersFusionToStorage();
    }
  }

  /**
   * Exécute la recherche lorsque le bouton Fusionner est cliqué.
   */
  onBtnFusionnerClick() {
    if (this.listeUsagerFusion.length != NB_MAX_USAGER_FUSION) {
      // NB: Ne devrait pas survenir, car le bouton est invisible si un seul usager sélectionné.
      // Vous devez sélectionner deux usagers pour fusionner
      this.materialModalDialogService.popupAvertissement("Vous devez sélectionner deux usagers pour fusionner.", "170px").subscribe();
    } else {
      const idUsager1: number = this.listeUsagerFusion[0].id;
      const idUsager2: number = this.listeUsagerFusion[1].id;
      this.fusionnerUsager.emit([idUsager1, idUsager2]);
    }
  }

  /**
   * Exécute la recherche lorsque le bouton Rechercher est cliqué.
   */
  onBtnRechercher() {
    this.rechercheSOLR();
  }

  /**
   * Réinitialise les paramètres de recherche.
   */
  onBtnReinitialiser() {
    this.appCriteresRecherche.resetFocus();
    this.vider();
  }

  /**
   * Retourne la description de l'usager à fusionner.
   * @param usager usager à fusionner
   * @returns
   */
  getDescriptionUsagerFusion(usager: RechercheUsagerResultatDTO): string {
    let desc: string = "";
    if (usager) {
      if (usager.nom) {
        desc += usager.nom + ", ";
      }
      if (usager.prenom) {
        desc += usager.prenom + ", ";
      }
      if (usager.dtNaiss) {
        desc += this.datePipe.transform(usager.dtNaiss, "yyyy-MM-dd") + ", ";
      }
      if (usager.sexeCode) {
        desc += usager.sexeCode + ", ";
      }
      if (usager.communication) {
        desc += usager.communication + ", ";
      }
      if (usager.region) {
        desc += usager.region + ", ";
      }
      if (usager.codePostal) {
        desc += usager.codePostal;
      }

      if (desc.endsWith(", ")) {
        desc = desc.substr(0, desc.length - 2);
      }
    }
    return desc;
  }

  /**
   * Formatter les données avant l'affichage.
   * @param obj
   */
  setResultatSOLR(obj): RechercheUsagerResultatDTO {

    let res = new RechercheUsagerResultatDTO();
    res.displayAll = false;

    try {
      if (obj) {
        res.dtNaiss = obj.date_naissance;

        res.region = "";

        if (obj && obj.adresse_municipalite_aff != null && obj.adresse_municipalite_aff !== undefined) {
          res.region = obj.adresse_municipalite_aff;
        }

        if (obj.adresse_region_code_aff != null && obj.adresse_region_code_aff !== undefined) {
          if (res.region) { res.region = res.region + " - "; }
          res.region = res.region + " " + obj.adresse_region_code_aff;
        }

        if (obj && obj.adresse_region_nom_aff != null && obj.adresse_region_nom_aff !== undefined) {
          if (res.region) { res.region = res.region + " - "; }
          res.region = res.region + obj.adresse_region_nom_aff
        }

        res.nbAppelAnterieurSante = obj.nb_appel_anterieur_sante ? obj.nb_appel_anterieur_sante : 0;
        res.nbAppelAnterieurSocial = obj.nb_appel_anterieur_social ? obj.nb_appel_anterieur_social : 0;
        res.prenom = obj.prenom;
        res.nom = obj.nom;
        res.sexeCode = obj.sexe_code;
        res.doublonPotentiel = obj?.doublon_potentiel;

        res.codePostal = this.codePostalPipe.transform(obj.adresse_code_postal_aff);

        res.communication = this.formaterCommunicationAff(obj.communication_coordonnees_aff);

        res.statutEnregistrement = obj?.statut_enregistrement;

        res.id = obj.usager_ident_id;

      } else {
        res.dtNaiss = null;
        res.region = "";
      }



    } catch (e) {

      console.error(e);
    }

    return res;
  }

  /**
   * Vider les critères de recherche.
   */
  vider() {
    this.alertStore.resetAlert();

    this.appCriteresRecherche.viderCriteres();

    localStorage.removeItem("rechercher");

    this.data = null;
    this.listeInfosDoublon = null;
    this.displayListeInfosDoublon = false;
    this.paginator.length = 0;
    this.paginator.pageIndex = 0;

    this.pageIndex = this.paginator.pageIndex;
    this.pageLength = this.paginator.length;
  }


  isRelierBtnDisable() {
    return this.typeFiheSelectioneService.isNomPert();
  }

  getCssNbFicheAnterieur(nb: number): string {
    if (nb >= 10 && nb <= 99) {
      return "double-digit";
    } else if (nb >= 100 && nb <= 999) {
      return "three-digit";
    }
    return "single-digit";
  }

  /**
   * Crée un message d'erreur et l'ajoute à l'AlertStore.
   * @param msgErreur 
   */
  private creerMessageErreur(msgErreur: string): void {
    this.alertStore.resetAlert();
    const msg = this.translate.instant(msgErreur);
    const label = this.translate.instant("sigct.ss.error.label");
    const alert: AlertModel = AlertModelUtils.createAlertModel([msg], label, AlertType.ERROR);
    this.alertStore.addAlert(alert);
  }
}
