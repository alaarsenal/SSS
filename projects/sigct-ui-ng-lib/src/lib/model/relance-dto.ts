export class RelanceDTO {

  id: number;
  ficheAppelId?: number;
  referenceStatutRelanceId?: number;
  organismeId?: number;
  dateHeureDebut: Date;
  heureDebut: string;
  dateHeureFin: Date;
  heureFin: string;
  dateFermeture?: Date;
  fermeUsername?: string;
  assigneUsername?: string;
  details: string;

  //Pour la liste des relances
  referenceStatutRelanceNom?: string;
  fermeUsernameLabel?: string;
  statutFermetureLabel?: string;
  assignationLabel?: string;
  idAppel?: number;
  nomPrenomUsager?: string;
}
