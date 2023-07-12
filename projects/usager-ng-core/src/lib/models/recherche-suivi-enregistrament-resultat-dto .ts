/**
 * Classe représentant le résulat de la recherche de suivi de enregistrament.
 */
export class RechercheSuiviEnregistramentResultatDTO {
  id: number;
  idUsager: number;
  idEnregistrement: number;
  cree: Date;
  fermPrevue: Date;
  aReviser: Date;
  usager: string;
  type: string;
  site: string;
  gestionaire : string;
  organisme : string;
  nam : string;
	dtNaissance : string;
}
