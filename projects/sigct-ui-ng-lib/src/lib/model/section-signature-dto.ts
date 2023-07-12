import { GenericSectionImpressionDTO } from './generic-section-impression-fiche-dto';
import { FicheAppelCorrectionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/fiche-appel-correction-dto';

export class SectionSignatureDTO extends GenericSectionImpressionDTO {
  signature1: string;
  signature2: string;
  correctionsFicheAppel: FicheAppelCorrectionDTO[];
}
