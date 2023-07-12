import { GenericSectionImpressionDTO } from './generic-section-impression-fiche-dto';

export class SectionInformationSuppDTO extends GenericSectionImpressionDTO {
  nam: string;
  expiration: string;
  langue: string;
  malentendant: string;
  merenomprenom: string;
  perenomprenom: string;
}
