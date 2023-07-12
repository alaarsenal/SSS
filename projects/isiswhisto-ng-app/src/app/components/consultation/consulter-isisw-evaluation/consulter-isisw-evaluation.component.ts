import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { ConsultationIsiswEvaluationDTO } from 'projects/isiswhisto-ng-core/src/lib/models/consultation-isisw-evaluation-dto';
import { SigctContentZoneComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-content-zone/sigct-content-zone.component';
import { InputOptionCollection } from 'projects/sigct-ui-ng-lib/src/lib/utils/input-option';

@Component({
  selector: 'msss-consulter-isisw-evaluation',
  templateUrl: './consulter-isisw-evaluation.component.html',
  styleUrls: ['./consulter-isisw-evaluation.component.css']
})
export class ConsulterIsiswEvaluationComponent implements OnInit {

  @ViewChild(SigctContentZoneComponent)
  contentZone: SigctContentZoneComponent;

  @Input()
  set sectionData(value: ConsultationIsiswEvaluationDTO) {
    this.loadData(value);
  }
  dto: ConsultationIsiswEvaluationDTO;

  inputOptionUsagerCapable: InputOptionCollection = {
    name: "usagerCapable",
    options: [{ label: 'sigct.ss.c_appelsisisw.usagercapable', value: 'false' }]
  };

  inputOptionUsagerSatisfait: InputOptionCollection = {
    name: "usagerSatisfait",
    options: [{ label: 'sigct.ss.c_appelsisisw.usagersatisfait', value: 'false' }]
  };

  constructor() { }

  ngOnInit(): void {
  }

  isVisible():boolean {
    return !this.contentZone?.collapsed;
  }

  private loadData(value: ConsultationIsiswEvaluationDTO): void {
    if (value) {
      this.dto = value;
    } else {
      this.dto = new ConsultationIsiswEvaluationDTO();
    }
  }
}
