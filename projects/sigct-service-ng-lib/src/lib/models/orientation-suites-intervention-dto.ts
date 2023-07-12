import { RrssDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/rrss/rrss-dto';

export class OrientationSuitesInterventionDTO {

  public id: number;
  public idFicheAppel: number;
  public programmeService: string;
  public details: string;
  public codeReferenceOrientation: string;
  public codeCnReferenceOrientation: string;
  public nomReferenceOrientation?: string;
  public rrssDTOs: RrssDTO[];
}