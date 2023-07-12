import { UsagerDTO } from 'projects/infosante-ng-core/src/lib/models/usager-dto';
import { StatutFicheAppelEnum } from 'projects/sigct-service-ng-lib/src/lib/models/statut-fiche-appel.enum';


/**
 * Classe représentant une fiche d'appel
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.infosante.model.support.FicheAppelSanteDTO
 */
export class ConsultationFicheAppelDTO {
     public id: number;
     public statut: StatutFicheAppelEnum;
     public usager?: UsagerDTO;
}