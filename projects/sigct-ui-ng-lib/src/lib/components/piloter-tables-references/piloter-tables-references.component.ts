import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TableReferenceService } from 'projects/sigct-service-ng-lib/src/lib/services/table-reference/table-reference-service';
import { Criteres } from '../piloter-tables-references-section-criteres-recherche/criteres';
import { PiloterTablesReferencesSectionCriteresRechercheComponent } from '../piloter-tables-references-section-criteres-recherche/piloter-tables-references-section-criteres-recherche.component';
import { CriteresPagination } from '../table-pagination/criteres-pagination';
import { TablePaginationComponent } from '../table-pagination/table-pagination.component';
import { CritereRechercheTablesRef } from './critere-recherche-table-reference';
import { TableRefDTO } from './table-ref-dto';
import { TableRefWrapperDTO } from './table-ref-wrapper-dto';

@Component({
  selector: 'msss-piloter-tables-references',
  templateUrl: './piloter-tables-references.component.html',
  styleUrls: ['./piloter-tables-references.component.css']
})
export class PiloterTablesReferencesComponent implements OnInit {

  @ViewChild(TablePaginationComponent, { static: true })
  tablePaginationComponent: TablePaginationComponent;

  @ViewChild(PiloterTablesReferencesSectionCriteresRechercheComponent, { static: true })
  piloterTablesReferencesSectionCriteresRechercheComponent: PiloterTablesReferencesSectionCriteresRechercheComponent;

  resultsLength: number = 0; // Correspond au nombre de table de références trouvé (le terme length correspond à la propriété de MatPaginator)
  defaultsortField: string = "description" // Le nom de la colonne de tri par défaut.
  defaultPageSize: number = 50 // Le nombre d'éléments par page par défaut.
  identifiantPaginationTable = "identifiant-tables-ref-list"

  constructor(
    private tableReferenceService: TableReferenceService,
    private translateService: TranslateService,
    private router: Router) { }

  displayedColumns: string[] = ['description', 'nom', 'actions'];
  columnsHeadThatNeedTitleProperty: string[] = ['description'];
  columnsHeadThatNeedEllipsis: string[] = ['description'];
  tableRefDTO: TableRefDTO[] = [];
  headTitleByCodeColumn: Map<string, string> = new Map<string, string>();

  ngOnInit(): void {
    this.getHeadTitleByCodeColumn();
    this.loadAllTablesReferences();
    this.piloterTablesReferencesSectionCriteresRechercheComponent.elementWithDefaultCursor();
  }

  private getHeadTitleByCodeColumn() {
    let self = this;
    this.displayedColumns.forEach(function (codeColumn) {
      switch (codeColumn) {
        case "description":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.ss.pilotage.tableref.description"));
          break;
        case "nom":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.ss.pilotage.tableref.nom"));
          break;

        default:
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.so.pilotage.tableref.actions"));
          break;
      }
    });
  }

  private loadAllTablesReferences(): void {
    this.searchTablesReferences(this.buildDefaultCritereRechercheTablesRef());
  }

  private buildDefaultCritereRechercheTablesRef(): CritereRechercheTablesRef {
    let criteresPagination: CriteresPagination = new CriteresPagination();
    criteresPagination.page = 1; // En backend service la premiere page est d'indexe '1' contrairement au frontend ou l'indexe est '0'
    criteresPagination.pageSize = 50;
    criteresPagination.sortDirection = "asc";
    criteresPagination.sortField = "description";

    let critereRechercheTablesRef: CritereRechercheTablesRef = new CritereRechercheTablesRef();
    critereRechercheTablesRef.criteresPagination = criteresPagination;

    return critereRechercheTablesRef;
  }

  rechercherTabsRefsWhenPaginationOrSortEventIsTriggered(criteresPagination: CriteresPagination): void {
    let critereRechercheTablesRef: CritereRechercheTablesRef = new CritereRechercheTablesRef();
    critereRechercheTablesRef.criteresPagination = criteresPagination;
    critereRechercheTablesRef.nomDescription = this.piloterTablesReferencesSectionCriteresRechercheComponent?.criteres?.nomDescription;

    this.searchTablesReferences(critereRechercheTablesRef);
  }

  rechercherTabsRefsWhenRechercherBtnIsTriggered(criteres: Criteres): void {
    this.searchByNameDescriptionFilter(criteres);
  }

  rechercherTabsRefsWhenEnterKeydownIsTriggered(criteres: Criteres): void {
    this.searchByNameDescriptionFilter(criteres);
  }

  private searchByNameDescriptionFilter(criteres: Criteres): void {
    let critereRechercheTablesRef: CritereRechercheTablesRef = this.buildDefaultCritereRechercheTablesRef();
    if (critereRechercheTablesRef) {
      critereRechercheTablesRef.nomDescription = criteres?.nomDescription;
      this.searchTablesReferences(critereRechercheTablesRef);
    }
  }

  private searchTablesReferences(critereRechercheTablesRef: CritereRechercheTablesRef): void {
    if (critereRechercheTablesRef) {
      this.tableReferenceService.getTablesReferences(critereRechercheTablesRef).subscribe((result: TableRefWrapperDTO) => {
        if (result) {
          this.tableRefDTO = result.tableRefDTOs;
          this.resultsLength = result.totalElements;
        }
      })
    }
  }

  consultTableRef(tableRefDTO: TableRefDTO) {
    if (tableRefDTO) {
      let target = "/consult-table-reference-content/" + tableRefDTO.id;
      this.router.navigate([target]);
    }
  }

  getPiloterTablesRefTitleClass(): string {
    let appName: string = window["env"]?.appName;
    let className: string = "piloterTablesRefTitleSocial";
    if (appName == "infosante") {
      className = "piloterTablesRefTitleSante";
    }
    if (appName == "usager") {
      className = "piloterTablesRefTitleUsager";
    }
    return className;
  }

}
