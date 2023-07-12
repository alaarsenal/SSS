import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ConsultationIsiswNotesComplementaireDTO } from 'projects/isiswhisto-ng-core/src/lib/models/consultation-isisw-notes-complementaire-dto';
import { SigctContentZoneComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-content-zone/sigct-content-zone.component';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';

@Component({
  selector: 'msss-consulter-isisw-notes-complementaires',
  templateUrl: './consulter-isisw-notes-complementaires.component.html',
  styleUrls: ['./consulter-isisw-notes-complementaires.component.css']
})
export class ConsulterIsiswNotesComplementairesComponent implements OnInit {

  @ViewChild(SigctContentZoneComponent)
  contentZone: SigctContentZoneComponent;

  @Input()
  set sectionData(value: ConsultationIsiswNotesComplementaireDTO) {
    this.loadData(value);
  }
  dto: ConsultationIsiswNotesComplementaireDTO;

  listeInputOptionConsentement: InputOptionCollection[];

  constructor() { }

  ngOnInit(): void {
  }

  isVisible():boolean {
    return !this.contentZone?.collapsed;
  }

  private loadData(value: ConsultationIsiswNotesComplementaireDTO): void {
    this.listeInputOptionConsentement = [];
    if (value) {
      this.dto = value;
      if (value.listeNoteComplementaires) {
        value.listeNoteComplementaires.forEach(note => {
          this.listeInputOptionConsentement.push({
            name: "consentement_" + note.idNote,
            options: [{ label: null, value: 'false' }]
          })
        })
      }
    } else {
      this.dto = new ConsultationIsiswNotesComplementaireDTO();
    }
  }
}
