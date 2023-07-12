/**
 * Classe représentant un antecedent
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.infosante.model.Antecedent
 */
export class ManifestationDTO {
    id?: number;

    details?: string;
    presence: string;
    manifestationDesc?: string;
    referenceManifestationId: number;
    idFicheAppel: number;
    dateDemandeEvaluation?: string;
    detailDemandeEvaluation?: string;
    actif?: boolean;
    valid?: boolean;
    execution?: string;
    heures?: string;

}
