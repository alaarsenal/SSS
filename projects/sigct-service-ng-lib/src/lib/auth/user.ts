export interface User {
    name:string;
    authorities?:string[];
    prenom:string;
    nomFamille:string;
    idOrganismeCourant:number;
    codRegionOrganismeCourant:string;
    nomOrganismeCourant:string;
    codeOrganismeCourant:string;
    nomRegionOrganismeCourant:string;
    NbDaysToPwdExpire:number;
}
