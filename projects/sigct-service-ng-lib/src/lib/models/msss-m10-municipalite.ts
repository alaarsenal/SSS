import { MsssM10Province } from './msss-m10-province';
import { MsssM10Pays } from './msss-m10-pays';
import { TypeTerritoireEnum } from './msss-m10-type-territoire-enum';

export class MsssM10Municipalite {
	public typeMunicipalite: TypeTerritoireEnum;
    public code: string;
	public nom: string;
	public ancienNom: string;
	public codePostal: string;
	public highlight: string;
	public province: MsssM10Province;
	public pays: MsssM10Pays;
}