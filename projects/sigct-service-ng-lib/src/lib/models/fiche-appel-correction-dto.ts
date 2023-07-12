export class FicheAppelCorrectionDTO {

  id: number;
  idFicheAppel: number;
  corrigeUsername?: string;
  dateCorrection?: Date;
  raisonCorrection?: string;

  //Autres données pour la consultation et l'impression
  nomUtilisateur?: string;
  prenomUtilisateur?: string;
  titreUtilisateur?: string;
  codeRegionOrganisme?: string;
  nomOrganisme?: string;
  signatureUtilisateur?: string;

  constructor() { }
}
