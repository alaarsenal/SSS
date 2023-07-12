import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { Action, FormTopBarOptions } from 'projects/sigct-ui-ng-lib/src/lib/utils/form-top-bar-options';
import { TranslateService } from '@ngx-translate/core';
import { ConsulterAlertesUiComponent } from '../../ui/consulter-alertes-ui/consulter-alertes-ui.component';
import { ConsultationAlertesDTO } from '../../../models/consultation-alertes-dto';




@Component({
  selector: 'sigct-consulter-alertes-usager-container',
  templateUrl: './consulter-alertes-usager-container.component.html',
  styleUrls: ['./consulter-alertes-usager-container.component.css']
})
export class ConsulterAlertesUsagerContainerComponent implements OnInit {

  public formTopBarOptions: FormTopBarOptions;

  @Output("consulterFicheAppel")
  consulterFicheAppel = new EventEmitter<ConsultationAlertesDTO>();

  @ViewChild("consulterAlertes") private consulterAlertes: ConsulterAlertesUiComponent;

  constructor(private translateService: TranslateService,
    ) { }

  ngOnInit(): void {
    this.initTopBar();
  }

  initTopBar() {
    let topBarActions: Action[] = [];

    let topBarActionSauvegarder: Action = { label: this.translateService.instant("usager.alertes.sauvegarder"), tooltip: this.translateService.instant("usager.alertes.sauvegarderinfobulle"), actionFunction: this.sauvegarderAlertes, compId: 'sauvegarderBtn', extraClass: "btn-primary form-btn" };
    let topBarActionAnnuler: Action = { label: this.translateService.instant("usager.alertes.annuler"), tooltip: this.translateService.instant("usager.alertes.annulerinfobulle"), actionFunction: this.annulerAlertes, compId: 'annulerBtn', extraClass: "btn-default btn-auto-disabled" };

    topBarActions = [topBarActionSauvegarder, topBarActionAnnuler];

    // Menu de boutons d'actions en haut et droite
    this.formTopBarOptions = {
      title: { icon: "fa fa-search fa-lg" },
      actions: topBarActions
    };

  }

  sauvegarderAlertes = (): void => {
    this.consulterAlertes.sauvegarder();
  }

  

  annulerAlertes = (): void => {
    this.consulterAlertes.rechercherAvecConfirmation();
  }

  onConsulterFicheAppel(consultationAlerteDTO: ConsultationAlertesDTO): void {
    this.consulterFicheAppel.emit(consultationAlerteDTO);
  }


}
