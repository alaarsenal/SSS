import { Component, OnInit, Input } from '@angular/core';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { SectionTerminaisonDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/section-terminaison-dto';
import { ConsultationFicheSectionTerminaisonDTO } from '../consultation-fiche-section-terminaison/consultation-fiche-section-terminaison.dto';

@Component({
  selector: 'msss-consultation-fiche-section-terminaison-services-utilisees',
  templateUrl: './consultation-fiche-section-terminaison-services-utilisees.component.html',
  styleUrls: ['./consultation-fiche-section-terminaison-services-utilisees.component.css']
})
export class ConsultationFicheSectionTerminaisonServicesUtiliseesComponent implements OnInit {

  @Input()
  set servicesInterprete(value: number) {
    this.labelServicesInterprete = value ? 'Oui' : 'Non';
  };
  labelServicesInterprete: string;

  @Input()
  set servicesRelaisBell(value: number) {
    this.labelServicesRelaisBell = value ? 'Oui' : 'Non';
  };
  labelServicesRelaisBell: string;

  @Input()
  detailsInterprete: string;

  @Input()
  detailsRelaisBell: string;

  constructor() { }

  ngOnInit(): void {
  }

  loadDonneesImpression(section: SectionTerminaisonDTO) {
    if (section) {
      section.labelServicesInterprete = this.labelServicesInterprete;
      section.labelServicesRelaisBell = this.labelServicesRelaisBell;
    }
  }

  loadDonneesImpressionSante(section: ConsultationFicheSectionTerminaisonDTO) {
    if (section) {
      section.labelServicesInterprete = this.labelServicesInterprete;
      section.labelServicesRelaisBell = this.labelServicesRelaisBell;
    }
  }

  get displaySection(): boolean {
    return this.displayServicesInterprete || this.displayServiceRelaisBell;
  }

  get displayServicesInterprete(): boolean {
    return !StringUtils.isBlank(this.labelServicesInterprete) || this.displayDetailsInterprete;
  }

  get displayServiceRelaisBell(): boolean {
    return !StringUtils.isBlank(this.labelServicesRelaisBell) || this.displayDetailsRelaisBell;
  }

  get displayDetailsInterprete(): boolean {
    return !StringUtils.isBlank(this.detailsInterprete);
  }

  get displayDetailsRelaisBell(): boolean {
    return !StringUtils.isBlank(this.detailsRelaisBell);
  }
}
