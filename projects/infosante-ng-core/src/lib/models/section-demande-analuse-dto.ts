import { AntecedentDTO } from 'projects/infosante-ng-app/src/app/modules/fiche-appel/models';
import { MedicationDTO } from 'projects/infosante-ng-app/src/app/modules/fiche-appel/models/medication-dto';
import { GenericSectionImpressionDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/generic-section-impression-fiche-dto';
import { Tuple } from 'projects/sigct-ui-ng-lib/src/lib/utils/tuple';
import { ConsultationAntecedentDTO, ConsultationManifestationSigneDemarcheAnterieureDTO, ConsultationMedicationDTO } from '../models';

export class SectionDemandeAnalyseDTO extends GenericSectionImpressionDTO {

  typeFiche: string;
  cadresTexts: Tuple[];
  antecedentsActuelles: ConsultationAntecedentDTO[];
  medicationsActuelles: ConsultationMedicationDTO[];
  consultationsAnterieures: Tuple[];
  manSigneAnterieurActuelles: ConsultationManifestationSigneDemarcheAnterieureDTO[];
}