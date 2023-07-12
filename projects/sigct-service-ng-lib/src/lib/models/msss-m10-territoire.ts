
export class MsssM10Territoire {
    /** "00" */
    static readonly CODE_REGION_AUCUNE: string = "00";
    /** "Aucune" */
    static readonly NOM_REGION_AUCUNE: string = "Aucune";

	public type: string;
	public code: string;
	public nom: string;

	constructor(type: string, code: string, nom: string) {
		this.type = type;
		this.code = code;
		this.nom = nom;
	}
}