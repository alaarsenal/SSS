/**
 * Classe représentant un appel antérieur d'un usager. 
 * Elle est basée sur la classe ca.qc.gouv.msss.sigct.usager.model.solr.SAppel
 */
export class AppelAnterieurDTO {
  public id: string;
  public idAppel: number;
  public idFicheAppel: number;
  public domaine: string;
  public sis: string;
  public dtDebutFicheAppel: Date;
  public nom: string;
  public prenom: string;
  public sexe: string;
  public codeNomRegion: string;
  public codePostalAffiche: string;
  public telephoneAffiche: string;
  public idStOrganismes: number;
  public accessible: boolean;
  public nomOrganisme: string;
}