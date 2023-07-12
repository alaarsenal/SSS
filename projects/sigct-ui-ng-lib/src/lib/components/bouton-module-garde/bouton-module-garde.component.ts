import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'msss-bouton-module-garde',
  templateUrl: './bouton-module-garde.component.html',
  styleUrls: ['./bouton-module-garde.component.css']
})
export class BoutonModuleGardeComponent implements OnInit {

  @Input("codeMG")
  codeMG: string;

  constructor( ) { }

  ngOnInit(): void {
  }

  ouvrirModuleDeGarde(): void {
    let url = window["env"].urlPortail + "/sigct/systemesexternes/connectToRessource/MG/" + this.codeMG;
    // Force le navigateur de ne pas utiliser le cache pour ouvrir la nouvelle url
    window.open(url + '?now=' + new Date().getTime(), "_blank");
  }

}
