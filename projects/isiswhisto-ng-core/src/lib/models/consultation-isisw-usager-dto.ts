import { GenericSectionImpressionDTO } from "projects/sigct-ui-ng-lib/src/lib/model/generic-section-impression-fiche-dto";

export class ConsultationIsiswUsagerDTO extends GenericSectionImpressionDTO {

  nomPrenom: string;
  dateNaissance: string;
  nam: string;
  telephone1: string;
  telephone2: string;
  adresse: string;
  municipalite: string;
  codePostal: string;
  territoireClsc: string;
  noDossier: string;
  idRegion: number;
  nomRegion: string;
  idNomRegion?: string;
}
