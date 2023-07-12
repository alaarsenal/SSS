import { MsssM10Territoire } from './msss-m10-territoire';

/**
 * Classe qui représente la structure d'un code postal retourné par les services web M10.
 */
export class MsssM10CodePostal {
    public codePostal: string;
    public codeMunicipalite: string;
    public nomMunicipalite: string;
    public territoires: MsssM10Territoire[] = [];
}