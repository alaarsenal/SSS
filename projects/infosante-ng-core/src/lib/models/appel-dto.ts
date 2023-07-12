import { AppelDTO as BaseAppelDTO } from 'projects/sigct-service-ng-lib/src/lib/models/appel-dto';
import { AppelantDTO } from './appelant-dto';
import { FicheAppelDTO } from './fiche-appel-dto';

/**
 * Classe représentant un appel.
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.infosante.model.support.AppelDTO
 */
export class AppelDTO extends BaseAppelDTO {
    // Voir BaseAppelDTO...

    appelant: AppelantDTO;
    ficheAppels: FicheAppelDTO[];

    constructor() {
        super();
    }
}
