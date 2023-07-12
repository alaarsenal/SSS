import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CadreTextDto } from 'projects/sigct-service-ng-lib/src/lib/models/cadre-text-dto';

@Component({
  selector: 'msss-cadre-text-fieldset',
  templateUrl: './cadre-text-fieldset.component.html',
  styleUrls: ['./cadre-text-fieldset.component.css']
})
export class CadreTextFieldsetComponent implements OnInit {

  @Input("cadreTextDto") 
  public cadreTextDto: CadreTextDto;

  @Output()
  referentielConsultPdfAction: EventEmitter<any> = new EventEmitter();

  @Output()
  referentielConsultAction: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

  onConsultReferentielPdfClick(data: any) {
    // Ici on communique le contenu 'data' sans savoir de quel type s'agit-il, c'est au niveau du parent component que l'usager identifie le type attendu
    this.referentielConsultPdfAction.emit(this.cadreTextDto.datas.get(data));
  }

  onConsultReferentielClick(data: any) {
    // Ici on communique le contenu 'data' sans savoir de quel type s'agit-il, c'est au niveau du parent component que l'usager identifie le type attendu
   this.referentielConsultAction.emit(this.cadreTextDto.datas.get(data));
  }
}
