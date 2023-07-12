import { Component, OnInit, OnDestroy } from '@angular/core';
import { RelanceDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/relance-dto';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { Subscription } from 'rxjs';
import { RelanceService } from 'projects/sigct-ui-ng-lib/src/lib/components/relance/relance-api.service';
import { FilterRechercheRelance } from 'projects/infosante-ng-core/src/lib/models/filter-recherche-relance-enum';
import { Tuple } from 'projects/sigct-ui-ng-lib/src/lib/utils/tuple';
import AuthenticationUtils from 'projects/sigct-service-ng-lib/src/lib/auth/authentication-utils';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-relances-page',
  templateUrl: './relances-page.component.html',
  styleUrls: ['./relances-page.component.css']
})
export class RelancesPageComponent implements OnInit, OnDestroy {

  inputOptionsFilterRelances: InputOptionCollection = {
    name: "inputOptionsFilterRelances",
    options: [
      {
        label: 'sigct.ss.listerelance.arealiser',
        value: FilterRechercheRelance.FILTER_RELANCES_A_REALISER,
        description: this.translateService.instant("sigct.ss.listerelance.arealiser")
      },
      {
        label: 'sigct.ss.listerelance.fermees',
        value: FilterRechercheRelance.FILTER_RELANCES_FERMEES_48H,
        description: this.translateService.instant("sigct.ss.listerelance.fermees")
      }
    ]
  };
  filterRechercheRelance: FilterRechercheRelance;
  relances: RelanceDTO[];

  private filterRelancesAssignees: boolean;
  private subscriptions = new Subscription();

  constructor(
    private router: Router,
    private relanceService: RelanceService,
    private translateService: TranslateService) { }

  ngOnInit(): void {
    this.chargerDonnees();
    //Observer la reponse du nombre des relances à réaliser
    this.subscriptions.add(
      this.relanceService.totalRelancesARealiserListener()
        .subscribe(_ => this.obtenirListeRelances())
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onChangeFilterRechercheRelances(option: string): void {
    this.relanceService.updateTotalRelancesARealiser();
    if (!option) {
      return;
    }
    this.obtenirListeRelances();
  }

  onConsulterFicheEvent(relance: RelanceDTO): void {
    if (relance.idAppel && relance.ficheAppelId) {
      this.router.navigate(["/consulter", "appel", relance.idAppel, "fiche", relance.ficheAppelId]);
    }
  }

  private chargerDonnees(): void {
    const initialModule = this.getModule() == 'infosante' ? 'SA' : 'SO'
    this.filterRelancesAssignees = !AuthenticationUtils.hasRole('ROLE_' + initialModule + '_APPEL_RELANCE_TOUS');
    this.filterRechercheRelance = FilterRechercheRelance.FILTER_RELANCES_A_REALISER;
  }

  private obtenirListeRelances() {
    let filters: Tuple[] = [
      { key: "filterRechercheRelance", value: this.filterRechercheRelance },
      { key: "filterRelancesAssignees", value: this.filterRelancesAssignees }
    ];
    this.subscriptions.add(
      this.relanceService.findRange(filters).subscribe(
        (results: RelanceDTO[]) => {
          this.relances = results;
        }
      )
    );
  }

  public getModule(): string {
    return this.relanceService.getModule();
  }

}
