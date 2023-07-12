
//Fonction pour valider les Numéro d'Assurance Maladie
export function nam_validator(valeur:string):boolean { 

    //Variable de résultat
    var valide:boolean = false;

    if (valeur){

      //3 premières lettre du nom de famille et la première du prénom                          
      var nom:string = valeur.substr(0,4);
    
      //L'année de naissance
      var annee:number = 1900 + parseInt(valeur.substr(5,2),10);
    
      //Le sexe
      var sexe:string;

      if((parseInt(valeur.substr(7,2),10)) > 50){
          sexe = "F";
      } else {
          sexe = "M";
      }

      //Le mois de naissance
      var mois:number;

      if(sexe == "F"){
         mois = parseInt(valeur.substr(7,2),10) - 50;
      } else {
         mois = parseInt(valeur.substr(7,2),10)  
      }

      //Jour de naissance
      var jour:number = parseInt(valeur.substr(10,2),10);

      //Caractère pour distingué des jumeaux
      var jumeau:string = valeur.substr(12,1);

      //Validateur
      var valideur:number = parseInt(valeur.substr(13,1),10);

      //Total des valeurs
      var sommes:number = 0;

      sommes = calcul(nom,annee,sexe,mois,jour,jumeau);

      var crc = parseInt(sommes.toString().substr(-1),10);

      if(valideur == crc){
          valide = true; 
      } else {
          sommes = calcul(nom,(annee - 100),sexe,mois,jour,jumeau);
        
          crc = parseInt(sommes.toString().substr(-1),10);

          if(valideur == crc){
              valide = true;
          }
      }
    } else {
        valide = true;
    }
    
    return valide;                           

}

function calcul(nom:string, annee:number, sexe:string, mois:number, jour:number, jumeau:string):number{

    //Total des valeurs
    var sommes:number = 0;

    sommes = sommes + (multiplicateur(nom.substr(0,1),1));
    sommes = sommes + (multiplicateur(nom.substr(1,1),3));
    sommes = sommes + (multiplicateur(nom.substr(2,1),7));
    sommes = sommes + (multiplicateur(nom.substr(3,1),9));
    
    var anneeN:string = annee.toString();
    sommes = sommes + (multiplicateur(anneeN.substr(0,1),1));
    sommes = sommes + (multiplicateur(anneeN.substr(1,1),7));
    sommes = sommes + (multiplicateur(anneeN.substr(2,1),1));
    sommes = sommes + (multiplicateur(anneeN.substr(3,1),3));

    sommes = sommes + (multiplicateur(sexe,4));

    var moisN:string;
    if(mois < 10){
        moisN = "0" + mois.toString();
    } else {
        moisN = mois.toString();
    }
    

    sommes = sommes + (multiplicateur(moisN.substr(0,1),5));
    sommes = sommes + (multiplicateur(moisN.substr(1,1),7));

    var jourN:string;
    if(jour< 10){
        jourN = "0" + jour.toString();
    } else {
        jourN = jour.toString();
    }



    sommes = sommes + (multiplicateur(jourN.substr(0,1),6));
    sommes = sommes + (multiplicateur(jourN.substr(1,1),9));

    sommes = sommes + (multiplicateur(jumeau,1));

    return sommes;

}

function multiplicateur(valeur:string, multi:number):number {

     var resultat:number = 0;    

    //Matrice des valeurs correspondantes aux caractère du NAM  
    var carTab:string[][] = [
        ["A","193"],["B","194"],["C","195"],["D","196"],["E","197"],["F","198"],["G","199"],["H","200"],["I","201"],
        ["J","209"],["K","210"],["L","211"],["M","212"],["N","213"],["O","214"],["P","215"],["Q","216"],["R","217"],
        ["S","226"],["T","227"],["U","228"],["V","229"],["W","230"],["X","231"],["Y","232"],["Z","233"],["0","240"],
        ["1","241"],["2","242"],["3","243"],["4","244"],["5","245"],["6","246"],["7","247"],["8","248"],["9","249"]
     ];

     for(var i = 0; i < carTab.length; i++){

        if(carTab[i][0] === valeur){

           resultat = parseInt(carTab[i][1],10) * multi;
           break;  

        }

     } 


     return resultat;

}