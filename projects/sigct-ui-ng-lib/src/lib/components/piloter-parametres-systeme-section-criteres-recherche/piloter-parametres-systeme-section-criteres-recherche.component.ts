import { Component, OnInit, Output, EventEmitter, ViewChild } from '@angular/core';
import { InputTextComponent } from '../input-text/input-text.component';
import { CriteresParamSystm } from './criteres-param-systm';

@Component({
  selector: 'msss-piloter-parametres-systeme-section-criteres-recherche',
  templateUrl: './piloter-parametres-systeme-section-criteres-recherche.component.html',
  styleUrls: ['./piloter-parametres-systeme-section-criteres-recherche.component.css']
})
export class PiloterParametresSystemeSectionCriteresRechercheComponent implements OnInit {

  public criteresParamSystm: CriteresParamSystm = new CriteresParamSystm();

  @Output("rechercherParamsSystemeBtn")
  rechercherParamsSystemeBtn: EventEmitter<CriteresParamSystm> = new EventEmitter();
  
  @Output("enterKeydown")
  enterKeydown: EventEmitter<string> = new EventEmitter();

  @ViewChild("code", {static: true})
  code: InputTextComponent;

  constructor() { }

  ngOnInit(): void {
  }

  onRechercherBtn(): void {
    this.rechercherParamsSystemeBtn.emit(this.criteresParamSystm);
  }

  onKeydown(event: any) {
    if (event?.key === "Enter") {
      this.enterKeydown?.emit(event?.target?.value);
    }
  }

  onReinitialiserBtn() {
    this.elementWithDefaultCursor();
    this.criteresParamSystm.code = "";
    this.rechercherParamsSystemeBtn.emit(this.criteresParamSystm);
  }
  
  elementWithDefaultCursor(): void {
      this.code?.focus();
  }

}
