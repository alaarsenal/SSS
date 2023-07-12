export class MedicationDTO {

    public id: number;
    public idEnregistrement: number;
    public medicament: string;
    public actif:boolean = true;
    public dateDebut:Date;

    public visible:boolean = true;

    get nom(): string {
      return this.medicament;
    }

    set nom(val) {
      this.medicament = val;
    }

    constructor() {
    }
}
