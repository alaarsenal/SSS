import { Component, Input, OnInit, SecurityContext } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FicheAppelNonTermineeDTO } from 'projects/sigct-service-ng-lib/src/lib/models/fiche-appel-non-terminee-dto';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'msss-fiches-appel-non-terminees',
  templateUrl: './fiches-appel-non-terminees.component.html',
  styleUrls: ['./fiches-appel-non-terminees.component.css'],
})
export class FichesAppelNonTermineesComponent implements OnInit {

  @Input("displayedColumns")
  public displayedColumns: string[];

  @Input("fichesAppelNonTerminees")
  public fichesAppelNonTerminees: FicheAppelNonTermineeDTO[];

  @Input("headTitleByCodeColumn")
  public headTitleByCodeColumn: Map<string, string>;

  @Input("columnsHeadThatNeedTitleProperty")
  public columnsHeadThatNeedTitleProperty: string[];

  @Input("columnsHeadThatNeedEllipsis")
  public columnsHeadThatNeedEllipsis: string[];

  constructor(public router: Router, public translateService: TranslateService, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
  }

  goToEditFicheAppelUI(idFicheAppel: number, idAppel: number, saisieDifferee: boolean) {
    const target = (saisieDifferee ? "saisie-differee" : "evaluation");
    this.router.navigate(['/editer', 'appel', idAppel, 'fiche', idFicheAppel, target]);
  }

  getHeadColumnTitle(codeColumn: string): string {
    return this.headTitleByCodeColumn.get(codeColumn);
  }

  getTitle(text: string, codeColumn: string): string {
    let code = this.columnsHeadThatNeedTitleProperty.find(code => code == codeColumn);
    return code ? text : '';
  }

  buildDataCellTable(cellData: string, codeColumn: string): string {
    if (cellData) {
      cellData = this.sanitizer.sanitize(SecurityContext.HTML, cellData);
      let fieldWithEllipsis: string = this.columnsHeadThatNeedEllipsis.find(code => code == codeColumn);
      if (fieldWithEllipsis) {
        let divStyle = "display: table; table-layout: fixed; width: 100%;";
        let spanStyle = "display: table-cell;overflow: hidden; text-overflow: ellipsis;white-space: nowrap;"
        return "<div style='" + divStyle + "'>" + "<span style='" + spanStyle + "'>" + cellData + "</span></div>"
      }
    }
    return cellData
  }
}
