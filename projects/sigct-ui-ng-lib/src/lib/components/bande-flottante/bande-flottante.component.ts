import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { SigctContentZoneComponent } from '../sigct-content-zone/sigct-content-zone.component';

@Component({
  selector: 'msss-bande-flottante',
  templateUrl: './bande-flottante.component.html',
  styleUrls: ['./bande-flottante.component.css']
})
export class BandeFlottanteComponent implements OnInit {

  // libellé du bouton Bas page, il existe une valeur par défaut, mais cela peut être spécifié dans la vue.
  @Input() basPageLb = 'Bas page'
  // libellé du bouton Haut page, il existe une valeur par défaut, mais cela peut être spécifié dans la vue.
  @Input() hautPageLb = 'Haut page'
  // libellé du bouton Tout Fermer, il existe une valeur par défaut, mais cela peut être spécifié dans la vue.
  @Input() toutFermerLb = 'Tout fermer'
  // libellé du bouton Tout ouvri, il existe une valeur par défaut, mais cela peut être spécifié dans la vue.
  @Input() toutOuvrirLb = 'Tout ouvrir'

  @Input() contentZones: SigctContentZoneComponent[];

  @Input() divToScroll:HTMLDivElement;

  @Input() bottomElementToScrollToIt: ElementRef;

  constructor() { }

  @ViewChild('btnOuvrirTout', { static: true })
  btnOuvrirTout: ElementRef;
  

  ngOnInit() {
  }

  onOuvrirTout() {
    if (this.contentZones) {
      this.contentZones.forEach(sigctContentZoneComponent => {
        sigctContentZoneComponent.collapsed = false;
      });
    }
  }

  onFermerTout() {
    if (this.contentZones) {
      this.contentZones.forEach(sigctContentZoneComponent => {
        sigctContentZoneComponent.collapsed = true;
      });
    }
  }

  scrollToTop() {
    if (this.divToScroll) {
      this.divToScroll.scrollIntoView();
      this.divToScroll.scrollTop = 0;
    } else {
      window.scroll(0, 0);
    }

  }

  scrollToBottom() {
    if (this.divToScroll) {
      this.divToScroll.scrollIntoView(false);
      this.divToScroll.scrollTop = 1e+34;
    } else if (this.bottomElementToScrollToIt) {
      this.bottomElementToScrollToIt.nativeElement.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    }
  }

  setFocusOnOuvrirTout(){
    this.btnOuvrirTout.nativeElement.focus();
  }

}
