export class SoinServiceDTO {
  public id: number;
  public idEnregistrement: number;
  public idReferenceTypeSoinService: number;
  public typeSoinService: string;
  public commentaires: string;
  public actif:boolean = true;
  public dateDebut:Date;
  public dateDesactivation: Date;
	public desactivationUsername: string;
	public dateCreation: Date;
	public creeUsername: string;
	public dateModifie: Date;
  public modifieUsername: string;

  public visible:boolean = true;

}
