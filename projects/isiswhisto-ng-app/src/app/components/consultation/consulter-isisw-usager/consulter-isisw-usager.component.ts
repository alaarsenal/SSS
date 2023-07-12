import { Component, OnInit, Input, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { ConsultationIsiswUsagerDTO } from 'projects/isiswhisto-ng-core/src/lib/models/consultation-isisw-usager-dto';
import { SigctContentZoneComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-content-zone/sigct-content-zone.component';

@Component({
  selector: 'msss-consulter-isisw-usager',
  templateUrl: './consulter-isisw-usager.component.html',
  styleUrls: ['./consulter-isisw-usager.component.css']
})
export class ConsulterIsiswUsagerComponent implements OnInit {

  @ViewChild(SigctContentZoneComponent)
  contentZone: SigctContentZoneComponent;

  @Input()
  set sectionData(value: ConsultationIsiswUsagerDTO) {
    this.loadData(value);
  }
  dto: ConsultationIsiswUsagerDTO;

  constructor() { }

  ngOnInit(): void {
  }

  isVisible():boolean {
    return !this.contentZone?.collapsed;
  }

  private loadData(value: ConsultationIsiswUsagerDTO): void {
    if (value) {
      this.dto = value;
    } else {
      this.dto = new ConsultationIsiswUsagerDTO();
    }
  }

}
