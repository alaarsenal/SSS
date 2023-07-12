import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { InputTextComponent } from '../input-text/input-text.component';
import { Criteres } from './criteres';

@Component({
  selector: 'msss-piloter-tables-references-section-criteres-recherche',
  templateUrl: './piloter-tables-references-section-criteres-recherche.component.html',
  styleUrls: ['./piloter-tables-references-section-criteres-recherche.component.css']
})
export class PiloterTablesReferencesSectionCriteresRechercheComponent implements OnInit {

  public criteres: Criteres = new Criteres();

  @Output("rechercherTabRefsBtn")
  rechercherTabRefsBtnEvent: EventEmitter<Criteres> = new EventEmitter();

  @Output("enterKeydown")
  enterKeydownEvent: EventEmitter<Criteres> = new EventEmitter();

  @ViewChild("nomDescription", {static: true})
  nomDescription: InputTextComponent;

  constructor() { }

  ngOnInit(): void {
  }

  onRechercherBtn(): void {
    this.rechercherTabRefsBtnEvent.emit(this.criteres);
  }

  onKeydown(event: any): void {
    if (event?.key === "Enter") {
      this.enterKeydownEvent.emit(this.criteres);
    }
  }

  onReinitialiserBtn() {
    this.elementWithDefaultCursor();
    this.criteres.nomDescription = "";
    this.rechercherTabRefsBtnEvent.emit(this.criteres);
  }

  elementWithDefaultCursor(): void {
    if(this.nomDescription) {
      this.nomDescription.focus();
    }
  }

}
