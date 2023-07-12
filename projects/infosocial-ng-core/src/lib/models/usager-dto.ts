import { ReferenceDTO } from './reference-dto';
import { UsagerIdentificationDTO } from './usager-identification-dto';
import { FicheAppelSocialDTO } from './fiche-appel-social-dto';

/**
 * Classe représentant un usager dans la fiche d'appel.
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.infosocial.model.support.UsagerDTO
 */
export class UsagerDTO {
    public id: number;
    public ageAnnees: number;
    public ageJours: number;
    public ageMois: number;
    public referenceGroupeAge: ReferenceDTO;
    public usagerIdentification: UsagerIdentificationDTO;
    public usagerAnonyme: boolean;
    public ficheAppel: FicheAppelSocialDTO;
    public idUsagerIdentHisto:number;
    public consentementFichesAnterieures: boolean;

    constructor() { }
}
