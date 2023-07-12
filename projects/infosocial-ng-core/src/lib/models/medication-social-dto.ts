/**
 * Classe représente une medication. 
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.infosocial.model.support.MedicationSocialDTO
 */
export class MedicationSocialDTO {
    id: number;
    details?: string;
    medication: string;
    idFicheAppel?: number;

    constructor() { }
}