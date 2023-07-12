/**
 * Classe représentant un antecedent 
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.infosante.model.Antecedent
 */
export class DemarcheTraitementDTO {

    id?: number;
    idFicheAppel: number;
    referenceRessourceConsulte: string;
    referenceResultatObtenu?: string;
    dateDemandeEvaluation?: Date;
    detailDemandeEvaluation?: string;
    heures?: string;
    details?: string;
    traitement?: string;
    ressourceConsulte?: string;
    resultatObtenu?: string;
    actif?: boolean;
    execution?: string;
    valid?: boolean;

}