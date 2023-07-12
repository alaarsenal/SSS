import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ConsultationIsiswCollecteDonneesDTO } from 'projects/isiswhisto-ng-core/src/lib/models/consultation-isisw-collecte-donnees-dto';
import { SigctContentZoneComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-content-zone/sigct-content-zone.component';

@Component({
  selector: 'msss-consulter-isisw-collecte-donnees',
  templateUrl: './consulter-isisw-collecte-donnees.component.html',
  styleUrls: ['./consulter-isisw-collecte-donnees.component.css']
})
export class ConsulterIsiswCollecteDonneesComponent implements OnInit {

  @ViewChild(SigctContentZoneComponent)
  contentZone: SigctContentZoneComponent;

  @Input()
  set sectionData(value: ConsultationIsiswCollecteDonneesDTO) {
    this.loadData(value);
  }
  dto: ConsultationIsiswCollecteDonneesDTO;

  constructor() { }

  ngOnInit(): void {
  }

  isVisible():boolean {
    return !this.contentZone?.collapsed;
  }

  private loadData(value: ConsultationIsiswCollecteDonneesDTO): void {
    if (value) {
      this.dto = value;
    } else {
      this.dto = new ConsultationIsiswCollecteDonneesDTO();
    }
  }

}
