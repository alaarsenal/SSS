import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ConsultationIsiswReferenceDTO } from 'projects/isiswhisto-ng-core/src/lib/models/consultation-isisw-refenrece-dto';
import { SigctContentZoneComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-content-zone/sigct-content-zone.component';

@Component({
  selector: 'msss-consulter-isisw-reference',
  templateUrl: './consulter-isisw-reference.component.html',
  styleUrls: ['./consulter-isisw-reference.component.css']
})
export class ConsulterIsiswReferenceComponent implements OnInit {

  @ViewChild(SigctContentZoneComponent)
  contentZone: SigctContentZoneComponent;

  @Input()
  set sectionData(value: ConsultationIsiswReferenceDTO) {
    this.loadData(value);
  }
  dto: ConsultationIsiswReferenceDTO;

  constructor() { }

  ngOnInit(): void {
  }

  isVisible():boolean {
    return !this.contentZone?.collapsed;
  }

  private loadData(value: ConsultationIsiswReferenceDTO): void {
    if (value) {
      this.dto = value;
    } else {
      this.dto = new ConsultationIsiswReferenceDTO();
    }
  }
}
