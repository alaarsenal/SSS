import { TableFichierDTO } from "projects/sigct-service-ng-lib/src/lib/models/TableFichierDTO";
import { GenericSectionImpressionDTO } from "./generic-section-impression-fiche-dto";

export class SectionFichiersDTO extends GenericSectionImpressionDTO {

   fichiers: TableFichierDTO[];
}
