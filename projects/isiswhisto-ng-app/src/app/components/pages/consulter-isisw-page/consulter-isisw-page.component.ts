import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef } from '@angular/core';
import { MenuItem } from 'projects/sigct-ui-ng-lib/src/lib/components/menus/menu-interface';
import { FormTopBarOptions, Action } from 'projects/sigct-ui-ng-lib/src/lib/utils/form-top-bar-options';
import { Subscription } from 'rxjs';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { IsiswApiService } from 'projects/isiswhisto-ng-core/src/lib/services/isiswhisto-api.service';
import { AlertModel } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-consulter-isisw-page',
  templateUrl: './consulter-isisw-page.component.html',
  styleUrls: ['./consulter-isisw-page.component.css']
})
export class ConsulterIsiswPageComponent implements OnInit, OnDestroy {

  @ViewChild("alertContainer", { read: ViewContainerRef, static: true })
  alertContainer: ViewContainerRef;

  leftMenuItems: MenuItem[];

  formTopBarOptions: FormTopBarOptions = {
    title: { icon: "fa fa-lg fa-file-text-o" },
    actions: []
  };
  idFicheIsisw: number;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private alertStore: AlertStore,
    private alertService: AlertService,
    private translateService: TranslateService) {
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.activatedRoute.params.subscribe((params: Params) => {
        const idAppel: string = params["idAppel"];
        this.idFicheIsisw = idAppel ? +idAppel : null;
        this.initLeftMenu();
      })
    );
    this.subscriptions.add(
      this.alertStore.state$.subscribe((state: AlertModel[]) => {
        this.alertService.show(this.alertContainer, state);
      })
    );
    this.initTopBar();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  /**
   * Envoie un message de fermeture au iFrame.
   */
  navigateToRecherche = (): void => {
    this.router.navigate(["/rechercher"]);
  }

  /**
   * Vérifie si l'application s'exécute dans un iFrame.
   * @returns
   */
  private isInFrame(): boolean {
    return window !== window.parent;
  }

  /**
   * Initialise le contenu de la barre de titre.
   */
  private initTopBar() {
    let topBarActions: Action[] = [];
    // Affiche le bouton Retour uniquement lorsque l'application est ouverte dans un iFrame.
    if (this.isInFrame()) {
      let actionReturn: Action = {
        tooltip: this.translateService.instant("sigct.ss.f.revenir.from.isisw.rech"),
        actionFunction: this.navigateToRecherche,
        icon: "fa fa-times fa-lg",
        compId: 'btn-retour',
        extraClass: "btn-default btn-auto-disabled"
      };
      topBarActions.push(actionReturn);
    }
    this.formTopBarOptions.actions = topBarActions;
  }

  private initLeftMenu(): void {
    this.leftMenuItems = [
      {
        id: "left-menu-item-rechercher",
        title: "sigct.ss.c_appelsisisw.btnrechercher",
        link: "/rechercher",
        icon: "fa fa-search",
        disabled: false,
        visible: true
      },
      {
        id: "left-menu-item-consulter",
        title: "sigct.ss.c_appelsisisw.btnconsulter",
        link: "/consulter/" + this.idFicheIsisw,
        icon: "fa fa-user",
        disabled: false,
        visible: true
      }
    ];

  }

}
