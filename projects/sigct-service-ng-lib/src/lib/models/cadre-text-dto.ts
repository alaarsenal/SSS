
export enum TypeCadre {
    Ordinaire,
    Fieldset,
}
export class CadreTextDto {
    public plainText: string;
    public titleLabel: string;
    public titleValue?: string;
    public infoList: string[];
    public typeCadre: TypeCadre;
    public titleFieldset?: string;
    public datas: Map<string, any>; // Ici data est une information contenant tout ce qu'il faut pour construire un URL pour chaque non contenu dans infoList, dont chaque nom est une entrée dans la Map.
    public isFicheAppelOuvert: boolean;
    constructor() {
    }
}
