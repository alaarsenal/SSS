import { Component,  Input, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AlertModel } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-model';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { AlertService } from 'projects/sigct-service-ng-lib/src/lib/alert/alert.service';
import { Action, FormTopBarOptions } from 'projects/sigct-ui-ng-lib/src/lib/utils/form-top-bar-options';
import { Subscription, Observable } from 'rxjs';
import { AppelAnterieurDTO } from '../../../models/appel-anterieur-dto';
import { BaseUsagerContainerComponent } from '../base-usager-container/base-usager-container.component';
import { ConsultationFicheContainerComponent as SAConsultationFicheContainerComponent } from 'projects/infosante-ng-core/src/lib/components/containers/consultation-fiche/consultation-fiche-container.component';
import { ConsultationFicheContainerComponent as SOConsultationFicheContainerComponent } from 'projects/infosocial-ng-core/src/lib/components/containers/consultation-fiche/consultation-fiche-container.component';




@Component({
  selector: 'sigct-consulter-alertes-fiche-appel-usager-container',
  templateUrl: './consulter-alertes-fiche-appel-usager-container.component.html',
  styleUrls: ['./consulter-alertes-fiche-appel-usager-container.component.css']
})
export class ConsulterAlertesFicheAppelUsagerContainerComponent extends BaseUsagerContainerComponent implements OnInit, OnDestroy {

  @ViewChild('saConsultationContainer', { static: false })
  saConsultationContainer: SAConsultationFicheContainerComponent;

  @ViewChild('soConsultationContainer', { static: false })
  soConsultationContainer: SOConsultationFicheContainerComponent;

  idUsagerIdent: number;
  domaine: string;
  idAppel: number;
  idFicheAppel: number;

  formTopBarOptions: FormTopBarOptions;

  labelMenuTop: String = "";

  @Input("topBarreFixe")
  topBarreFixe: boolean = true;

  @Input("idUsager")
  set usagerId(idUsagerIdent: number) {
    this.initUsager(idUsagerIdent);
  }

  @Input("appelAnterieurDto")
  set appelAnterieurDto(dto: AppelAnterieurDTO) {
    if (dto) {
      this.domaine = dto.domaine;
      this.idAppel = dto.idAppel;
      this.idFicheAppel = dto.idFicheAppel;
    }
  }

  @ViewChild("alertContainer", { read: ViewContainerRef, static: true })
  container;

  subscriptions: Subscription = new Subscription();

  //**Constructeur */
  constructor(
    private alertStore: AlertStore,
    private alertService: AlertService,
    private translateService: TranslateService) {
    super();
  }

  ngOnInit() {
    this.alertStore.resetAlert();

    this.initTopBar();
    this.subscriptions.add(
      this.alertStore.state$.subscribe((state: AlertModel[]) => {
        this.alertService.show(this.container, state);
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  /**
   * Lorsqu'une navigation "externe" est enclenchée.
   * IMPORTANT: On doit sauvegarder les données à l'aide de navigation.sendBeacon()
   */
  autoSaveBeforeUnload(): void {
    //Comportement non demandé pour l'instant.
  }

  isDirty(): boolean {
    return this.domaine == 'SA'
      ? !this.saConsultationContainer?.canLeavePage()
      : !this.soConsultationContainer?.canLeavePage();
  }

  /**
   * Initialisation de l'usager. Récupère ses informations et les affichent à l'écran.
   * @param usagerId identifiant de l'usager
   */
  private initUsager(usagerId: number) {
    this.idUsagerIdent = usagerId;
  }

  private initTopBar() {
    this.labelMenuTop = this.translateService.instant("usager.alertes.consultationfiche");
    let topBarActions: Action[] = [];

    // Menu de boutons d'actions en haut et droite
    this.formTopBarOptions = {
      title: { icon: "fa fa-lg fa-file-text-o" },
      actions: topBarActions
    };
  }

}
