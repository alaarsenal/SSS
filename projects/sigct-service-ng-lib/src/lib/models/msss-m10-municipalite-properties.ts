import { MsssM10Province } from './msss-m10-province';
import { MsssM10Pays } from './msss-m10-pays';

export class MsssM10MunicipaliteProperties {
    public id: string;
	public mun_reference: string;
	public nom_mun: string;
	public recherche: string;
	public province: MsssM10Province;
	public pays: MsssM10Pays;
}