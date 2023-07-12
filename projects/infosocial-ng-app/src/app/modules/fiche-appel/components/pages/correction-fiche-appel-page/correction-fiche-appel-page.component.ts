import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef, HostListener } from '@angular/core';
import { HasAutoSave } from '../../../services/auto-save-guard.service';
import { FicheAppelSocialDTO } from 'projects/infosocial-ng-core/src/lib/models';
import { FormTopBarOptions } from 'projects/sigct-ui-ng-lib/src/lib/utils/form-top-bar-options';
import { MenuItem } from 'projects/sigct-ui-ng-lib/src/lib/components/menus/menu-interface';
import { Subscription, Observable } from 'rxjs';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import { AlertModel } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { FicheAppelApiService } from 'projects/infosocial-ng-core/src/lib/services';
import { MaterialModalDialogService } from 'projects/sigct-service-ng-lib/src/lib/material-modal-dialog/material-modal-dialogl.service';
import { CorrectionFicheAppelWrapperComponent } from 'projects/infosocial-ng-core/src/lib/components/containers/correction-fiche-appel-wrapper/correction-fiche-appel-wrapper.component';

@Component({
  selector: 'app-correction-fiche-appel-page',
  templateUrl: './correction-fiche-appel-page.component.html',
  styleUrls: ['./correction-fiche-appel-page.component.css']
})
export class CorrectionFicheAppelPageComponent implements OnInit, OnDestroy, HasAutoSave {

  @ViewChild("alertContainer", { read: ViewContainerRef, static: true })
  alertContainer;

  @ViewChild('correctionFicheWrapper', { static: true })
  correctionFicheWrapper: CorrectionFicheAppelWrapperComponent;

  ficheAppelDto: FicheAppelSocialDTO;

  formTopBarOptions: FormTopBarOptions = {
    title: { icon: "fa fa-lg fa-file-text-o" },
    actions: [],
  };

  leftMenuItems: MenuItem[] = [];

  private subscriptions: Subscription = new Subscription();
  private forceReturn: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private alertStore: AlertStore,
    private alertService: AlertService,
    private materialModalDialogService: MaterialModalDialogService,
    private ficheAppelApiService: FicheAppelApiService) {
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
    this.forceReturn = false;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.alertStore.resetAlert();
  }

  /**
   * Lance la sauvegarde automatique lorsque le navigateur se ferme, ou qu'une navigation
   * externe s'effectue (ex: retour au portail).
   * @param event
   */
  @HostListener('window:beforeunload ', ['$event'])
  beforeUnload(event: any) {
    if (!this.correctionFicheWrapper.canLeavePage()) {
      event.returnValue = "popup";
    }
  }

  /**
   * Lorsqu'une navigation "interne" est enclenchée. Le routing attend une réponse positive de cette méthode avant
   * de s'exécuter, laissant le temps de sauvegarder les données avant de poursuivre.
   */
  autoSaveBeforeRoute(): Observable<boolean> | Promise<boolean> | boolean {
    if (!this.forceReturn && !this.correctionFicheWrapper.canLeavePage()) {
      return this.materialModalDialogService.popupConfirmer("ss-iu-a00004");
    } else {
      return true;
    }
  }

  onWrapperReturnEvent(forceReturn: boolean): void {
    this.forceReturn = forceReturn;
    this.router.navigate(["/consulter", "appel", this.ficheAppelDto.idAppel, "fiche", this.ficheAppelDto.id]);
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
          id: "menuItemCorrectionFicheAppelPageComponentRechercherId",
          title: "sigct.ss.r_appels.menuvert.btnrechercherinfobulle",
          link: "/rechercher",
          icon: "fa fa-search",
          disabled: false,
          visible: true
        },
        {
          id: "menuItemCorrectionFicheAppelPageComponentConsulterId",
          title: "sigct.ss.r_appels.menuvert.btnconsulterinfobulle",
          link: "/consulter/appel/" + idAppel + "/fiche/" + idFicheAppel,
          icon: "fa fa-file-text-o",
          disabled: false,
          visible: true
        },
      ];
      this.subscriptions.add(
        this.ficheAppelApiService.getFicheAppel(+idFicheAppel).subscribe(
          (resultDto: FicheAppelSocialDTO) => {
            this.ficheAppelDto = resultDto;
          })
      );
    }
  }

}
