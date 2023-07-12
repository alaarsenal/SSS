import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild, SecurityContext } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CodePostalPipe } from '../../pipes/code-postal-pipe/code-postal.pipe';
import { TelephonePipe } from '../../pipes/telephone-pipe/telephone.pipe';
import { CriteresPagination } from './criteres-pagination';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'msss-table-pagination',
  templateUrl: './table-pagination.component.html',
  styleUrls: ['./table-pagination.component.css'],
  providers: [DatePipe, CodePostalPipe, TelephonePipe]
})
export class TablePaginationComponent implements OnInit {

  @Input("identifiantPaginationTable")
  identifiantPaginationTable: string = "pagination-table" // valeur par défaut

  @Input("displayedColumns")
  public displayedColumns: string[];

  @Input("dataSource")
  public dataSource: any[];

  @Input("headTitleByCodeColumn")
  public headTitleByCodeColumn: Map<string, string>;

  @Input("columnsHeadThatNeedTitleProperty")
  public columnsHeadThatNeedTitleProperty: string[];

  @Input("columnsHeadThatNeedEllipsis")
  public columnsHeadThatNeedEllipsis: string[];

  @Input("columnsHeadThatNeedConvertFormBooleanToMark")
  public columnsHeadThatNeedConvertFormBooleanToMark: string[];

  @Input("columnsHeadThatNeedDateFormatAAAAMMJJ")
  public columnsHeadThatNeedDateFormatAAAAMMJJ: string[];

  @Input("columnsHeadThatNeedDateFormatAAAAMMJJHHMI")
  public columnsHeadThatNeedDateFormatAAAAMMJJHHMI: string[];

  @Input("columnsHeadThatNeedDateFormatAAAAMMJJHHMISS")
  public columnsHeadThatNeedDateFormatAAAAMMJJHHMISS: string[];

  @Input("columnsHeadThatNeedPostalCodeFormat")
  public columnsHeadThatNeedPostalCodeFormat: string[];

  @Input("columnsHeadThatNeedTelephoneFormat")
  public columnsHeadThatNeedTelephoneFormat: string[];

  @Input("columnsHeadWithNoSort")
  public columnsHeadWithNoSort: string[];

  @Input("isConsultBtnDisplayed")
  public isConsultBtnDisplayed: boolean = false;

  @Input("isModifBtnDisplayed")
  public isModifBtnDisplayed: boolean = false;

  @Input("isSupprBtnDisplayed")
  public isSupprBtnDisplayed: boolean = false;

  /**
   * Css du bouton Consulter. Par défaut "fa-eye"
   */
   @Input()
   public consultBtnCssClass: string = "fa-eye";

  @Input("defaultPageSize")
  public defaultPageSize: number;

  @ViewChild(MatPaginator, { static: true })
  public paginator: MatPaginator;

  @ViewChild(MatSort, { static: true })
  public sort: MatSort;

  @Output("rechercherTabContent")
  rechercherTabContentEvent: EventEmitter<any> = new EventEmitter();

  @Output("consultElement")
  consultElementEvent: EventEmitter<any> = new EventEmitter();

  @Output("modifElement")
  modifElementEvent: EventEmitter<any> = new EventEmitter();

  @Output("supprimerElement")
  supprimerElementEvent: EventEmitter<any> = new EventEmitter();

  _resultsLength: number;

  @Input("resultsLength")
  set resultsLength(value: number) {
    this.paginator.length = value;
    this._resultsLength = value;
  };

  @Input("defaultsortField")
  defaultsortField: string;

  constructor(public router: Router,
    public translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private datePipe: DatePipe,
    private codePostalPipe: CodePostalPipe,
    private sanitizer: DomSanitizer,
    private telephonePipe: TelephonePipe) { }

  ngOnInit(): void {
  }

  /**
   * Se positionne sur la première page de résultats.
   */
  firstPage():void{
    this.paginator.firstPage();
  }

  /**
   * Se positionne sur la dernière page de résultats.
   */
   lastPage():void{
    this.paginator.lastPage();
  }

  consultElement(element: any) {
    this.consultElementEvent.emit(element);
  }

  modifElement(element: any) {
    this.modifElementEvent.emit(element);
  }

  supprimerElement(element: any) {
    this.supprimerElementEvent.emit(element);
  }

  getHeadColumnTitle(codeColumn: string): string {
    return this.headTitleByCodeColumn.get(codeColumn);
  }

  getTitle(text: string, codeColumn: string): string {
    let code = this.columnsHeadThatNeedTitleProperty?.find(code => code == codeColumn);
    code = this.sanitizer.sanitize(SecurityContext.HTML, code);
    return code ? text?.replace(/(<([^>]+)>)/gi, "") : '';
  }

  buildDataCellTable(cellData: string, codeColumn: string): string {
    if (cellData) {
      const fieldConvertedFromBooleanToMark: string = this.columnsHeadThatNeedConvertFormBooleanToMark?.find(code => code == codeColumn);
      const fieldDateFormatAAAAMMJJHHMISS: string = this.columnsHeadThatNeedDateFormatAAAAMMJJHHMISS?.find(code => code == codeColumn);
      const fieldDateFormatAAAAMMJJHHMI: string = this.columnsHeadThatNeedDateFormatAAAAMMJJHHMI?.find(code => code == codeColumn);
      const fieldDateFormatAAAAMMJJ: string = this.columnsHeadThatNeedDateFormatAAAAMMJJ?.find(code => code == codeColumn);
      const fieldPostalCodeFormat: string = this.columnsHeadThatNeedPostalCodeFormat?.find(code => code == codeColumn);
      const fieldTelephoneFormat: string = this.columnsHeadThatNeedTelephoneFormat?.find(code => code == codeColumn);
      const fieldWithEllipsis: string = this.columnsHeadThatNeedEllipsis?.find(code => code == codeColumn);
      if (fieldWithEllipsis) {
        const divStyle = "display: table; table-layout: fixed; width: 100%;";
        const spanStyle = "display: table-cell;overflow: hidden; text-overflow: ellipsis;white-space: nowrap; padding-top: 2px;"
        cellData = this.sanitizer.sanitize(SecurityContext.HTML, cellData);
        const data: string = cellData.replace(/(<([^>]+)>)/gi, "");
        return "<div style='" + divStyle + "' title=\"" + data + "\"><span style='" + spanStyle + "'>" + data + "</span></div>"
      } else if (fieldConvertedFromBooleanToMark) {
        return "<center><i class='fa fa-check' aria-hidden='true' style='color:green;'></i></center>";
      } else if (fieldDateFormatAAAAMMJJHHMISS) {
        return this.datePipe.transform(cellData, "yyyy-MM-dd HH:mm:ss");
      } else if (fieldDateFormatAAAAMMJJHHMI) {
        return this.datePipe.transform(cellData, "yyyy-MM-dd HH:mm");
      } else if (fieldDateFormatAAAAMMJJ) {
        return "<center>" + this.datePipe.transform(cellData, "yyyy-MM-dd") + "</center>";
      } else if (fieldPostalCodeFormat) {
        return this.codePostalPipe.transform(cellData);
      } else if (fieldTelephoneFormat) {
        return this.telephonePipe.transform(cellData);
      }
      return cellData;
    }
    if (cellData === "0" && codeColumn != "defaut" && codeColumn != "actif") {
      return cellData;
    }
    return "";
  }

  ngAfterContentInit() {
    if (this.sort) {
      this.sort.sortChange.subscribe((sort: Sort) => {
        if (sort) {
          // Si le tri est activé on revient vers la page numéro '0'
          this.paginator.pageIndex = 0;
          let criteresPagination: CriteresPagination = this.buildPaginationcriterion();

          this.rechercherTabContentEvent.emit(criteresPagination)
        }
      });
    }

    if (this.paginator) {
      this.paginator.page.subscribe((page: PageEvent) => {
        let criteresPagination: CriteresPagination = this.buildPaginationcriterion();

        this.rechercherTabContentEvent.emit(criteresPagination)
      });
      this.cdr.detectChanges();
    }
  }

  private buildPaginationcriterion(): CriteresPagination {
    let criteresPagination: CriteresPagination = new CriteresPagination();
    // Une magoration de '1' est fait car le numéro de page en backend commence par 1 par contre
    // en Mattable la premiere page est d'indexe '0'
    criteresPagination.page = this.paginator.pageIndex + 1;
    criteresPagination.pageSize = this.paginator.pageSize;
    criteresPagination.sortDirection = this.sort.direction.toString();
    criteresPagination.sortField = this.sort.active;

    return criteresPagination;
  }

  public hasSort(col): boolean {


    let trouv: boolean = true;

    if (this.columnsHeadWithNoSort === undefined) {
      return trouv;
    }

    for (var i = 0; i < this.columnsHeadWithNoSort.length; i++) {
      if (this.columnsHeadWithNoSort[i] == col) {
        trouv = false;
      }
    }

    return trouv;
  }

}
