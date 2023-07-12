import { RrssDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/rrss/rrss-dto';

export class ReferenceSuitesInterventionDTO {

  public id: number;
  public idFicheAppel: number;
  public programmeService: string;
  public details: string;
  public codeReferenceReference: string;
  public codeCnReferenceReference?: string;
  public nomReferenceReference?: string;
  public rrssDTOs: RrssDTO[];
}
