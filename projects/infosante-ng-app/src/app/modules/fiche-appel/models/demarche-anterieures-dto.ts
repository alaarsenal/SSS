/**
 * Classe représentant un antecedent 
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.infosante.model.DemarcbeAnterieures
 */
export class DemarcheAnterieuresDTO {

    id?: number;
    idFicheAppel: number;
    referenceResultatObtenuId?: number;
    dateDemandeEvaluation?: Date;
    detailDemandeEvaluation?: string;
    heures?: string;
    details?: string;
    autosoin?: string;
    referenceResultatObtenuDescription?: string;
    referenceResultatObtenuNom?: string;
    actif?: boolean;
    execution?: string;
    valid?: boolean;
    avertissements?: [];
    erreurs?: [];

}