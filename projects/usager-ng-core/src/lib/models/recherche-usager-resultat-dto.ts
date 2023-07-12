import { GroupeAgeOptions } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-groupe-age/sigct-group-age.options';
import { BaseUsagerDTO } from './base-usager-dto';

/**
 * Classe représentant le résulat de la recherche d'usager. 
 * Elle est basée sur la classe ca.qc.gouv.msss.sigct.usager.model.solr.SUsager
 */
export class RechercheUsagerResultatDTO implements BaseUsagerDTO {
  public nam: string;
  public dtNaiss: Date;
  public langueCode: string;
  public doublonPotentiel: boolean;
  public malentendant: boolean;
  public nom: string;
  public prenom: string;
  public sexeCode: string;
  public communication: string;
  public region: string;
  public codePostal: string;
  public adresse: string;
  public phonetic: string;
  public municipalite: string;
  public telephone: string;
  public displayAll: boolean = false;
  public id: number;
  public moyen: string;
  public nbAppelAnterieurSante: number;
  public nbAppelAnterieurSocial: number;
  public statutEnregistrement: string;

  public groupeAgeOptions: GroupeAgeOptions = null;

  constructor() {
  }
}