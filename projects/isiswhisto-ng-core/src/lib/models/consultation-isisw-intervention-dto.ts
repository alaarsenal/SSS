import { GenericSectionImpressionDTO } from "projects/sigct-ui-ng-lib/src/lib/model/generic-section-impression-fiche-dto";

export class ConsultationIsiswInterventionDTO extends GenericSectionImpressionDTO {

  problemIdentification: string;        //problem_identification
  listeConseilProtocole: string[]       //liste_protocol’
  reponseProtocole: string;             //other_protocol
  consultation: string                  //consult_protocol
  heureConsultation: string             //timing_consult_protocol
  listeRoleAction: string;              //liste_role_action
}
