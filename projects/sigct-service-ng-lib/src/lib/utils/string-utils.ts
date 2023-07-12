export default class StringUtils {

  /**
   * Vérifie si 2 chaines de caractères sont égales en évitant les NullPointerException.
   * Null, undefined et "" sont considérés égaux.
   * @param str1 première chaine de caractères à comparer.
   * @param str2 deuxième chaine de caractères à comparer.
   */
  static safeEquals(str1: string, str2: string): boolean {
    let comp1: string = (str1 ? str1 : "");
    let comp2: string = (str2 ? str2 : "");

    return comp1 === comp2;
  }

  /**
   * Vérifie si 2 chaines de caractères sont égales ignorant la casse et en évitant les NullPointerException.
   * Null, undefined et "" sont considérés égaux.
   * @param str1 première chaine de caractères à comparer.
   * @param str2 deuxième chaine de caractères à comparer.
   */
  static safeEqualsIgnoreCase(str1: string, str2: string): boolean {
    let comp1: string = (str1 ? str1.toLowerCase() : "");
    let comp2: string = (str2 ? str2.toLowerCase() : "");

    return comp1 === comp2;
  }

  /**
   * Retourne true si str est vide.
   * @param str
   */
  static isEmpty(str: string): boolean {
    return str == undefined || str == null || str.length == 0;
  }

  /**
   * Retourne true si str est vide ou s'il contient que des espaces.
   * @param str
   */
  static isBlank(str: string): boolean {
    return str == undefined || str == null || str.trim().length == 0;
  }

  /**
   * Retourne true si str contient que des chiffres.
   * @param str
   */
  static isDigits(str: string): boolean {
    return /^\d+$/.test(str);
  }

  /**
   * Retourne une chaine de caractère avec la première lettre en majuscule
   * On ne peut pas utiliser le pipe LittleCase car si l'utilisateur saisi des caractères majuscules
   * autres que début de chaque mot on veut les garder.
   * Ex. éMiLe devient ÉMiLe et non Émile
   * Voici les caractères utilisés pour les tests :
   * élE-èMi-ê-ë-ù-ü-û-ï-ì-à-â-ÿ-ô-ò-ñ devient ÉlE-ÈMi-Ê-Ë-Ù-Ü-Û-Ï-Ì-À-Â-Ÿ-Ô-Ò-Ñ
   * élE èMi ê ë ù ü û ï ì à â ÿ ô ò ñ devient ÉlE ÈMi Ê Ë Ù Ü Û Ï Ì À Â Ÿ Ô Ò Ñ
   * jean-paul noel                    devient Jean-Paul Noel
   * jean-paul  noel                   devient Jean-Paul Noel
   * @param str
   */
  static convertFirstLetterToUpperCase(str: string): string {

    // Transformation des caractères avant un ou plusieurs espaces
    let sb = str.replace(/(^|\s+)(.)/g, function (m, p1, p2) {
      return p1 + p2.toUpperCase();
    });

    // Transformation des caractères avant un tiret
    sb = sb.replace(/(^|-)(.)/g, function (m, p1, p2) {
      return p1 + p2.toUpperCase();
    });

    //Suppression des espaces en double
    sb = sb.replace(/\s+/g, ' ');

    return sb;
  }

  /**
   * Convertit les caractères accentués de la chaîne de caractère en entrée en caractère sans accent
   * Voir https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
   * Et https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
   * @param str
   */
  static convertAccentCharacter(str: string): string {

    let resultat: string = "";

    if (!this.isEmpty(str)) {
      resultat = str.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
    }

    return resultat;
  }

  /**
   * Retourne un nombre dans une string débutant avec des 0.
   * @param num nombre à "pader"
   * @param places nombre de places à "pader"
   * @returns une string contenant le nombre "padé" avec des 0 devant
   */
  static padLeftZeros = (num, places) => String(num).padStart(places, '0');

  /**
   * Unescape un texte en remplaçant les codes &#0000; par les caractères correspondants.
   * @param value texte à transformer
   * @returns texte avec des caractères ascii.
   */
  static unescape(value: string): string {
    const doc = new DOMParser().parseFromString(value, 'text/html');
    return doc.documentElement.textContent;
  }
}
