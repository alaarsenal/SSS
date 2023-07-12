import { ListeAvertissementDTO } from 'projects/sigct-service-ng-lib/src/lib/models/liste-avertissement-dto';

export class ConsultationSectionAppelantCommDTO extends ListeAvertissementDTO {

    id?: number;
	coordonnees?: string;
	detail?: string;
	typeEquip?: string;
	typeCoord?: string;
    idAppelant?: number;
    codeTypeEquip?: string;
}
