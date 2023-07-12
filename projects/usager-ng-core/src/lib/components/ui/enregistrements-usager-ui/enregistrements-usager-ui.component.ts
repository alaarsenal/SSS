import { DatePipe } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { forkJoin, of as observableOf, Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { EnregistrementsUsagerResultatDTO } from '../../../models/enregistrements-usager-resultat-dto';
import { UsagerService } from '../../../services/usager.service';
import { TranslateService } from '@ngx-translate/core';
import { AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import { StatusEnregisrementEnum } from '../../../enums/status-enregistrements-enum';
import { OrganismeDTO } from '../../../models/organisme-dto';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import AuthenticationUtils from 'projects/sigct-service-ng-lib/src/lib/auth/authentication-utils';
import { ConfirmationDialogService } from 'projects/sigct-ui-ng-lib/src/lib/components/modal-confirmation-dialog/modal-confirmation-dialog.service';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { UtilitaireService } from '../../../services/utilitaire.service';
import { UsagerLieuResidenceDTO } from '../../../models/usager-lieu-residence-dto';




@Component({
  selector: 'app-enregistrements-usager-ui',
  templateUrl: './enregistrements-usager-ui.component.html',
  styleUrls: ['./enregistrements-usager-ui.component.css'],
  providers: [DatePipe]
})
export class EnregistrementsUsagerUiComponent implements OnInit, AfterViewInit, OnDestroy {
  // identification de l'usager
  identifUsager: number;
  // identification de l'enregistrement
  identifEnregistrement: number;
  // max characteres dans le champs diagnostic
  readonly contentMaxLength: number = 100;
  public enregistrementsResultatDTO: EnregistrementsUsagerResultatDTO = new EnregistrementsUsagerResultatDTO();
  private abonnement: Subscription;

  @Input()
  public adressePrincipaleUsager = new UsagerLieuResidenceDTO();

  contentZoneTitle = "";
  // Ajout par DG
  displayedColumns: string[] = ['dateCreation', 'dateModifie', 'dateFermeture', 'region', 'organisme', 'type', 'actions'];
  inputListData: EnregistrementsUsagerResultatDTO[] = [];

  resultsLength: number = 0; // Correspond au nombre d'usager trouvé (le terme length correspond à la propriété de MatPaginator )
  isLoadingResults: boolean = true;
  isRateLimitReached: boolean = false;

  @ViewChild(MatPaginator, { static: true })
  paginator: MatPaginator;

  @ViewChild(MatSort, { static: true })
  sort: MatSort;

  @Output("consulterEnregistrement")
  consulterEnregistrement = new EventEmitter<number>();

  @Output("editerEnregistrement")
  editerEnregistrement = new EventEmitter<number>();

  @Output("copierEnregistrement")
  copierEnregistrement = new EventEmitter<number>();

  @Output("ajouterEnregistrement")
  ajouterEnregistrement = new EventEmitter<string>();

  constructor(private usagerService: UsagerService,
    public datePipe: DatePipe,
    private appContextStore: AppContextStore,
    private changeDetectorRefs: ChangeDetectorRef,
    private translateService:TranslateService,
    private authenticationService: AuthenticationService,
    private modalConfirmService: ConfirmationDialogService,
    private alertStore: AlertStore,
    private utilitaireService: UtilitaireService) {
  }

  setIdentificationUsager(idUsager: number): void {
    this.identifUsager = idUsager;
  }

  ngAfterViewInit() {
    /* the above code was commented due to error Expression has changed after it was checked */
    this.paginator.page.subscribe(() => {
      this.obtenirListeEnregistrements(this.identifUsager);
    });
    //obtenir la liste des enregistrements
    setTimeout(() => {
      if (this.identifUsager) {
        this.obtenirListeEnregistrements(this.identifUsager);
      }
    }, 500
    );

    // Permet d'éviter l'erreur ExpressionChangedAfterItHasBeenCheckedError
    this.changeDetectorRefs.detectChanges();
  }


  // peupler la grille des enregistrements par rapport a l'usager en contexte
  obtenirListeEnregistrements(idUsager: number) {

    this.abonnement = this.usagerService.getEnregistrementsUsager(idUsager).pipe(
      map(data => {
        let resultat = eval(JSON.stringify(data));

        let afficher = [];
        let afficherTotal = [];
        let actif=false;
        // Indicateur sur l'état de la requête.
        this.isLoadingResults = false;
        this.isRateLimitReached = false;

        let totalResultatNonVide = 0;

        if (resultat) {
          for (let i = 0; i < resultat.length; i++) {
            afficherTotal.push(resultat[i]);
            if (resultat[i].id) {

              if (resultat[i].actif === true){
               actif=true;
              }
              totalResultatNonVide++;
            }
          }
          this.resultsLength = totalResultatNonVide;

          if (actif === true)  {
            this.appContextStore.setvalue('statusEnregistrementsUsager', StatusEnregisrementEnum.ACTIF);
          } else {
             if (this.resultsLength> 0) {
            this.appContextStore.setvalue('statusEnregistrementsUsager', StatusEnregisrementEnum.INACTIF);
             } else {
                this.appContextStore.setvalue('statusEnregistrementsUsager', StatusEnregisrementEnum.VIDE);
             }
          }

        } else {
          this.resultsLength = 0;
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
            afficherTrier.push(afficher[i]); // appliquer une fonction de formatage de données si besoin
          }

        }

        return afficherTrier;//data.items;
      }),
      catchError((err) => {
        console.error(err);
        this.isLoadingResults = false;
        // Lève l'indicateur d'erreur
        this.isRateLimitReached = true;
        return observableOf([]);
      })

    ).subscribe(data => {
      this.inputListData = data;
    });
  }

  ngOnDestroy(): void {
    if (this.abonnement) {
      this.abonnement.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.paginator._intl.firstPageLabel = this.translateService.instant("pagination.premierepage");
    this.paginator._intl.lastPageLabel = this.translateService.instant("pagination.dernierepage");
  }

  tri(afficher: any, type: any, direction: string): any {

    afficher.sort(function (a, b) {
      let keyA = eval("a." + type),
        keyB = eval("b." + type);

      if (keyA && keyB) {
        keyA = keyA.toLocaleLowerCase();
        keyB = keyB.toLocaleLowerCase();
        let res = keyA.localeCompare(keyB);
        return res;
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
  trier(afficher: any, type: any): any {

    if (type === 'dateCreation') {
      type = 'date_creation';
      afficher = this.tri(afficher, type, this.sort.direction);
    }
    if (type === 'dateModification') {
      type = 'date_modification';
      afficher = this.tri(afficher, type, this.sort.direction);
    }
    if (type === 'dateFermeture') {
      type = 'date_fermeture';
      afficher = this.tri(afficher, type, this.sort.direction);
    }
    if (type === 'diagnostic') {
      type = 'diagnostic';
      afficher = this.tri(afficher, type, this.sort.direction);
    }

    return afficher;
  }

  afficherMaxCaracteres(data: string) {
    if (data.length < this.contentMaxLength) {
      return data;
    } else {
      return data.substr(0, this.contentMaxLength).concat('...');
    }
  }


  modifierDetailsEnregistrement(enregistrementDTO: EnregistrementsUsagerResultatDTO): void {
    this.identifEnregistrement = enregistrementDTO.id;
    if (this.authenticationService.hasAnyRole(['ROLE_US_ENREGISTREMENT_CONSULT_TOUS']) && !this.isOrganismeEnregistreur(enregistrementDTO)
        && !this.isOrganismeISAISO()){
      this.modalConfirmService.openAndFocus('confirm_popup_modifier_fiche', 'confi_modifier_fiche_btn_oui');
    } else {
      this.confirmerModifierFiche();
    }
  }

  confirmerModifierFiche() {
    this.editerEnregistrement.emit(this.identifEnregistrement);
  }

  afficherDetailsEnregistrement(enregistrementDTO: EnregistrementsUsagerResultatDTO): void {
    this.identifEnregistrement = enregistrementDTO.id;
    if (this.authenticationService.hasAnyRole(['ROLE_US_ENREGISTREMENT_CONSULT_TOUS']) && !this.isOrganismeEnregistreur(enregistrementDTO)
        && !this.isOrganismeISAISO()){
      this.modalConfirmService.openAndFocus('confirm_popup_consulter_fiche', 'confi_consulter_fiche_btn_oui');
    } else {
      this.confirmerConsulterFiche();
    }

  }

  confirmerConsulterFiche() {
    this.consulterEnregistrement.emit(this.identifEnregistrement);
  }

  copierDetailsEnregistrement(enregistrementDTO: EnregistrementsUsagerResultatDTO): void {
    this.ajouterEnregistrement.emit();
    this.identifEnregistrement = enregistrementDTO.id;
    if (this.alertStore.state == null) {
      this.copierEnregistrementInactif(enregistrementDTO);
    }
  }

  copierEnregistrementInactif(item: any): void {
    this.modalConfirmService.openAndFocus('confirm_popup_copier_fiche', 'confi_copier_fiche_btn_oui');
    this.enregistrementsResultatDTO = item;
  }

  confirmerCopierFiche() {
    this.identifEnregistrement = this.enregistrementsResultatDTO.id;
    this.copierEnregistrement.emit(this.identifEnregistrement);
  }

  getTypeOrganisme(organisme: OrganismeDTO) {

    if (organisme.typeSante && organisme.typeSocial){
      return "SO/SA";
    }else if (organisme.typeSante){
      return "SA";
    }else if (organisme.typeSocial) {
      return "SO";
    }else{
      return "";
    }
  }

  isOrganismeEnregistreur(enregistrement: EnregistrementsUsagerResultatDTO) {
    let idOrganismeCourant = this.authenticationService.getAuthenticatedUser().idOrganismeCourant;
    return (enregistrement.organismes.filter(o => o.idOrganisme == idOrganismeCourant).length > 0)
  }

  isOrganismeISAISO() {
    let codeOrganismeCourant = this.authenticationService.getAuthenticatedUser().codeOrganismeCourant;
    return (codeOrganismeCourant.startsWith("ISA") || codeOrganismeCourant.startsWith("ISO"));
  }

  hasType(enregistrement: EnregistrementsUsagerResultatDTO, type: string) {
    let typesDuEnregistrement: Array<string> = enregistrement.organismes.map(o => this.getTypeOrganisme(o));
    return (typesDuEnregistrement.includes(type) || typesDuEnregistrement.includes('SO/SA'));
  }

  getAuth(){
    return AuthenticationUtils.getUserFromStorage().authorities;
  }

}
