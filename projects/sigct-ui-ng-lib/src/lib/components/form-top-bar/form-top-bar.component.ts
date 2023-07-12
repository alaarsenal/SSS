import { Component, Input, OnInit } from '@angular/core';
import { FormTopBarOptions } from "../../utils/form-top-bar-options";

@Component({
  selector: 'msss-form-top-bar',
  templateUrl: './form-top-bar.component.html',
  styleUrls: ['./form-top-bar.component.css']
})
export class FormTopBarComponent implements OnInit {

  @Input()
  options: FormTopBarOptions;

  @Input()
  label: string;

  @Input()
  detail: string;

  
  /**
   * true pour que la barre s'étende à la largeur de la page.
   * false pour que la barre se limite à la largeur du parent.
   */
  @Input("fixe")
  fixe: boolean = true;
  
  /**
   * Permet de savoir qui utilise ce composant afin d'afficher la bonne couleur
   */
  @Input()
  nomModule: string = 'infosante';

  CSSBorderBottom: string;

  topBarContainer: string = 'topBarContainer';

  constructor() { }

  ngOnInit() {

    switch(this.nomModule) {
      case "usager" : { this.CSSBorderBottom = "border-bottom-usager"; break; }
      case "infosante" : { this.CSSBorderBottom = "border-bottom-infosante"; break; }
      case "infosocial" : { this.CSSBorderBottom = "border-bottom-infosocial"; break; }
      case "isiswhisto" : { this.CSSBorderBottom = "border-bottom-isiswhisto"; break; }
      default: { this.CSSBorderBottom = "border-bottom-infosante"; break; }
    }

    if (this.fixe) {
      this.topBarContainer = 'topBarContainerFixe';
    } 
  }
}
