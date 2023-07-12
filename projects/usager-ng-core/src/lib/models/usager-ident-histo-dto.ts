import { UsagerCommHistoDTO } from './usager-comm-histo-dto';
import { UsagerLieuResidenceHistoDTO } from './usager-lieu-residence-histo-dto';

/**
 * Classe représentant l'historique d'un usager.
 * Elle est une repésentation js de la classe ca.qc.gouv.msss.sigct.usager.model.support.UsagerIdentHistoDTO
 */
export class UsagerIdentHistoDTO {
  public id: number;
  public idUsagerIdent: number;
  public actif: boolean;
  public detail: string;
  public dtNaiss: Date;
  public codeReferenceLangueUsage: string;
  public nomReferenceLangueUsage: string;
  public codeReferenceSexe: string;
  public nomReferenceSexe: string;
  public malentendant: boolean;
  public nam: string;
  public namAnneeExpir: number;
  public namMoisExpir: number;
  public niveauIdent: string;
  public nom: string;
  public nomMere: string;
  public nomPere: string;
  public prenom: string;
  public prenomMere: string;
  public prenomPere: string;

  public usagerCommHistos: UsagerCommHistoDTO[];
  public usagerLieuResidenceHistos: UsagerLieuResidenceHistoDTO[];

  constructor() { }
}
