export abstract class ListeAvertissementDTO {

  listeAvertissement : string[];

  public getListeAvertissement?():string[]{

      if(this.listeAvertissement){
           return this.listeAvertissement;
      }

  }

}
