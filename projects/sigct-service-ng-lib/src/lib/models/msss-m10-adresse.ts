import { TypeTerritoireEnum } from './msss-m10-type-territoire-enum';

export class MsssM10Adresse {
    public typeAdresse: TypeTerritoireEnum;

    public codePostal: string;
    public municipaliteCode: string;
    public municipaliteNom: string;
    
    public adrId: string;
    public adrNoCivique: number;
    public adrNoCiviqueSuffixe?: string;
    public adrRue: string;

    public paysCode: string;
    public paysNom: string;

    public provinceCode: string;
    public provinceNom: string;

    public rssCode: string;
    public rssNom: string;

    public rtsCode: string;
    public rtsNom: string;

    public rlsCode: string;
    public rlsNom: string;

    public clscCode: string;
    public clscNom: string;

    public highlight: string;
    public adrComplete: string;
}