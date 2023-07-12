import { FicheAppelSocialDTO, ReferenceDTO } from 'projects/infosocial-ng-core/src/lib/models';
import { AppelDTO as BaseAppelDTO } from 'projects/sigct-service-ng-lib/src/lib/models/appel-dto';
import { AppelantDTO } from './appelant-dto';

/**
 * Classe représentant un appel. 
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.infosocial.model.support.AppelDTO
 */
export class AppelDTO extends BaseAppelDTO {
    // Voir BaseAppelDTO...

    appelants: AppelantDTO[];
    ficheAppels: FicheAppelSocialDTO[];

    constructor() {
        super();
    }
}