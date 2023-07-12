
/**
 * Classe représentant un appel. 
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.infosante.model.Antecedent
 */
export class AntecedentDTO {
    id?: number;
    
    details?: string;
    presence: string;
    referenceAntecedent: number;
    ficheAppel: number;
    antecedent?: string;
    actif?: boolean;

}