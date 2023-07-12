import { EventEmitter, Output, ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TableInformationsUtilesService } from 'projects/sigct-service-ng-lib/src/lib/services/table-informations-utiles/table-informations-utiles-service';
import { CriteresPagination } from '../table-pagination/criteres-pagination';
import { TablePaginationComponent } from '../table-pagination/table-pagination.component';
import { CritereRechercheTablesInfo } from './critere-recherche-table-information';
import { TableInfoDTO } from './table-info-dto';
import { TableInfoWrapperDTO } from './table-info-wrapper-dto';

@Component({
  selector: 'msss-piloter-informations-utiles',
  templateUrl: './piloter-informations-utiles.component.html',
  styleUrls: ['./piloter-informations-utiles.component.css']
})
export class PiloterInformationsUtilesComponent implements OnInit {

  @ViewChild(TablePaginationComponent, { static: true })
  tablePaginationComponent: TablePaginationComponent;

  @Output('supprimerElement')
  supprimerElementEvent: EventEmitter<any> = new EventEmitter();

  resultsLength = 0; // Correspond au nombre de table de références trouvé (le terme length correspond à la propriété de MatPaginator)
  defaultsortField = 'identifiant'; // Le nom de la colonne de tri par défaut.
  defaultPageSize = 50; // Le nombre d'éléments par page par défaut.

  constructor(private translateService: TranslateService, private tableInfoService: TableInformationsUtilesService, private router: Router) { }

  displayedColumns: string[] = ['tri', 'categorie', 'nom', 'description', 'url', 'fichier', 'actif', 'identifiant' , 'actions'];
  columnsHeadThatNeedTitleProperty: string[] = ['tri', 'categorie', 'nom', 'description', 'url', 'fichier', 'actif', 'identifiant' , 'actions'];
  columnsHeadThatNeedEllipsis: string[] = ['tri', 'categorie', 'nom', 'description', 'identifiant'];
  columnsHeadThatNeedConvertFormBooleanToMark: string[] = ['url', 'fichier', 'actif'];
  columnsHeadWithNoSort: string[] = ['nom', 'description', 'url', 'fichier'];

  tableRefDTO: TableInfoDTO[] = [];
  headTitleByCodeColumn: Map<string, string> = new Map<string, string>();

  isSupprBtnDisplayed = true;
  isModifBtnDisplayed = true;

  identifiantPaginationTable = 'inforutile';

  ngOnInit(): void {
    this.getHeadTitleByCodeColumn();
    this.loadAllTablesReferences();
  }

  private getHeadTitleByCodeColumn() {
    const self = this;
    this.displayedColumns.forEach(function (codeColumn) {
      switch (codeColumn) {
        case 'tri':
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant('sigct.ss.pilotage.info_utile.liste.tri'));
          break;
        case 'categorie':
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant('sigct.ss.pilotage.info_utile.liste.categorie'));
          break;
        case 'nom':
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant('sigct.ss.pilotage.info_utile.liste.nom'));
          break;
        case 'description':
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant('sigct.ss.pilotage.info_utile.liste.description'));
          break;
        case 'url':
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant('sigct.ss.pilotage.info_utile.liste.url'));
          break;
        case 'fichier':
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant('sigct.ss.pilotage.info_utile.liste.fichier'));
          break;
        case 'actif':
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant('sigct.ss.pilotage.info_utile.liste.actif'));
          break;
        case 'identifiant':
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant('sigct.ss.pilotage.info_utile.liste.identifiant'));
          break;

        default:
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant('sigct.ss.pilotage.tableref.liste.actions'));
          break;
      }
    });
  }

  public rechercher() {
    this.loadAllTablesReferences();
  }


  private loadAllTablesReferences(): void {
    this.searchTablesInformations(this.buildDefaultCritereRechercheTablesRef());
  }

  private buildDefaultCritereRechercheTablesRef(): CritereRechercheTablesInfo {
    const criteresPagination: CriteresPagination = new CriteresPagination();
    criteresPagination.page = 1; // En backend service la premiere page est d'indexe '1' contrairement au frontend ou l'indexe est '0'
    criteresPagination.pageSize = 50;
    criteresPagination.sortDirection = 'asc';
    criteresPagination.sortField = 'identifiant';

    const critereRechercheTablesRef: CritereRechercheTablesInfo = new CritereRechercheTablesInfo();
    critereRechercheTablesRef.criteresPagination = criteresPagination;

    return critereRechercheTablesRef;
  }



  rechercherTabsRefsWhenPaginationOrSortEventIsTriggered(criteresPagination: CriteresPagination): void {
    const critereRechercheTablesRef: CritereRechercheTablesInfo = new CritereRechercheTablesInfo();
    critereRechercheTablesRef.criteresPagination = criteresPagination;

    this.searchTablesInformations(critereRechercheTablesRef);
  }

  private searchTablesInformations(critereRechercheTablesRef: CritereRechercheTablesInfo): void {

    if (critereRechercheTablesRef) {
      this.tableInfoService.getTablesReferences(critereRechercheTablesRef).subscribe((result: TableInfoWrapperDTO) => {
        if (result) {
          this.tableRefDTO = result.tableInfoDTOs;
          this.resultsLength = result.totalElements;
        }
      });
    }
  }


  consultTableRef(event) {
    // TODO avec l'UI de consultation.
    this.modifierInforUtile(event);
  }

  modifierInforUtile(event) {
    const dto: TableInfoDTO = event;
    this.router.navigate(['/' + 'info-utile-page/' + dto.identifiant]);
  }

  supprimerInforUtile(event) {
    this.supprimerElementEvent.emit(event);
  }


}
