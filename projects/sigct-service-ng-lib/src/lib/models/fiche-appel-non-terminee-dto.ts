export class FicheAppelNonTermineeDTO {
    public analyseSituation: string; // Propre à Social
    public dateDebutAppel: any;
    public dtNaiss: any;
    public regionCodeAndName: string;
    public id: number;
    public idAppel: number;
    public nom: string;
    public prenom: string;
    public regionCode: string;
    public regionNom: string;
    public demandeInitiale: string; // Propre à Santé
    public saisieDifferee: boolean; // Propre à Santé

    constructor(analyseSituation: string,
        dateDebutAppel: any,
        dtNaiss: any,
        regionCodeAndName: string,
        id: number,
        idAppel: number,
        nom: string,
        prenom: string,
        demandeInitiale: string,
        saisieDifferee: boolean) {
        this.analyseSituation = analyseSituation;
        this.dateDebutAppel = dateDebutAppel;
        this.dtNaiss = dtNaiss;
        this.regionCodeAndName = regionCodeAndName;
        this.id = id;
        this.idAppel = idAppel;
        this.nom = nom;
        this.prenom = prenom;
        this.demandeInitiale = demandeInitiale;
        this.saisieDifferee = saisieDifferee;
    }
}
