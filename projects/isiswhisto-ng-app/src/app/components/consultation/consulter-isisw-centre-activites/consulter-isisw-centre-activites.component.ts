import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ConsultationIsiswCentreActiviteDTO } from 'projects/isiswhisto-ng-core/src/lib/models/consultation-isisw-centre-activite-dto';
import { SigctContentZoneComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-content-zone/sigct-content-zone.component';

@Component({
  selector: 'msss-consulter-isisw-centre-activites',
  templateUrl: './consulter-isisw-centre-activites.component.html',
  styleUrls: ['./consulter-isisw-centre-activites.component.css']
})
export class ConsulterIsiswCentreActivitesComponent implements OnInit {

  @ViewChild(SigctContentZoneComponent)
  contentZone: SigctContentZoneComponent;

  @Input()
  set sectionData(value: ConsultationIsiswCentreActiviteDTO) {
    this.loadData(value);
  }
  dto: ConsultationIsiswCentreActiviteDTO;

  constructor() { }

  ngOnInit(): void {
  }

  isVisible():boolean {
    return !this.contentZone?.collapsed;
  }

  private loadData(value: ConsultationIsiswCentreActiviteDTO): void {
    if (value) {
      this.dto = value;
    } else {
      this.dto = new ConsultationIsiswCentreActiviteDTO();
    }
  }

}
