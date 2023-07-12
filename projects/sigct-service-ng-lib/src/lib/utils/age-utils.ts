import { ReferenceDTO } from '../models/reference-dto';
import CollectionUtils from './collection-utils';

export default class AgeUtils {
  /**
   * Formate l'age d'un usager au format court selon l'algorythme suivant:
   * - Lorsque l'age calculé > 1 ans, on affiche seulement les année de l'âge calculé (exemple : 2 ans 3 mois -> '2 ans').
   * - Lorsque l'âge calculé < 1 an et >= 1 mois, on affiche seulement les mois de l'âge calculé (exemple : 3 mois 4 jours -> '3 mois').
   * - Lorsque l'âge calculé < 1 mois, on affiche seulement les jours de l'âge calculé (exemple 25 jours -> '25 jours').
   * @param annees nombre d'années
   * @param mois nombre de mois
   * @param jours nombre de jours
   */
  static formaterAgeFormatCourt(annees: number, mois: number, jours: number): string {
    let age: string = null;

    const nbTotMois: number = (annees * 12) + mois + (jours / 30);
    const nbAnnees: number = Math.floor(nbTotMois / 12);
    const nbMois: number = Math.floor(nbTotMois - (nbAnnees * 12));

    if (nbAnnees && nbAnnees > 0) {
      age = nbAnnees + (nbAnnees == 1 ? " an" : " ans");
    } else if (nbMois && nbMois > 0) {
      age = nbMois + " mois";
    } else if (jours && jours > 0) {
      age = jours + (jours == 1 ? " jour" : " jours")
    }
    return age;
  }

  /**
   * Formate l'age d'un usager au format long selon l'algorythme suivant:
   * - Lorsque l'age calculé > 1 ans, on affiche les années et les mois de l'âge calculé (exemple : 2 ans 3 mois 25 jours -> '2 ans 3 mois').
   * - Lorsque l'âge calculé < 1 an et >= 1 mois, on affiche les mois et les jours de l'âge calculé (exemple : 0 ans 3 mois 25 jours -> '3 mois 4 jours').
   * - Lorsque l'âge calculé < 1 mois, on affiche seulement les jours de l'âge calculé (exemple 0 ans 0 mois 25 jours -> '25 jours').
   * @param annees nombre d'années
   * @param mois nombre de mois
   * @param jours nombre de jours
   */
  static formaterAgeFormatLong(annees: number, mois: number, jours: number): string {
    let age: string = null;

    const nbTotMois: number = (annees * 12) + mois + (jours / 30);
    const nbAnnees: number = Math.floor(nbTotMois / 12);
    const nbMois: number = Math.floor(nbTotMois - (nbAnnees * 12));
    const nbJours: number = jours % 30;

    if (nbAnnees && nbAnnees > 0) {
      age = nbAnnees + (nbAnnees == 1 ? " an" : " ans");
      if (nbMois) {
        age += " " + nbMois + " mois";
      }
    } else if (nbMois && nbMois > 0) {
      age = nbMois + " mois";
      if (nbJours && nbJours > 0) {
        age += " " + nbJours + (nbJours == 1 ? " jour" : " jours")
      }
    } else if (nbJours >= 0) {
      age = nbJours + (nbJours <= 1 ? " jour" : " jours")
    }
    return age;
  }

  static getNomGroupeAge(groupesAge: ReferenceDTO[], annes: number, mois: number, jours: number): string {
    if (CollectionUtils.isBlank(groupesAge)) {
      return null;
    }
    const totalMois: number = (annes ? annes * 12 : 0) + (mois ? mois : 0) + (jours / 30 >> 0);
    let groupAge: ReferenceDTO = groupesAge.find(item => (item.min && item.min <= totalMois) && (!item.max || totalMois <= item.max));
    return groupAge?.nom;
  }

  static ageToNbMois(annees: number, mois: number): number {
    let nbMois: number = null;
    if (annees || mois) {
      nbMois = 0;
      if (annees) {
        nbMois += annees * 12;
      }
      if (mois) {
        nbMois += mois;
      }
    }
    return nbMois;
  }
}
