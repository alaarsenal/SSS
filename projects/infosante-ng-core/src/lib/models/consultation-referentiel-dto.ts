import { GenericSectionImpressionDTO } from "projects/sigct-ui-ng-lib/src/lib/model/generic-section-impression-fiche-dto";
import { ProtocoleDTO } from "./protocole-dto";

export class ConsultationReferentielDTO extends GenericSectionImpressionDTO {

    intervention: string;
    listeProtocole: ProtocoleDTO[];
}