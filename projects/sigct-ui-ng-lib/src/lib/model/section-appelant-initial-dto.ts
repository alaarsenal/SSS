import { GenericSectionImpressionDTO } from './generic-section-impression-fiche-dto';
import { Tuple } from '../utils/tuple';

export class SectionAppelantInitialDTO extends GenericSectionImpressionDTO {
  categorieAppelant: string;
  nomPrenom: string;
  organismeRrss: string;
  details: string;
  communications: Tuple[];
}
