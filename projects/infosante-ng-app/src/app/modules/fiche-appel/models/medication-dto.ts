/**
 * Classe représentant une médication.
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.infosante.model.Medication
 */
export class MedicationDTO {
    id?: number;

    details?: string;
    presence: string;
    medicament: string;
    idFicheAppel: number;
    actif?: boolean;

}
