import { ImpressionFicheDTO } from 'projects/sigct-service-ng-lib/src/lib/models/impression-fiche-dto';
import { ConsultationFicheSectionSuiteInterventionDto } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-suite-intervention/consultation-fiche-section-suite-intervention-dto';
import { ConsultationFicheSectionTerminaisonDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-terminaison/consultation-fiche-section-terminaison.dto';
import { ConsultationDemandeEvaluationDTO } from '../models';
import { ConsultationReferentielDTO } from './consultation-referentiel-dto';
import { SectionDemandeAnalyseDTO } from './section-demande-analuse-dto';
import { SectionPlanActionDTO } from './section-plan-action-dto';
import { ValidationFinInterventionDTO } from './validation-fin-intervention-dto';
import { SectionRelanceDTO } from '../../../../sigct-ui-ng-lib/src/lib/model/section-relance-dto';


export class ImpressionFicheSanteDTO extends ImpressionFicheDTO {

  consultationDemandeEvaluationDto: ConsultationDemandeEvaluationDTO
  sectionDemandeAnalyseDto: SectionDemandeAnalyseDTO;
  sectionTerminaisonDto: ConsultationFicheSectionTerminaisonDTO;
  sectionPlanAction: SectionPlanActionDTO;
  consultationFicheSectionSuiteInterventionDto: ConsultationFicheSectionSuiteInterventionDto;
  validationFinInterventionDTO: ValidationFinInterventionDTO;
  sectionConsultationReferentielsDTO: ConsultationReferentielDTO;
  sectionRelance: SectionRelanceDTO;

  constructor() {
    super();

    this.consultationDemandeEvaluationDto = new ConsultationDemandeEvaluationDTO();
    this.sectionDemandeAnalyseDto = new SectionDemandeAnalyseDTO();
    this.sectionTerminaisonDto = new ConsultationFicheSectionTerminaisonDTO();
    this.sectionPlanAction = new SectionPlanActionDTO();
    this.consultationFicheSectionSuiteInterventionDto = new ConsultationFicheSectionSuiteInterventionDto();
    this.validationFinInterventionDTO = new ValidationFinInterventionDTO();
    this.sectionConsultationReferentielsDTO = new ConsultationReferentielDTO;
    this.sectionRelance = new SectionRelanceDTO();
  }
}
