import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { IficheAppelApiService } from 'projects/sigct-service-ng-lib/src/lib/interface/ifiche-appel-api-service';
import { FicheAppelNonTermineeDTO } from 'projects/sigct-service-ng-lib/src/lib/models/fiche-appel-non-terminee-dto';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-fiches-appel-non-terminees-page',
  templateUrl: './fiches-appel-non-terminees-page.component.html',
  styleUrls: ['./fiches-appel-non-terminees-page.component.css'],
  providers: [DatePipe]
})
export class FichesAppelNonTermineesPageComponent implements OnInit {

  displayedColumns: string[] = ['dateDebutAppel', 'nom', 'prenom', 'dtNaiss', 'demandeInitiale', 'regionCodeAndName', 'actions'];;
  columnsHeadThatNeedTitleProperty: string[] = ['demandeInitiale'];
  columnsHeadThatNeedEllipsis: string[] = ['demandeInitiale'];

  fichesAppelNonTerminees: FicheAppelNonTermineeDTO[];

  headTitleByCodeColumn: Map<string, string> = new Map<string, string>();

  constructor(@Inject('IficheAppelApiService') private ficheAppelApiService: IficheAppelApiService,
    public datePipe: DatePipe,
    public router: Router,
    public translateService: TranslateService) { }

  ngOnInit(): void {
    this.mapDataNestedObjectToFlattenData();
    this.getHeadTitleByCodeColumn();
  }

  /**
     * Le DTO recu via le http service contient plusieurs niveau de données sous forme de nested objests.
     * Ces niveaux de données pause un probleme là où on veut rendre le composant générique.
     * La solution est de rendre toutes les données de même niveau et chaque nom de colonne correspond à une clé
     * dans la structure JSON.
     */
  mapDataNestedObjectToFlattenData() {
    this.ficheAppelApiService.getFichesAppelNonTerminees().pipe(
      map(res => {
        return res.map(item => {
          return new FicheAppelNonTermineeDTO(
            null,
            this.datePipe.transform(item.dateDebutAppel, "yyyy-MM-dd HH:mm"),
            item.dtNaiss ? this.datePipe.transform(item.dtNaiss, "yyyy-MM-dd") : null,
            item.regionCode ? item.regionCode + ' - ' + item.regionNom : null,
            item.id,
            item.idAppel,
            item.nom,
            item.prenom,
            item.demandeInitiale,
            item.saisieDifferee
          )
        });
      })
    ).subscribe((result: FicheAppelNonTermineeDTO[]) => {
      if (result) {
        this.fichesAppelNonTerminees = result;
      }
    });
  }

  private getHeadTitleByCodeColumn() {
    let self = this;
    this.displayedColumns.forEach(function (codeColumn) {
      switch (codeColumn) {
        case "dateDebutAppel":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.ss.appelnonterm.dateheureappel"));
          break;
        case "nom":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.ss.appelnonterm.nom"));
          break;
        case "prenom":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.ss.appelnonterm.prenom"));
          break;
        case "dtNaiss":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.ss.appelnonterm.datenaissance"));
          break;
        case "analyseSituation":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.so.appelnonterm.analysesituation"));
          break;
        case "demandeInitiale":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.sa.appelnonterm.deminit"));
          break;
        case "regionCodeAndName":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.ss.appelnonterm.region"));
          break;
        default:
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.ss.appelnonterm.actions"));
          break;
      }
    });
  }
}
