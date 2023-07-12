/**
 * Classe représentant l'identification d'un usager'. 
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.infosocial.model.support.UsagerIdentificationDTO
 */
export class UsagerIdentificationDTO {
    public id: number;
    public actif: boolean;
    public dtNaiss: Date;
    public ageMois: number;
    public nom: string;
    public prenom: string;

    constructor() { }
}
