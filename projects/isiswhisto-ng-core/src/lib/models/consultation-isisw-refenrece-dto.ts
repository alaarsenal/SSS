import { GenericSectionImpressionDTO } from "projects/sigct-ui-ng-lib/src/lib/model/generic-section-impression-fiche-dto";

export class ConsultationIsiswReferenceDTO extends GenericSectionImpressionDTO {

  listeSuite: string[];           //liste_suite
  organisme: string;              //resource_name
  professionnel: string;          //suite_intervenant
  delaiPriseCharge: string;       //suite_delay
  heureDelaiPriseCharge: string;  //suite_dthr
  siPasAmelioration: string;      //follow_up_if_no_improvment
  consulter: string;              //recommanded_follow_up
  relancePrevu: string;           //relance_dthr
}
