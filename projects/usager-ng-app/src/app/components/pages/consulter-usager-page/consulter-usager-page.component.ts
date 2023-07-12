import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from 'projects/sigct-service-ng-lib/src/lib/auth/authentication.service';
import { AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import { FormTopBarOptions } from 'projects/sigct-ui-ng-lib/src/lib/utils/form-top-bar-options';
import { UsagerService } from 'projects/usager-ng-core/src/lib/services/usager.service';
import { BaseUsagerPageComponent } from '../base-usager-page/base-usager-page.component';


@Component({
  selector: 'app-consulter-usager',
  templateUrl: './consulter-usager-page.component.html',
  styleUrls: ['./consulter-usager-page.component.css']
})
export class ConsulterUsagerPageComponent extends BaseUsagerPageComponent implements OnInit, OnDestroy {

  formTopBarOptions: FormTopBarOptions;

  constructor(router: Router,
    route: ActivatedRoute,
    authenticationService: AuthenticationService,
    appContextStore: AppContextStore,
    usagerService: UsagerService) {
      super(route, router, authenticationService, appContextStore, usagerService);
  }

  ngOnInit() {
    super.ngOnInit();

    this.formTopBarOptions = {
      title: { icon: "fa fa fa-user fa-lg" },
      actions: [
        { label: "Modifier", actionFunction: this.actionModifierUsager, compId: 'modifierBtn', extraClass: "btn-primary  btn-auto-disabled" },
        { label: "Fermer", actionFunction: this.actionRetourListe, icon: "fa fa-times fa-lg", compId: 'retourBtn', extraClass: "btn btn-default btn-sm form-btn" },
      ]
    };

  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  /**
   * Redirection vers la recherche d'usagers
   */
  actionRetourListe = (): void => {
    let target = '/recherche';
    this.router.navigate([target]);
  }

  /**
   * Redirection vers l'inteface d'édition de l'usager.
   */
  actionModifierUsager = (): void => {
    let target = '/' + this.idUsager + '/editer';
    this.router.navigate([target]);
  }
}
