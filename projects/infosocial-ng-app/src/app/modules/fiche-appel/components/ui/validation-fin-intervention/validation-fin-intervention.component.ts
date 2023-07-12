import { Component, OnInit, Input } from '@angular/core';
import { ValidationDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/indicateurs-fin-intervention/validation-dto';
import { IndicateursFinInterventionDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/indicateurs-fin-intervention/indicateurs-fin-intervention-dto';
import { ReferenceDTO, ValidationFinInterventionDTO } from 'projects/infosocial-ng-core/src/lib/models';
import { TypeficheSelectioneService } from 'projects/sigct-ui-ng-lib/src/lib/components/grise-automatique-selon-type-intervention/grise-automatique-selon-type-intervention.component';

const DEFAULT_OPTION: string = "Sélectionnez...";

@Component({
  selector: 'app-validation-fin-intervention',
  templateUrl: './validation-fin-intervention.component.html',
  styleUrls: ['./validation-fin-intervention.component.css']
})
export class ValidationFinInterventionComponent implements OnInit {

  @Input()
  set validationFinInterventionInput(value: ValidationFinInterventionDTO) {
    this.validationFinIntervention = value;
    this.convertToIndicateursFinIntervention();
  }

  @Input()
  idFicheAppel: number;

  @Input()
  set referencesValidationsInput(values: ReferenceDTO[]) {
    if (values) {
      this.referencesValidations = values;
    }
  }


  validationFinIntervention: ValidationFinInterventionDTO;
  indicateursFinInterventions: IndicateursFinInterventionDTO[] = [];
  raisonCpNonSaisiValide: boolean = true;
  conclusionEffectueeValide: boolean = true;
  infoBullRaisonCpNonSaisi: string = DEFAULT_OPTION;
  infoBullConclusionEffectuee: string = DEFAULT_OPTION;
  referencesValidations: ReferenceDTO[] = [];

  constructor(private typeFicheSelectioneService: TypeficheSelectioneService) { }

  ngOnInit(): void {

  }

  get typeFiche() : TypeficheSelectioneService{
    return this.typeFicheSelectioneService;
  }

  onIndicateurChanged(validation: ValidationDTO): void {
    if (validation) {
      if (!validation.idFicheAppel) {
        validation.idFicheAppel = this.idFicheAppel;
      }
      if (!this.validationFinIntervention.validations) {
        this.validationFinIntervention.validations = [];
      }
      let validationExists: boolean = false;
      this.validationFinIntervention.validations.forEach(item => {
        if (item.idReferenceValidation == validation.idReferenceValidation) {
          validationExists = true;
          item.reponse = validation.reponse;
          return;
        }
      });
      if (!validationExists) {
        this.validationFinIntervention.validations.push(validation);
      }
    }
  }

  onOptionSelectedRaisonCpNonSaisi(): void {
    this.raisonCpNonSaisiValide = true;
  }

  onOptionSelectedConclusionEffectuee(): void {
    this.conclusionEffectueeValide = true;
  }

  private convertToIndicateursFinIntervention() {
    let aux: IndicateursFinInterventionDTO[] = [];
    this.referencesValidations.forEach(reference => {
      aux.push(this.getIndicateursFinIntervention(reference));
    });
    this.indicateursFinInterventions = aux;
  }

  private getIndicateursFinIntervention(reference: ReferenceDTO): IndicateursFinInterventionDTO {
    let result: IndicateursFinInterventionDTO = { question: reference, reponseCode: null, reponse: null };
    if (this.validationFinIntervention.validations) {
      this.validationFinIntervention.validations
        .filter(validation => validation.idReferenceValidation == reference.id)
        .forEach(validation => {
          result.reponseCode = validation.reponse;
          result.reponse = validation;
          return;
        });
    }
    return result;
  }

  onChangmentTypeConfirme($event) {

  }

}
