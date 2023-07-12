import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'projects/sigct-ui-ng-lib/src/lib/components/menus/menu-interface';
import { leftMenu } from '../../leftMenu';
import { ConsultationAlertesDTO } from 'projects/usager-ng-core/src/lib/models/consultation-alertes-dto';
import { Router } from '@angular/router';

@Component({
  selector: 'app-consulter-alertes-usager-page',
  templateUrl: './consulter-alertes-usager-page.component.html',
  styleUrls: ['./consulter-alertes-usager-page.component.css']
})
export class ConsulterAlertesUsagerPageComponent implements OnInit {

  public leftMenuItems: MenuItem;

  protected menuItemConsulterAlertes: MenuItem;
  protected menuItemConsulterFiche: MenuItem;

  constructor(private router: Router) { }

  ngOnInit() {
   this.creerLeftMenuItems();
  }

  /**
  * Création des items de menu et assemblage du menu gauche.
  */
  creerLeftMenuItems(): void {
    this.menuItemConsulterAlertes = {
      id: "menuItemConsulterAlertesUsagerPageComponentConsulterId",
      title: "usager.alertes.consulteralertes",
      link: "/consulter-alertes",
      icon: "fa fa-search",
      disabled: false,
      visible: true
    };

    this.menuItemConsulterFiche = {
      id: "menuItemConsulterAlertesUsagerPageComponentConsultationId",
      title: "usager.alertes.consultationfiche",
      link: "/",
      icon: "fa file-text",
      disabled: true,
      visible: false
    };

    this.leftMenuItems = [
      this.menuItemConsulterAlertes,
      this.menuItemConsulterFiche,
    ];

  }

  onConsulterFicheAppel(consultationAlerteDTO: ConsultationAlertesDTO): void {
    let target = "/" + consultationAlerteDTO.idUsager + "/alertes/fiche-appel/" + consultationAlerteDTO.type + "/" + consultationAlerteDTO.idFicheAppel + "/consulter";
    this.router.navigate([target]);
  }

}
