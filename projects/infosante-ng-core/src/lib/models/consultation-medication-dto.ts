/**
 * Classe représentant un signe vital
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.infosante.model.support.ConsultationMedicationDTO
 */
export class ConsultationMedicationDTO {
     id: number;
     medicament: string;
     presence: boolean;
     details: string;
}