export default class TelephoneUtils {

  /**
   * Formate un numéro de téléphone "1234567890" en "123 456-7890"
   * @param tel
   */
  static formatTelephone(tel:string){
    return tel.substring(0, 3) + " " + tel.substring(3, 6) + "-" + tel.substring(6, 10);
  }  

  /**
   * Formate un numéro de téléphone "1234567890#1234" en "123 456-7890" ou "123 456-7890 Poste 1234" selon la valeur de showPoste.
   * @param tel numéro de téléphone avec poste
   * @param showPoste indique si le poste est affiché dans le numéro de téléphone
   * @returns 
   */
  static formatTelephoneAvecPoste(tel: string, showPoste: boolean = true): string {
    if (tel) {
      if (tel.length > 11) {
        if (showPoste) {
          return this.formatTelephone(tel) + " Poste " + tel.substring(11);
        } else {
          return this.formatTelephone(tel);
        }
      } else if (tel.length >= 10) {
        return this.formatTelephone(tel);
      } else {
        return tel;
      }
    } else {
      return "";
    }
  }

}
