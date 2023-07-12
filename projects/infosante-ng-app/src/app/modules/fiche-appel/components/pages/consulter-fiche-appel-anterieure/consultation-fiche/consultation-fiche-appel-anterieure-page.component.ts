import { Component, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FicheAppelDTO } from 'projects/infosante-ng-core/src/lib/models/fiche-appel-dto';
import { FicheAppelApiService } from 'projects/infosante-ng-core/src/lib/services/fiche-appel-api.service';
import { MenuItem } from 'projects/sigct-ui-ng-lib/src/lib/components/menus/menu-interface';
import { FormTopBarOptions } from 'projects/sigct-ui-ng-lib/src/lib/utils/form-top-bar-options';
import { Subscription, Observable } from 'rxjs';
import { HasAutoSave } from '../../../../services/auto-save-guard.service';
import { ConsultationFicheContainerComponent } from 'projects/infosante-ng-core/src/lib/components/containers/consultation-fiche/consultation-fiche-container.component';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertModel, AlertType } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import AlertModelUtils from 'projects/sigct-service-ng-lib/src/lib/utils/alert-model-utils';

@Component({
  selector: 'app-consultation-appel-anterieure-page',
  templateUrl: './consultation-fiche-appel-anterieure-page.component.html',
  styleUrls: ['./consultation-fiche-appel-anterieure-page.component.css']
})
export class ConsultationFicheAppelAnterieurePageComponent implements OnInit, OnDestroy, HasAutoSave {

  @ViewChild('saConsultationFicheContainer', { static: true })
  saConsultationFicheContainer: ConsultationFicheContainerComponent;

  @ViewChild("alertContainer", { read: ViewContainerRef, static: true })
  alertContainer;

  ficheAppelDto: FicheAppelDTO;

  formTopBarOptions: FormTopBarOptions = {
    title: { icon: "fa fa-lg fa-file-text-o" },
    actions: [],
  };

  leftMenuItems: MenuItem[] = [];

  private subscriptions: Subscription = new Subscription();

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private alertStore: AlertStore,
    private alertService: AlertService,
    private ficheAppelApiService: FicheAppelApiService,
    private translateService: TranslateService) {
  }

  ngOnInit() {
    // On souscrit au changement d'url produit par les onglets afin de mettre à jour l'apparence des onglets et les liens du menu gauche.
    this.subscriptions.add(
      this.activatedRoute.params.subscribe((params: Params) => {
        const idAppel: string = params["idAppel"];
        const idFicheAppel: string = params["idFicheAppel"];
        this.init(idAppel, idFicheAppel);
      })
    );

    this.subscriptions.add(
      this.alertStore.state$.subscribe((state: AlertModel[]) => {
        this.alertService.show(this.alertContainer, state);
      })
    );

    this.subscriptions.add(
      // Crée une alerte pour si une alerte est reçue en paramètre du routing
      this.activatedRoute.queryParams.subscribe((params: Params) => {
        const alertParam: string = params["alert"];
        if (alertParam) {
          const confirmation: string = this.translateService.instant('ss.msg.succes.confirmation');
          const message: string = this.translateService.instant(alertParam);
          const alertModel: AlertModel = AlertModelUtils.createAlertModel([message], confirmation, AlertType.SUCCESS);
          this.alertStore.addAlert(alertModel);
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.alertStore.resetAlert();
  }

  /**
   * Lorsqu'une navigation "interne" est enclenchée. Le routing attend une réponse positive de cette méthode avant
   * de s'exécuter, laissant le temps de sauvegarder les données avant de poursuivre.
   */
  autoSaveBeforeRoute(): Observable<boolean> | Promise<boolean> | boolean {
    // Rien à sauvegarder
    return this.saConsultationFicheContainer?.autoSaveBeforeRoute();
  }

  /**
   * Redirection vers la recherche d'usagers
   */
  actionRetourListe = (): void => {
    this.router.navigate(["/rechercher"]);
  }

  /**Naviger vers la page de la correction de la fiche d'appel
   * @param idFicheAppel
   */
  onCorrigerFicheAppelEvent(): void {
    this.router.navigate(["/corriger", "appel", this.ficheAppelDto.idAppel, "fiche", this.ficheAppelDto.id]);
  }

  /**
   * Récupère les données nécessaires à l'initialisation du composent et ajuste les liens dans le menu vertical.
   * @param idAppel
   * @param idFicheAppel
   */
  private init(idAppel: string, idFicheAppel: string): void {
    if (+idAppel && +idFicheAppel) {
      this.leftMenuItems = [
        {
          id: "menuItemConsultationFicheAppelAnterieurePageComponentRechercherId",
          title: "sigct.ss.r_appels.menuvert.btnrechercherinfobulle",
          link: "/rechercher",
          icon: "fa fa-search",
          disabled: false,
          visible: true
        },
        {
          id: "menuItemConsultationFicheAppelAnterieurePageComponentConsulterId",
          title: "sigct.ss.r_appels.menuvert.btnconsulterinfobulle",
          link: "/consulter/appel/" + idAppel + "/fiche/" + idFicheAppel,
          icon: "fa fa-file-text-o",
          disabled: false,
          visible: true
        },
      ];

      this.subscriptions.add(
        this.ficheAppelApiService.getFicheAppel(+idFicheAppel).subscribe((resultDto: FicheAppelDTO) => {
          this.ficheAppelDto = resultDto;
        })
      );
    }
  }

}
