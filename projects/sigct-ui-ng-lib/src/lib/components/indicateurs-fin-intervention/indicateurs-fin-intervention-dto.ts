import { ReferenceDTO } from 'projects/usager-ng-core/src/lib/models';
import { ValidationDTO } from './validation-dto';

export class IndicateursFinInterventionDTO {

  public question: ReferenceDTO;
  public reponseCode: string;
  public reponse: ValidationDTO;

  constructor() { }
}
