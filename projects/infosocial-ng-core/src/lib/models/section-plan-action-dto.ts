import { Tuple } from 'projects/sigct-ui-ng-lib/src/lib/utils/tuple';
import { GenericSectionImpressionDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/generic-section-impression-fiche-dto';
import { OrientationSuitesInterventionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/orientation-suites-intervention-dto';
import { ReferenceSuitesInterventionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-suites-intervention-dto';
import { AvisDTO } from 'projects/infosocial-ng-app/src/app/modules/fiche-appel/models/avis-dto';

export class SectionPlanActionDTO extends GenericSectionImpressionDTO {
  cadresTexts: Tuple[];
  moyenModalites: string;
  referentiels: Tuple[];
  aucuneSuite: boolean;
  autorisationTransmission: boolean;
  orientations: OrientationSuitesInterventionDTO[];
  references: ReferenceSuitesInterventionDTO[];
  avis: AvisDTO[];
  consentementenFicheEnregistreur: boolean;
}
