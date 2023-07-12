import { ConsultationIsiswUsagerDTO } from './consultation-isisw-usager-dto';
import { ConsultationIsiswCentreActiviteDTO } from './consultation-isisw-centre-activite-dto';
import { ConsultationIsiswCollecteDonneesDTO } from './consultation-isisw-collecte-donnees-dto';
import { ConsultationIsiswInterventionDTO } from './consultation-isisw-intervention-dto';
import { ConsultationIsiswReferenceDTO } from './consultation-isisw-refenrece-dto';
import { ConsultationIsiswEvaluationDTO } from './consultation-isisw-evaluation-dto';
import { ConsultationIsiswNotesComplementaireDTO } from './consultation-isisw-notes-complementaire-dto';
import { ConsultationIsiswNoteSuiviDTO } from './consultation-isisw-note-suivi-dto';
import { ConsultationIsiswProfessionnelDTO } from './consultation-isisw-professionnel-dto';
import { ConsultationIsiswHistoriqueDTO } from './consultation-isisw-historique-dto';

export class ConsultationIsiswWrapperDTO {

  idFicheIsisw: number;
  nomFichierPdf?: string;
  contenuFichierPdf?: any[];

  sectionUsager: ConsultationIsiswUsagerDTO;
  sectionCentreActivite: ConsultationIsiswCentreActiviteDTO;
  sectionCollecteDonnees: ConsultationIsiswCollecteDonneesDTO;
  sectionIntervention: ConsultationIsiswInterventionDTO;
  sectionReference: ConsultationIsiswReferenceDTO;
  sectionEvaluation: ConsultationIsiswEvaluationDTO;
  sectionNotesComplementaire: ConsultationIsiswNotesComplementaireDTO;
  sectionNoteSuivi: ConsultationIsiswNoteSuiviDTO;
  sectionProfessionnel: ConsultationIsiswProfessionnelDTO;
  sectionHistorique: ConsultationIsiswHistoriqueDTO;
}
