import { Component, OnInit, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ValidationFinInterventionDTO } from '../../../models/validation-fin-intervention-dto';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import StringUtils from 'projects/sigct-service-ng-lib/src/lib/utils/string-utils';
import { ProjetRechercheDTO } from '../../../models/projet-recherche-dto';

@Component({
  selector: 'lib-consultation-fiche-section-terminaison-validation',
  templateUrl: './consultation-fiche-section-terminaison-validation.component.html',
  styleUrls: ['./consultation-fiche-section-terminaison-validation.component.css']
})
export class ConsultationFicheSectionTerminaisonValidationComponent implements OnInit {

  @Input()
  set validationFinIntervention(value: ValidationFinInterventionDTO) {
    this.chargerDonnees(value);
  }
  dto: ValidationFinInterventionDTO;
  displaySection: boolean;
  displayValidations: boolean;
  displayRaisonCpInconnu: boolean;
  displayCategorieAppelant: boolean;
  displayProjetRecherche: boolean;
  displayDetail: boolean;

  constructor(private translateService: TranslateService,) { }

  ngOnInit(): void {
  }

  private chargerDonnees(value: ValidationFinInterventionDTO): void {

    this.dto = value ? value : new ValidationFinInterventionDTO();

    this.displayValidations = false;
    this.displayRaisonCpInconnu = false;
    this.displayCategorieAppelant = false;
    this.displayDetail = false;
    this.displayProjetRecherche = false;
    this.displaySection = false;

    if (this.dto) {

      this.displayValidations = CollectionUtils.isNotBlank(this.dto.validations)
        && this.dto.validations.find(item => item.reponse != null) != null;

      this.displayRaisonCpInconnu = !StringUtils.isBlank(this.dto.nomRefRaisonCpInconnu);
      this.displayCategorieAppelant = !StringUtils.isBlank(this.dto.nomRefCategorieAppelant);
      this.displayDetail = !StringUtils.isBlank(this.dto.details);
      this.displayProjetRecherche = CollectionUtils.isNotBlank(this.dto.projetRecherches);

      this.displaySection = this.displayValidations
        || this.displayRaisonCpInconnu
        || this.displayCategorieAppelant
        || this.displayDetail
        || this.displayProjetRecherche;
    }
  }

}
