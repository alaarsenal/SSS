import { Component, EventEmitter, Input, Output } from '@angular/core';
import { OngletItem } from './onglet-interface';

@Component({
  selector: 'msss-onglets',
  templateUrl: './onglets.component.html',
  styleUrls: ['./onglets.component.css']
})
export class OngletsComponent {
  @Input("onglets")
  onglets: OngletItem[] = [];

  @Input("nbOngletMax")
  nbOngletMax: number = 1;

  @Input("titleCode")
  titleCode: string = "";

  @Output("ongletClick")
  ongletClick: EventEmitter<any> = new EventEmitter();

  @Output("addOngletClick")
  addOngletClick: EventEmitter<any> = new EventEmitter();

  constructor() { }

  onOngletClick(id: any){
    this.ongletClick.emit(id);
  }

  onAddOngletClick(){
    this.addOngletClick.emit();
  }
}
