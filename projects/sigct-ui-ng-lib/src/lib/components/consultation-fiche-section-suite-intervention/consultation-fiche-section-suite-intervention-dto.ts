import { SourcesInformationDTO } from 'projects/infosante-ng-core/src/lib/models/sources-information-dto';
import { OrientationSuitesInterventionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/orientation-suites-intervention-dto';
import { ReferenceSuitesInterventionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-suites-intervention-dto';
import { GenericSectionImpressionDTO } from '../../model/generic-section-impression-fiche-dto';
import { VerticalListByTitleDTO } from '../display-vertical-list-by-title/vertical-list-by-title-dto';

export class ConsultationFicheSectionSuiteInterventionDto extends GenericSectionImpressionDTO {
    public orientations: OrientationSuitesInterventionDTO[];
    public references: ReferenceSuitesInterventionDTO[];
    public aucuneSuite: boolean;
    public autorisationTransmission: boolean;
    public consentementenFicheEnregistreur: boolean;
    public suivi: string;


    sourcesInformationDTOs: SourcesInformationDTO[] = [];
    verticalListByTitleDTO: VerticalListByTitleDTO;
}
