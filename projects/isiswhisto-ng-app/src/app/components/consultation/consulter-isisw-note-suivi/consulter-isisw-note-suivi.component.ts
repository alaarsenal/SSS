import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ConsultationIsiswNoteSuiviDTO } from 'projects/isiswhisto-ng-core/src/lib/models/consultation-isisw-note-suivi-dto';
import { SigctContentZoneComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-content-zone/sigct-content-zone.component';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';

@Component({
  selector: 'msss-consulter-isisw-note-suivi',
  templateUrl: './consulter-isisw-note-suivi.component.html',
  styleUrls: ['./consulter-isisw-note-suivi.component.css']
})
export class ConsulterIsiswNoteSuiviComponent implements OnInit {

  @ViewChild(SigctContentZoneComponent)
  contentZone: SigctContentZoneComponent;

  @Input()
  set sectionData(value: ConsultationIsiswNoteSuiviDTO) {
    this.loadData(value);
  }
  dto: ConsultationIsiswNoteSuiviDTO;

  inputOptionConsentementOrganismeEnregistreur: InputOptionCollection = {
    name: "consentementOrganismeEnregistreur",
    options: [{ label: 'sigct.ss.c_appelsisisw.consentementavisorg', value: 'false' }]
  };

  inputOptionUsagerAutoriseTransmission: InputOptionCollection = {
    name: "usagerAutoriseTransmission",
    options: [{ label: 'sigct.ss.c_appelsisisw.usagerautorisetrans', value: 'false' }]
  };

  constructor() { }

  ngOnInit(): void {
  }

  isVisible():boolean {
    return !this.contentZone?.collapsed;
  }

  private loadData(value: ConsultationIsiswNoteSuiviDTO): void {
    if (value) {
      this.dto = value;
    } else {
      this.dto = new ConsultationIsiswNoteSuiviDTO();
    }
  }
}
