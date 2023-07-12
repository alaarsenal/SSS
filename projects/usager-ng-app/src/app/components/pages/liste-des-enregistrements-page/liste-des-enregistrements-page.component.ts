import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'projects/sigct-ui-ng-lib/src/lib/components/menus/menu-interface';
import { leftMenu } from '../../leftMenu';

@Component({
  selector: 'app-liste-des-enregistrements-page',
  templateUrl: './liste-des-enregistrements-page.component.html',
  styleUrls: ['./liste-des-enregistrements-page.component.css']
})
export class ListeDesEnregistrementsPageComponent implements OnInit {

  public leftMenuItems: MenuItem;

  constructor() { }

  ngOnInit() {
    this.leftMenuItems = leftMenu.leftMenuItems;
  }

}
