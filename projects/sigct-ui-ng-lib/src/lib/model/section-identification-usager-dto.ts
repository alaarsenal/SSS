import { GenericSectionImpressionDTO } from './generic-section-impression-fiche-dto';

export class SectionIdentificationUsagerDTO extends GenericSectionImpressionDTO {
  nomPrenom: string;
  dateNaissance: Date;
  age: string;
  sex: string;
  details: string;
}
