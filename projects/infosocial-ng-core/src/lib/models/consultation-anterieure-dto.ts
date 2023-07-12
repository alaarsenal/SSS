/**
 * Classe représente une medication. 
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.infosocial.model.support.ConsultationDTO
 */
export class ConsultationAnterieureDTO {
    id: number;
    quand?: string;
    raison: string;
    precision?: string;
    idFicheAppel?: number;
    codeRefRessConsult: string;
    nomRefRessConsult?: string;

    constructor() { }
}
