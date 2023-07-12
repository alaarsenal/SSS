export class ValidationDTO {

  public id: number;
  public reponse: string;
  public idFicheAppel: number;
  public idReferenceValidation: number;
  public nomReferenceValidation?: string;
  public codeRefTypeFicheAppel?: string;

  public validationsFinales?: Map<string, string>;
  public avertissements?: Map<string, string>;

  constructor() { }
}
