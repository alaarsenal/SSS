import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ConsultationIsiswHistoriqueDTO } from 'projects/isiswhisto-ng-core/src/lib/models/consultation-isisw-historique-dto';
import { SigctContentZoneComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-content-zone/sigct-content-zone.component';

@Component({
  selector: 'msss-consulter-isisw-historique',
  templateUrl: './consulter-isisw-historique.component.html',
  styleUrls: ['./consulter-isisw-historique.component.css']
})
export class ConsulterIsiswHistoriqueComponent implements OnInit {

  @ViewChild(SigctContentZoneComponent)
  contentZone: SigctContentZoneComponent;

  @Input()
  set sectionData(value: ConsultationIsiswHistoriqueDTO) {
    this.loadData(value);
  }
  dto: ConsultationIsiswHistoriqueDTO;

  constructor() { }

  ngOnInit(): void {
  }

  isVisible():boolean {
    return !this.contentZone?.collapsed;
  }

  private loadData(value: ConsultationIsiswHistoriqueDTO): void {
    if (value) {
      this.dto = value;
    } else {
      this.dto = new ConsultationIsiswHistoriqueDTO();
    }
  }
}
