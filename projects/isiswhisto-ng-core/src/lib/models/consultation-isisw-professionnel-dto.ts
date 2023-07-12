import { GenericSectionImpressionDTO } from "projects/sigct-ui-ng-lib/src/lib/model/generic-section-impression-fiche-dto";

export class ConsultationIsiswProfessionnelDTO extends GenericSectionImpressionDTO {

  appelTraitePar: string;             //created_firstname + created_lastname + created_user_code
  poste: string;                      //workstation
  debutAppel: string;                 //beginCallFormattedGMT
  finAppel: string;                   //endCallFormattedGMT
  dureeAppel: string;                 //begin_call - end_call
  saisieRapideEffectueePar: string;   //modify_user_code
  idFicheAppelIsisw: number;
}
