import { GenericSectionImpressionDTO } from "projects/sigct-ui-ng-lib/src/lib/model/generic-section-impression-fiche-dto";

export class ConsultationIsiswHistoriqueDTO extends GenericSectionImpressionDTO {

  dateNaissance: string;      //histo_birthday
  sex: string;                //histo_gender_code
  langue: string;             //histo_language
  codePostal: string;         //histo_postal_code
  municipalite: string;       //histo_municipality_name
  region: string;             //histo_region_name
}
