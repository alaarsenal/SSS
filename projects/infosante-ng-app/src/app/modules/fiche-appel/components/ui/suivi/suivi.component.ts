import { Component, OnInit, Input } from '@angular/core';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';
import { ReferenceDTO } from 'projects/usager-ng-core/src/lib/models';
import { SuiviDTO } from './suivi-dto';

const DEFAULT_OPTION: string = "Sélectionnez...";

@Component({
  selector: 'app-suivi',
  templateUrl: './suivi.component.html',
  styleUrls: ['./suivi.component.css']
})
export class SuiviComponent implements OnInit {

  @Input()
  set inputSuivi(value: SuiviDTO) {
    if (value) {
      this.suiviDTO = value;
    }
  }

  @Input()
  set inputReferencesRessourceSuivi(values: ReferenceDTO[]) {
    if (values) {
      this.inputOptionsConsulter.options = [{ label: DEFAULT_OPTION, value: null }];
      this.referencesRessourceSuivis = values;
      values.forEach(result => this.inputOptionsConsulter.options.push({
        label: result.nom, value: result.code
      }));
    }
  }

  inputOptionsConsulter: InputOptionCollection = {
    name: "consulter",
    options: [{ label: DEFAULT_OPTION, value: null }]
  };

  suiviDTO: SuiviDTO = new SuiviDTO();

  private referencesRessourceSuivis: ReferenceDTO[];

  @Input()
  isDisabled = false;

  constructor() { }

  ngOnInit(): void {
  }

}
