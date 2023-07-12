import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppelRechDTO, CritereRechercheDTO, RechercheIsiswCollectionsDTO, ResultatRechercheDTO } from 'projects/isiswhisto-ng-core/src/lib/models';
import { CriteresPagination } from 'projects/sigct-ui-ng-lib/src/lib/components/table-pagination/criteres-pagination';
import { TablePaginationComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/table-pagination/table-pagination.component';
import { RechercherIsiswCriteriasComponent } from '../rechercher-isisw-criterias/rechercher-isisw-criterias.component';

/** Nombre de caractères saisis minimums pour une recherche = 2 */
export const NB_CAR_MIN_CRITERES: number = 2;

@Component({
  selector: 'msss-rechercher-isisw-wrapper',
  templateUrl: './rechercher-isisw-wrapper.component.html',
  styleUrls: ['./rechercher-isisw-wrapper.component.css']
})
export class RechercherIsiswWrapperComponent implements OnInit, AfterViewInit {

  displayedColumns: string[] = ['beginCall', 'lastName', 'firstName', 'genderCode', 'princPhoneNumber', 'regionName', 'postalCode', 'actions'];
  columnsHeadThatNeedTitleProperty: string[] = [];
  columnsHeadThatNeedEllipsis: string[] = [];
  headTitleByCodeColumn: Map<string, string> = new Map<string, string>();
  defaultSortField: string = "beginCall" // Le nom de la colonne de tri par défaut.
  defaultPageSize: number = 50 // Le nombre d'éléments par page par défaut.

  @Input()
  resultatRechercheDto: ResultatRechercheDTO = new ResultatRechercheDTO();
  @Input()
  critereRechercheDto: CritereRechercheDTO;
  @Input()
  inputOptionCollections: RechercheIsiswCollectionsDTO;

  @Output()
  consulterAppel: EventEmitter<AppelRechDTO> = new EventEmitter();
  @Output()
  rechercherAppels: EventEmitter<CritereRechercheDTO> = new EventEmitter();
  @Output()
  reinitialiserCriteres: EventEmitter<void> = new EventEmitter();
  @Output()
  serviceChange: EventEmitter<string> = new EventEmitter();

  @ViewChild("rechercherIsiswCriteriasComponent", { static: true })
  rechercherIsiswCriteriasComponent: RechercherIsiswCriteriasComponent;

  @ViewChild("tblResultatIsisw", { static: true })
  tablePaginationComponent: TablePaginationComponent;

  @ViewChild('btnRechercher', { read: ElementRef, static: true })

  private btnRechercher: ElementRef;

  constructor(
    private translateService: TranslateService) {
  }
  ngAfterViewInit(): void {
      this.btnRechercher.nativeElement.focus();
  }

  ngOnInit(): void {
    this.initHeadTitleByCodeColumn();
  }

  /**
   * Lorsque le bouton rechercher est cliqué.
   */
  onRechercher(): void {
    // Retour à la première page.
    this.tablePaginationComponent.firstPage();

    // Lance la recherche après validation des critères.
    this.validerEtRechercher();
  }

  /**
   * Met à jour les critères de pagination et lance la recherche.
   * @param criteresPagination
   */
  onRefreshTable(criteresPagination: CriteresPagination): void {
    this.critereRechercheDto.page = (criteresPagination?.page ? criteresPagination?.page - 1 : null);
    this.critereRechercheDto.pageSize = criteresPagination?.pageSize
    this.critereRechercheDto.sortField = criteresPagination?.sortField;
    this.critereRechercheDto.sortDirection = criteresPagination?.sortDirection;
    // this.critereRechercheDto.criteresPagination = criteresPagination;

    // Lance la recherche après validation des critères.
    this.validerEtRechercher();
  }

  /**
   * Réinitialisation des critères de recherche.
   */
  onReinitialiser(): void {
    this.reinitialiserCriteres.emit();
  }

  /**
   *
   * @param clientId
   */
  onServiceChange(clientId: string): void {
    this.serviceChange.emit(clientId);
  }

  /**
   * Lorsqu'une consultation de fiche est demadée
   * @param appel
   */
  onConsulterAppel(appel: AppelRechDTO): void {
    this.consulterAppel.emit(appel);
  }

  /**
  * Initialise les libellés des entêtes des colonne.
  */
  private initHeadTitleByCodeColumn() {
    let self = this;
    this.displayedColumns.forEach((codeColumn: string) => {
      switch (codeColumn) {
        case "beginCall":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.ss.r_appels.sctn_rslt_rchrchisisw.dhappel"));
          break;
        case "lastName":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.ss.r_appels.sctn_rslt_rchrchisisw.nom"));
          break;
        case "firstName":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.ss.r_appels.sctn_rslt_rchrchisisw.prnom"));
          break;
        case "genderCode":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.ss.r_appels.sctn_rslt_rchrchisisw.sexe"));
          break;
        case "princPhoneNumber":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.ss.r_appels.sctn_rslt_rchrchisisw.telprinc"));
          break;
        case "regionName":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.ss.r_appels.sctn_rslt_rchrch.rgn"));
          break;
        case "postalCode":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.ss.r_appels.sctn_rslt_rchrchisisw.codpostal"));
          break;
        default:
          self.headTitleByCodeColumn.set(codeColumn, "");
          break;
      }
    });
  }

  /**
   * Valide les critères de recherche et lance la recherche si tout est valide.
   */
  private validerEtRechercher(): void {
    if (this.rechercherIsiswCriteriasComponent.validerCriteres(NB_CAR_MIN_CRITERES)) {
      this.rechercherAppels.emit(this.critereRechercheDto);
    }
  }
}
