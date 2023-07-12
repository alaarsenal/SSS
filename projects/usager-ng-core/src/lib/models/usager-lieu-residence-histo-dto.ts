import { UsagerCommHistoDTO } from './usager-comm-histo-dto';

/**
 * Classe représentant l'historique d'un usager.
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.usager.model.support.UsagerLieuResidenceHistoDTO
 */
export class UsagerLieuResidenceHistoDTO {
  public id: number;
  public idUsagerIdentificationHisto: number;
  public actif: boolean;
  public adresse: string;
  public clscCode: string;
  public clscNom: string;
  public codePostal: string;
  public detail: string;
  public codeTypeAdresse: string;
  public nomTypeAdresse: string;
  public codeCategSubdvImmeu: string;
  public nomCategSubdvImmeu: string;
  public codePays: string;
  public nomPays: string;
  public codeProvince: string;
  public nomProvince: string;
  public codeRegion: string;
  public nomRegion: string;
  public municCode: string;
  public municNom: string;
  public noCiviq: number;
  public noCiviqSuffx: string;
  public rlsCode: string;
  public rlsNom: string;
  public rtsCode: string;
  public rtsNom: string;
  public subdvImmeu: string;

  constructor() { }
}
