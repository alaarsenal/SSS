import { GenericSectionImpressionDTO } from "projects/sigct-ui-ng-lib/src/lib/model/generic-section-impression-fiche-dto";

export class ConsultationIsiswCollecteDonneesDTO extends GenericSectionImpressionDTO {

  motifAppel: string;      //reason
  aconsulter: string;       //previous_step
  quand: string;            //timing_previous_step
  traitementSuivi: string;  //treatment_followed
  resultatObtenu: string;   //consult_result
  precisions: string;       //step_details
  listeRaison: string[];      //liste_raison
}
