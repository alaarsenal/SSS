import { MsssM10Province } from './msss-m10-province';
import { MsssM10Pays } from './msss-m10-pays';

export class MsssM10AdresseProperties {
	public id: string;
	public adresse_reference: string;
    public code_postal: string;
	public municipaliteCode: string; // lorsque municipalité actuelle
	public municipalite: string;  	 // lorsque municipalité actuelle
	public mun_reference: string;    // lorsque ancienne municipalité (nouveau nom)
	public nom_mun: string;          // lorsque ancienne municipalité (ancien nom)
	public numero_civique: number;
	public numero_civique_suffixe?: string;
	public recherche:string;
	public rue: string;
	public province: MsssM10Province;
	public pays: MsssM10Pays;
}