/**
 * Classe représentant un appelant. 
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.infosante.model.support.AppelantDTO
 */
export class AppelantDTO {
    id: number;
    details?: string;
    nom: string;
    prenom: string;

    constructor() { }
}