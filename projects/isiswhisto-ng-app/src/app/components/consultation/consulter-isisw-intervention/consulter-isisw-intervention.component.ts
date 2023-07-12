import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ConsultationIsiswInterventionDTO } from 'projects/isiswhisto-ng-core/src/lib/models/consultation-isisw-intervention-dto';
import { SigctContentZoneComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-content-zone/sigct-content-zone.component';

@Component({
  selector: 'msss-consulter-isisw-intervention',
  templateUrl: './consulter-isisw-intervention.component.html',
  styleUrls: ['./consulter-isisw-intervention.component.css']
})
export class ConsulterIsiswInterventionComponent implements OnInit {

  @ViewChild(SigctContentZoneComponent)
  contentZone: SigctContentZoneComponent;

  @Input()
  set sectionData(value: ConsultationIsiswInterventionDTO) {
    this.loadData(value);
  }
  dto: ConsultationIsiswInterventionDTO;

  constructor() { }

  ngOnInit(): void {
  }

  isVisible():boolean {
    return !this.contentZone?.collapsed;
  }

  private loadData(value: ConsultationIsiswInterventionDTO): void {
    if (value) {
      this.dto = value;
    } else {
      this.dto = new ConsultationIsiswInterventionDTO();
    }
  }
}
