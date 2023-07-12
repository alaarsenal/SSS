import { ListeAvertissementDTO } from 'projects/infosocial-ng-core/src/lib/models/liste-avertissement-dto';

/**
* Classe représentant une autre source d'information. 
* Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.infosocial.model.support.SourceInformationDTO
*/
export class SourcesInformationDTO extends ListeAvertissementDTO {

    public id: number;
	public details: string;
	public idFicheAppel: number;
	public codeRefSourceInformation: string;

}