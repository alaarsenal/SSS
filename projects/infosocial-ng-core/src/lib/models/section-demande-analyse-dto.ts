import { GenericSectionImpressionDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/generic-section-impression-fiche-dto';
import { Tuple } from 'projects/sigct-ui-ng-lib/src/lib/utils/tuple';

export class SectionDemandeAnalyseDTO extends GenericSectionImpressionDTO {

  typeFiche: string;
  raisonFiche: string;
  cadresTexts: Tuple[];
  medicationsActuelles: Tuple[];
  consultationsAnterieures: Tuple[];
}
