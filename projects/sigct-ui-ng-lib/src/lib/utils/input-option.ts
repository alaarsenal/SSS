export interface InputOption {
  label: string;
  value: string;
  description?: string;
  selected?: boolean;
  actif?: boolean;

  /**Utiliser pour créer un label avec une partie sous forme de lien
   * Ex.: voir page demande et évaluation, champ raison
   */
  labelBeforeLink?: string;
  link?: string;
  labelAfterLink?: string;
}

export interface InputOptionCollection {
  name: string;
  options: Array<InputOption>;
}
