import { Component, OnInit, Input } from '@angular/core';
import { ValidationFinInterventionDTO } from 'projects/infosocial-ng-core/src/lib/models/validation-fin-intervention-dto';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { CadreTextDto } from 'projects/sigct-service-ng-lib/src/lib/models/cadre-text-dto';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-consultation-fiche-section-terminaison-validation',
  templateUrl: './consultation-fiche-section-terminaison-validation.component.html',
  styleUrls: ['./consultation-fiche-section-terminaison-validation.component.css']
})
export class ConsultationFicheSectionTerminaisonValidationComponent implements OnInit {

  @Input()
  set validationFinIntervention(value: ValidationFinInterventionDTO) {
    this.chargerDonnees(value);
  }
  dto: ValidationFinInterventionDTO;
  cadreTextOpinionProfessionnelle: CadreTextDto;
  displaySection: boolean;
  displayValidations: boolean;
  displayDetail: boolean;
  displayOpinionProfessionnelle: boolean;

  constructor(private translateService: TranslateService,) { }

  ngOnInit(): void {
  }

  private chargerDonnees(value: ValidationFinInterventionDTO): void {
    this.dto = value ? value : new ValidationFinInterventionDTO();
    this.cadreTextOpinionProfessionnelle = new CadreTextDto();
    this.cadreTextOpinionProfessionnelle.titleLabel = this.translateService.instant("sigct.so.f_appel.consultation.terminaison.validfinintervention.opinionpro");
    this.cadreTextOpinionProfessionnelle.plainText = this.dto.opinionProf;
    this.displayValidations = false;
    this.displayDetail = false;
    this.displayOpinionProfessionnelle = false;
    this.displaySection = false;
    if (this.dto) {
      this.displayValidations = CollectionUtils.isNotBlank(this.dto.validations)
        && this.dto.validations.find(item => item.reponse != null) != null;
      this.displayDetail = !StringUtils.isBlank(this.dto.details);
      this.displayOpinionProfessionnelle = !StringUtils.isBlank(this.dto.opinionProf);
      this.displaySection = this.displayValidations || this.displayDetail || this.displayOpinionProfessionnelle;
    }
  }
}
