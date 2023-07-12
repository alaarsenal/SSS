/**
 * Classe représentant un antecedent 
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.infosante.model.Antecedent
 */
export class AntecedentDTO {
    id?: number;

    details?: string;
    presence: string;
    referenceAntecedentId: number;
    idFicheAppel: number;
    antecedent?: string;
    actif?: boolean;

}