import { GenericSectionImpressionDTO } from './generic-section-impression-fiche-dto';
import { Tuple } from '../utils/tuple';

export class SectionCommunicationUsagerDTO extends GenericSectionImpressionDTO {

  communications: Tuple[];
}
