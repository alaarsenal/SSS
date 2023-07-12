import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AppelAdmParameterService } from 'projects/sigct-service-ng-lib/src/lib/services/appel-adm-parameter/appel-adm-parameter.service';
import { Subscription } from 'rxjs';
import { CriteresParamSystm } from '../piloter-parametres-systeme-section-criteres-recherche/criteres-param-systm';
import { PiloterParametresSystemeSectionCriteresRechercheComponent } from '../piloter-parametres-systeme-section-criteres-recherche/piloter-parametres-systeme-section-criteres-recherche.component';
import { CriteresPagination } from '../table-pagination/criteres-pagination';
import { CritereRechercheParametresSysteme } from './critere-recherche-parametres-systeme';
import { ParametreSystemeDTO } from './parametre-systeme-dto';
import { ParamsSystemeWrapperDTO } from './params-systeme-wrapper-dto';

@Component({
  selector: 'msss-piloter-parametres-systeme',
  templateUrl: './piloter-parametres-systeme.component.html',
  styleUrls: ['./piloter-parametres-systeme.component.css']
})
export class PiloterParametresSystemeComponent implements OnInit, OnDestroy {

  @ViewChild(PiloterParametresSystemeSectionCriteresRechercheComponent, { static: true })
  piloterParametresSystemeSectionCriteresRechercheComponent: PiloterParametresSystemeSectionCriteresRechercheComponent

  parametreSystemeDTOs: ParametreSystemeDTO[];
  resultsLength: number = 0; // Correspond au nombre de parametres systemes trouvés (le terme length correspond à la propriété de MatPaginator).
  defaultsortField: string = "code" // Le nom de la colonne de tri par défaut.
  defaultPageSize: number = 50 // Le nombre d'éléments par page par défaut.
  displayedColumns: string[] = ['code', 'contenu', 'actions'];;
  columnsHeadThatNeedTitleProperty: string[] = ['contenu'];
  columnsHeadThatNeedEllipsis: string[] = ['contenu'];
  headTitleByCodeColumn: Map<string, string> = new Map<string, string>();
  subscription: Subscription = new Subscription();
  css: string;

  critereRechercheParametresSysteme: CritereRechercheParametresSysteme;

  constructor(private appelAdmParameterService: AppelAdmParameterService,
    private translateService: TranslateService,
    private router: Router) { }

  ngOnInit(): void {
    this.getHeadTitleByCodeColumn();
    this.loadAllParametresSysteme();
    this.piloterParametresSystemeSectionCriteresRechercheComponent.elementWithDefaultCursor();
    this.css = this.appelAdmParameterService.getCssOnModuleNom();
  }

  private getHeadTitleByCodeColumn() {
    let self = this;
    this.displayedColumns.forEach(function (codeColumn) {
      switch (codeColumn) {
        case "code":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.sa.pilotage.parametresys.code"));
          break;
        case "contenu":
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.sa.pilotage.parametresys.contenu"));
          break;
        default:
          self.headTitleByCodeColumn.set(codeColumn, self.translateService.instant("sigct.sa.pilotage.parametresys.actions"));
          break;
      }
    });
  }

  private loadAllParametresSysteme(): void {
    this.searchParametresSysteme(this.buildDefaultCritereRechercheParamsSysteme());
  }

  private searchParametresSysteme(critereRechercheParametresSysteme: CritereRechercheParametresSysteme): void {
    if (critereRechercheParametresSysteme) {
      this.subscription.add(
        this.appelAdmParameterService.getAllParametresSysteme(critereRechercheParametresSysteme).subscribe((result: ParamsSystemeWrapperDTO) => {
          if (result) {
            this.parametreSystemeDTOs = result.parametreSystemeDTOs;
            this.resultsLength = result.totalElements;
          }
        }));
    }
  }

  private buildDefaultCritereRechercheParamsSysteme(): CritereRechercheParametresSysteme {
    let criteresPagination: CriteresPagination = new CriteresPagination();
    criteresPagination.page = 1; // En backend service la premiere page est d'indexe '1' contrairement au frontend ou l'indexe est '0'
    criteresPagination.pageSize = 50;
    criteresPagination.sortDirection = "asc";
    criteresPagination.sortField = "code";

    let critereRechercheParametresSysteme: CritereRechercheParametresSysteme = new CritereRechercheParametresSysteme();
    critereRechercheParametresSysteme.criteresPagination = criteresPagination;

    return critereRechercheParametresSysteme;
  }

  rechercherParametresSystemeWhenPaginationOrSortEventIsTriggered(criteresPagination: CriteresPagination): void {
    this.critereRechercheParametresSysteme.criteresPagination = criteresPagination;
    this.searchParametresSysteme(this.critereRechercheParametresSysteme);
  }

  rechercherParametresSystemeWhenRechercherBtnIsTriggered(criteresParamSystm: CriteresParamSystm): void {
    this.searchByCodeFilter(criteresParamSystm?.code);
  }

  rechercherParametresSystemeWhenEnterKeydownIsTriggered(code: string) {
    this.searchByCodeFilter(code);
  }

  private searchByCodeFilter(code: string): void {
    if(!this.critereRechercheParametresSysteme){
      this.critereRechercheParametresSysteme = this.buildDefaultCritereRechercheParamsSysteme();
    }
    if (this.critereRechercheParametresSysteme) {
      this.critereRechercheParametresSysteme.code = code;
      this.searchParametresSysteme(this.critereRechercheParametresSysteme);
    }
  }

  modifParametresSysteme(parametreSystemeDTO: ParametreSystemeDTO) {
    if (parametreSystemeDTO) {
      let target = "/editer-params-systeme/" + parametreSystemeDTO.code;
      this.router.navigate([target]);
    }
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

}
