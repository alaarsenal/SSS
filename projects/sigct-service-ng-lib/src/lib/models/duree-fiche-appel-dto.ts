export class DureeFicheAppelDTO {
  public dateDebut: Date;
  public dateFin?: Date;
  public dureeCorrigee: number;
  public dureeCumulee?: number;
  public detailsDureeCorrigee: string;
  public isDureeVisible?: boolean;

  public dateCreation?: Date;
  public dateFinSaisieDifferee?: Date;

  constructor() {
  }
}
