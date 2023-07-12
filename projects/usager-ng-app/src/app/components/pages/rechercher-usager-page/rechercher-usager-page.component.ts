import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from '../../../../../../sigct-ui-ng-lib/src/lib/components/menus/menu-interface';
import { leftMenu } from '../../leftMenu';

@Component({
  selector: 'app-recherche-usager',
  templateUrl: './rechercher-usager-page.component.html',
  styleUrls: ['./rechercher-usager-page.component.css'],
  providers: [DatePipe]
})

export class RechercherUsagerPageComponent implements OnInit {

  leftMenuItems: MenuItem;

  //**Constructeur */
  constructor(private router: Router) {
  }

  ngOnInit() {
    this.leftMenuItems = leftMenu.leftMenuItems;
  }
  /**
   * Redirection vers l'inteface de consultation d'un usager
   */
  onConsulterUsager(event: number): void {
    if (event) {
      let target = "/" + event + "/consulter";
      this.router.navigate([target]);
    } else {
      //TODO 
      console.error("Identifiant de l'usager abesent");
    }
  }

  /**
   * Redirection vers l'inteface d'édition d'un usager
   */
  onEditerUsager(event: number): void {
    if (event) {
      let target = "/" + event + "/editer";
      this.router.navigate([target]);
    } else {
      //TODO 
      console.error("Identifiant de l'usager abesent");
    }
  }

  /**
   * Redirection vers l'inteface de fusion d'usagers
   */
  onFusionnerUsager(event: number[]): void {
    if (event?.length == 2) {
      this.router.navigate(["/fusionner", event[0], event[1]]);
    } else {
      console.error("onFusionnerUsager() -> Identifiants des usagers incorrects");
    }
  }

  /**
   * Redirection vers l'inteface d'enregistrements d'un usager
   */
  onConsulterEnregistrementsUsager(event: number): void {
    if (event) {
      let target = "/" + event + "/enregistrements";
      this.router.navigate([target]);
    } else {
      //TODO 
      console.error("Identifiant de l'usager absent");
    }
  }
}