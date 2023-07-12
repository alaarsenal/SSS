import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'projects/sigct-ui-ng-lib/src/lib/components/menus/menu-interface';
import { leftMenu } from '../../leftMenu';

@Component({
  selector: 'app-suivi-etat-enregistrement-page',
  templateUrl: './suivi-etat-enregistrement-page.component.html',
  styleUrls: ['./suivi-etat-enregistrement-page.component.css']
})
export class SuiviEtatEnregistrementPageComponent implements OnInit {

  public leftMenuItems: MenuItem;

  constructor() { }

  ngOnInit() {
    this.leftMenuItems = leftMenu.leftMenuItems;
  }

}
