import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { TableReferenceService } from 'projects/sigct-service-ng-lib/src/lib/services/table-reference/table-reference-service';
import { Subscription } from 'rxjs';
import { CriteresPagination } from '../table-pagination/criteres-pagination';
import { CritereRechercheTableRefContent } from './critere-recherche-table-ref-content';
import { TableRefContentDTO } from './table-ref-content-dto';
import { TableRefContentWrapperDTO } from './table-ref-content-wrapper-dto';

@Component({
  selector: 'msss-piloter-table-reference-content-en-consultation',
  templateUrl: './piloter-table-reference-content-en-consultation.component.html',
  styleUrls: ['./piloter-table-reference-content-en-consultation.component.css']
})
export class PiloterTableReferenceContentEnConsultationComponent implements OnInit, OnDestroy {

  tableRefContentDTOs: TableRefContentDTO[] = [];
  displayedColumns: string[] = ['tri', 'nom', 'description', 'code', 'codeCn', 'actif', 'id', 'defaut', 'actions'];
  resultsLength: number = 0; // Correspond au nombre de table de références trouvé (le terme length correspond à la propriété de MatPaginator)
  defaultsortField: string = "nom" // Le nom de la colonne de tri par défaut.
  defaultPageSize: number = 50 // Le nombre d'éléments par page par défaut.
  headTitleByCodeColumn: Map<string, string> = new Map();
  columnsHeadThatNeedTitleProperty: string[] = ['nom', 'description'];
  columnsHeadThatNeedEllipsis: string[] = ['nom', 'description'];
  columnsHeadThatNeedConvertFormBooleanToMark: string[] = ['actif', 'defaut'];
  tableRefContentNameForConsultPageTile: string;
  idTableRefTargetForConsultUI: number; // Sert à idendifier la table de référence, qu'on affiche sont contenu tout au long de la consultation UI.
  identifiantPaginationTable: string = "tableRefContentConsult" // valeur affectée à l'id de la table de pagination
  subscriptions: Subscription = new Subscription();
  moduleName: string

  constructor(
    private tableReferenceService: TableReferenceService,
    private translateService: TranslateService,
    private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit(): void {
    this.moduleName = window["env"]?.appName;
    this.loadTableRefContent();
  }

  private loadTableRefContent(): void {
    this.subscriptions.add(this.route.paramMap.subscribe((params: ParamMap) => {
      let _idTabRefStr = params?.get("idTabRef");
      if (_idTabRefStr && !isNaN(+_idTabRefStr)) {
        this.idTableRefTargetForConsultUI = +_idTabRefStr;
        this.searchTableReferenceContent(this.buildDefaultCritereRechercheTablesRefContent());
      }
    }));
  }

  private buildDefaultCritereRechercheTablesRefContent(): CritereRechercheTableRefContent {
    let criteresPagination: CriteresPagination = new CriteresPagination();
    criteresPagination.page = 1; // En backend service la premiere page est d'indexe '1' contrairement au frontend ou l'indexe est '0'
    criteresPagination.pageSize = 50;
    criteresPagination.sortDirection = "asc";
    criteresPagination.sortField = "nom";

    let critereRechercheTableRefContent: CritereRechercheTableRefContent = new CritereRechercheTableRefContent();
    critereRechercheTableRefContent.idTableRef = this.idTableRefTargetForConsultUI;
    critereRechercheTableRefContent.criteresPagination = criteresPagination;

    return critereRechercheTableRefContent;
  }


  rechercherTabsRefsWhenPaginationOrSortEventIsTriggered(criteresPagination: CriteresPagination): void {
    let critereRechercheTableRefContent: CritereRechercheTableRefContent = new CritereRechercheTableRefContent();
    critereRechercheTableRefContent.criteresPagination = criteresPagination;
    critereRechercheTableRefContent.idTableRef = this.idTableRefTargetForConsultUI;

    this.searchTableReferenceContent(critereRechercheTableRefContent);
  }

  private searchTableReferenceContent(critereRechercheTableRefContent: CritereRechercheTableRefContent): void {
    if (critereRechercheTableRefContent) {
      this.subscriptions.add(this.tableReferenceService.obtainTableRefContent(critereRechercheTableRefContent).subscribe((result: TableRefContentWrapperDTO) => {
        if (result) {
          this.tableRefContentDTOs = result.tableRefContentDTOs;
          this.resultsLength = result.totalElements;
          this.tableRefContentNameForConsultPageTile = result.nomTableRef;
          this.checkIfTableHeadsLoadedDinamicallyByRemote(result);
        }
      }));
    }
  }

  private checkIfTableHeadsLoadedDinamicallyByRemote(tableRefContentWrapperDTO: TableRefContentWrapperDTO): void {
    if (tableRefContentWrapperDTO) {
      if ((tableRefContentWrapperDTO.propertiesNonStandardsWithEllipsisAndTitleAttribute
        && tableRefContentWrapperDTO.propertiesNonStandardsWithEllipsisAndTitleAttribute.length > 0)
        || (tableRefContentWrapperDTO.tableHeadsLabelsCode && tableRefContentWrapperDTO.tableHeadsLabelsCode.length > 0)) {

        if (tableRefContentWrapperDTO.propertiesNonStandardsWithEllipsisAndTitleAttribute
          && tableRefContentWrapperDTO.propertiesNonStandardsWithEllipsisAndTitleAttribute.length > 0) {
          tableRefContentWrapperDTO.propertiesNonStandardsWithEllipsisAndTitleAttribute.forEach(prop => {
            let isNotExistInEllipsis: boolean = !this.columnsHeadThatNeedEllipsis.includes(prop);
            let isNotExistInTitleAttribute: boolean = !this.columnsHeadThatNeedEllipsis.includes(prop);
            if (isNotExistInEllipsis) {
              this.columnsHeadThatNeedEllipsis.push(prop)
            }
            if (isNotExistInTitleAttribute) {
              this.columnsHeadThatNeedTitleProperty.push(prop)
            }
          });
        }
        if (tableRefContentWrapperDTO.tableHeadsLabelsCode && tableRefContentWrapperDTO.tableHeadsLabelsCode.length > 0) {
          this.displayedColumns = tableRefContentWrapperDTO.tableHeadsLabelsCode;
          this.headTitleByCodeColumn = new Map(Object.entries(tableRefContentWrapperDTO.paginationTableHeadsLabelsByCode));
        }
      } else {
        this.getHeadTitleByCodeColumn();
      }
    }
  }

  private getHeadTitleByCodeColumn() {
    let self = this;
    this.displayedColumns.forEach(function (codeColumn) {
      switch (codeColumn) {
        case "tri":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.ss.pilotage.tableref.valeur.tri"));
          break;
        case "nom":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.ss.pilotage.tableref.valeur.nom"));
          break;
        case "description":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.ss.pilotage.tableref.valeur.description"));
          break;
        case "code":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.ss.pilotage.tableref.valeur.code"));
          break;
        case "codeCn":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.ss.pilotage.tableref.valeur.codecn"));
          break;
        case "actif":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.ss.pilotage.tableref.valeur.actif"));
          break;
        case "id":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.ss.pilotage.tableref.valeur.ident"));
          break;
        case "defaut":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.ss.pilotage.tableref.valeur.defaut"));
          break;
        default:
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.ss.pilotage.tableref.valeur.actions"));
          break;
      }
    });
  }

  modifTableRefContent(tableRefContentDTO: TableRefContentDTO): void {
    if (tableRefContentDTO) {
      let target: string = "/edit-table-reference-content-item/" + this.idTableRefTargetForConsultUI + "/" + tableRefContentDTO.id;
      this.router.navigate([target]);
    }
  }

  addTableRefContentItem(): void {
    let target: string = "/add-table-reference-content-item/" + this.idTableRefTargetForConsultUI + "/" + this.tableRefContentNameForConsultPageTile;
    this.router.navigate([target]);
  }

  backToTablesRefPagination(): void {
    let target = "/piloter-tables-references/";
    this.router.navigate([target]);
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

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
