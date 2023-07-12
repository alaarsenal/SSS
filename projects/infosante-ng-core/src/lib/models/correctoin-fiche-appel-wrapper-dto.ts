import { FicheAppelCorrectionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/fiche-appel-correction-dto';
import { OrientationSuitesInterventionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/orientation-suites-intervention-dto';
import { ReferenceSuitesInterventionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-suites-intervention-dto';
import { RaisonAppelDTO } from 'projects/sigct-service-ng-lib/src/lib/models/raison-appel-dto';
import { FicheAppelDTO } from './fiche-appel-dto';
import { RoleActionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/role-action-dto';
import { ProjetRechercheDTO } from './projet-recherche-dto';

export class CorrectionFicheAppelWrapperDTO {

  ficheAppel: FicheAppelDTO;
  ficheAppelCorrection: FicheAppelCorrectionDTO;
  orientations: OrientationSuitesInterventionDTO[];
  references: ReferenceSuitesInterventionDTO[];
  projetsRecherche: ProjetRechercheDTO[];
  raisonsAppel: RaisonAppelDTO[];
  rolesAction: RoleActionDTO[];
  relierUsager?: boolean;
  existeSexeUsager?: boolean;
  dateNaissanceUsager?: Date;
  erreurs?: Map<string, string>;
  usagerIdentifRelierActif?: boolean;

  constructor() { }
}
