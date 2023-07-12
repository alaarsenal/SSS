
/**
 * Classe représentant l'historique d'un usager.
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.usager.model.support.UsagerCommHistoDTO
 */
export class UsagerCommHistoDTO {
  public id: number;
  public idUsagerIdentificationHisto: number;
  public actif: boolean;
  public coordonnees: string;
  public detail: string;
  public codeTypeCoordComm: string;
  public nomTypeCoordComm: string;
  public codeTypeEquipComm: string;
  public nomTypeEquipComm: string;

  constructor() { }
}
