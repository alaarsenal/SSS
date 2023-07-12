import { ValidationDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/indicateurs-fin-intervention/validation-dto';

export class ValidationFinInterventionDTO {

  public validations: ValidationDTO[] = [];
  public details: string;
  public opinionProf:string;

  constructor() {
  }
}
