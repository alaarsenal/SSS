import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ConsultationIsiswProfessionnelDTO } from 'projects/isiswhisto-ng-core/src/lib/models/consultation-isisw-professionnel-dto';
import { SigctContentZoneComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-content-zone/sigct-content-zone.component';

@Component({
  selector: 'msss-consulter-isisw-professionnel',
  templateUrl: './consulter-isisw-professionnel.component.html',
  styleUrls: ['./consulter-isisw-professionnel.component.css']
})
export class ConsulterIsiswProfessionnelComponent implements OnInit {

  @ViewChild(SigctContentZoneComponent)
  contentZone: SigctContentZoneComponent;

  @Input()
  set sectionData(value: ConsultationIsiswProfessionnelDTO) {
    this.loadData(value);
  }
  dto: ConsultationIsiswProfessionnelDTO;

  constructor() { }

  ngOnInit(): void {
  }

  isVisible():boolean {
    return !this.contentZone?.collapsed;
  }

  private loadData(value: ConsultationIsiswProfessionnelDTO): void {
    if (value) {
      this.dto = value;
    } else {
      this.dto = new ConsultationIsiswProfessionnelDTO();
    }
  }
}
