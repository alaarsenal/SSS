import { ConsultationAntecedentDTO } from './consultation-antecedent-dto';
import { ConsultationMedicationDTO } from './consultation-medication-dto';
import { ConsultationManifestationSigneDemarcheAnterieureDTO } from './consultation-manifestation-signe-demarche-anterieure-dto';

/**
 * Classe regroupant les informations de type Demande et évaluation de la section Consultation
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.infosante.model.support.ConsultationDemandeEvaluationDTO
 */
export class ConsultationDemandeEvaluationDTO {
  idFicheAppel: number;
  niveauUrgence: string;
  typeConsultation: string;
  demandeInitiale: string;
  consentementFichesAnterieurs: boolean;
  reseauSoutien: string;
  detailsSoutien: string;
  donneesPertinentes: string;
  constatEvaluation: string;

  antecedent: number;
  antecedents: ConsultationAntecedentDTO[];
  medication: number;
  medications: ConsultationMedicationDTO[];
  manifestationSigneDemarcheAnterieures: ConsultationManifestationSigneDemarcheAnterieureDTO[];

  referenceRaisonTypeFicheCode: string;
}
