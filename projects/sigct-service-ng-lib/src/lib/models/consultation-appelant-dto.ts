import { ConsultationSectionAppelantCommDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/consultation-fiche-section-appelant/consultation-appelant-comm-dto';
import { AppelantCommDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-appelant-communication/appelant-Comm-dto';
import { AppelantDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-appelant-initial/appelant-dto';


/**
 * Classe regroupant les informations de type Apppelant de la section Consultation
 *
 */
export class ConsultationAppelantDTO {

    appelantDTO: AppelantDTO;
    listeCommunications: ConsultationSectionAppelantCommDTO[];
    categorieUsager: string;


}