import { ImpressionFicheDTO } from 'projects/sigct-service-ng-lib/src/lib/models/impression-fiche-dto';
import { SectionDemandeAnalyseDTO } from './section-demande-analyse-dto';
import { SectionPlanActionDTO } from './section-plan-action-dto';
import { SectionTerminaisonDTO } from '../../../../sigct-ui-ng-lib/src/lib/model/section-terminaison-dto';
import { SectionRelanceDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/section-relance-dto';

export class ImpressionFicheSocialDTO extends ImpressionFicheDTO {
  sectionDemandeAnalyse: SectionDemandeAnalyseDTO;
  sectionPlanAction: SectionPlanActionDTO;
  sectionTerminaison: SectionTerminaisonDTO;
  sectionRelance: SectionRelanceDTO;

  constructor() {
    super();
    this.sectionDemandeAnalyse = new SectionDemandeAnalyseDTO();
    this.sectionPlanAction = new SectionPlanActionDTO();
    this.sectionTerminaison = new SectionTerminaisonDTO();
    this.sectionRelance = new SectionRelanceDTO();
  }
}
