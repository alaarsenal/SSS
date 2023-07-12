import { FicheAppelCorrectionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/fiche-appel-correction-dto';
import { FicheAppelSocialDTO } from '../models';
import { OrientationSuitesInterventionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/orientation-suites-intervention-dto';
import { ReferenceSuitesInterventionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-suites-intervention-dto';
import { RaisonAppelDTO } from 'projects/sigct-service-ng-lib/src/lib/models/raison-appel-dto';

export class CorrectionFicheAppelWrapperDTO {

  ficheAppel: FicheAppelSocialDTO;
  ficheAppelCorrection: FicheAppelCorrectionDTO;
  orientations: OrientationSuitesInterventionDTO[];
  references: ReferenceSuitesInterventionDTO[];
  raisonsAppel: RaisonAppelDTO[];
  relierUsager?: boolean;
  existeSexeUsager?: boolean;
  dateNaissanceUsager?: Date;
  erreurs?: Map<string, string>;
  usagerIdentifRelierActif?: boolean;

  constructor() { }
}
