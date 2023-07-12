import { Component, Input, OnInit } from '@angular/core';
import { ConsultationFicheSectionSuiteInterventionDto } from './consultation-fiche-section-suite-intervention-dto';

@Component({
  selector: 'msss-consultation-fiche-section-suite-intervention',
  templateUrl: './consultation-fiche-section-suite-intervention.component.html',
  styleUrls: ['./consultation-fiche-section-suite-intervention.component.css']
})
export class ConsultationFicheSectionSuiteInterventionComponent implements OnInit {

  _consultationFicheSectionSuiteInterventionDto: ConsultationFicheSectionSuiteInterventionDto;
  get consultationFicheSectionSuiteInterventionDto(): ConsultationFicheSectionSuiteInterventionDto {
    return this._consultationFicheSectionSuiteInterventionDto;
  }

  @Input("consultationFicheSectionSuiteInterventionDto")
  set consultationFicheSectionSuiteInterventionDto(value: ConsultationFicheSectionSuiteInterventionDto) {
    this.display(value);
  }

  constructor() { }

  ngOnInit(): void {
  }

  private display(value: ConsultationFicheSectionSuiteInterventionDto): void {
    this._consultationFicheSectionSuiteInterventionDto = value;
  }

}
