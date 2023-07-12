import { ListeAvertissementDTO } from './liste-avertissement-dto';

/**
* Classe représentant une autre source d'information. 
* Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.infosante.model.support.SourceInformationDTO
*/
export class SourcesInformationDTO extends ListeAvertissementDTO {

    public id: number;
	public details: string;
	public idFicheAppel: number;
	public codeRefSourceInformation: string;
	public typeSource?: string;
	public source?: string;
	public isDownloadSource?: boolean;
	public nom?: string;
	public description?: string;
	public actif?: string;

}