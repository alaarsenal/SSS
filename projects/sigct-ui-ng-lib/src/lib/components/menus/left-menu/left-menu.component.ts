import { Component, Input } from '@angular/core';
import { MenuItem } from '../menu-interface';
import { Router } from '@angular/router';

@Component({
  selector: 'msss-left-menu',
  templateUrl: './left-menu.component.html',
  styleUrls: ['./left-menu.component.css']
})
export class LeftMenuComponent {

  @Input()
  public leftMenuItems: MenuItem[];

  constructor(private router: Router) { }

  isMenuItemActif(menuLink: string): boolean {
    return this.router.url.includes(menuLink);
  }
}