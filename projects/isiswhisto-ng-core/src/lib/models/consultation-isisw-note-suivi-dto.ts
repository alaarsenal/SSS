import { GenericSectionImpressionDTO } from "projects/sigct-ui-ng-lib/src/lib/model/generic-section-impression-fiche-dto";

export class ConsultationIsiswNoteSuiviDTO extends GenericSectionImpressionDTO {

  consentementOrganismeEnregistreur: boolean;     //consentement
  usagerAutoriseTransmission: boolean;            //transmission_authorization
  noteSuivi: string;                              //followup_note
}
