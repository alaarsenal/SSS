import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ReferencesApiService } from 'projects/infosante-ng-core/src/lib/services/references-api.service';
import { AppContextStore } from 'projects/sigct-service-ng-lib/src/lib/store/app-contexte-store';
import AgeUtils from 'projects/sigct-service-ng-lib/src/lib/utils/age-utils';
import { SigctChosenComponent } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-chosen/sigct-chosen.component';
import { GroupeAgeOptions } from 'projects/sigct-ui-ng-lib/src/lib/components/sigct-groupe-age/sigct-group-age.options';
import { Subscription } from 'rxjs';
import { NiveauIdentificationUsager } from '../../../enums/niveau-identification-usager-enum';
import { ReferenceDTO } from '../../../models/reference-dto';
import { UsagerCommDTO } from '../../../models/usager-comm-dto';
import { UsagerDTO } from '../../../models/usager-dto';
import { UsagerLieuResidenceDTO } from '../../../models/usager-lieu-residence-dto';

export enum couleurCadenas {
  ROUGE = "rouge",
  JAUNE = "jaune",
  VERT = "vert"
}

export enum enumMoyenComm {
  COURELEC = "COURELEC",
  TEL = "TEL",
  TELSAT = "TELSAT",
  TEL2 = "TEL2"
}

export enum enumTypeComm {
  PRINC = "PRINC"
}

export enum enumTypeAdr {
  PRINC = "PRINC",
  SECOND = "SECOND",
  TEMP = "TEMP"
}





@Component({
  selector: 'app-consulter-ui-component',
  providers: [ReferencesApiService],
  templateUrl: './consulter-ui-component.component.html',
  styleUrls: ['./consulter-ui-component.component.css']
})
export class ConsulterUiComponent implements OnInit, OnDestroy {

  //Usager
  usager: UsagerDTO = new UsagerDTO();
  usagerDetail: string;
  usagerAnonyme: string;
  usagerNam: string;
  usagerLangue: string;
  usagerNamExpiration: string;
  usagerMalentendant: string;
  usagerNomMere: string;
  usagerNomPere: string;
  usagerDoublon: string;


  usagerId: any;

  classCadenaUsager: any;

  //âge
  ageFormater: string;
  groupeAgeAffiche: string;
  dateNaissance: string;

  //sexe affiché dans html
  sexeAffiche: string;

  //Liste des adresses et communication
  listeAdresseAff: Array<UsagerLieuResidenceDTO> = new Array<UsagerLieuResidenceDTO>();
  listeAdresseAll: Array<UsagerLieuResidenceDTO> = new Array<UsagerLieuResidenceDTO>();

  listeCommunicationAff: Array<UsagerCommDTO> = new Array<UsagerCommDTO>();
  listeCommunicationAll: Array<UsagerCommDTO> = new Array<UsagerCommDTO>();

  //Menu de page
  labelMenuTop: string;

  //Liste des groupes d'âges
  listeGroupeDAge: Array<ReferenceDTO> = new Array<ReferenceDTO>();

  listeSexe: Array<ReferenceDTO> = new Array<ReferenceDTO>();

  // public usagerDTO: UsagerDTO;

  groupeAge: GroupeAgeOptions;

  //Champs à afficher
  nomUsager: string;

  //État listes
  etatAdresseDisplayAll: boolean = false;
  etatCommunicationDisplayAll: boolean = false;

  //Message de cadenas
  msgCadenaUsager: string;

  public cacherAfficherReduireCommunication: boolean = false;

  public cacherAfficherReduireAdresse: boolean = false;

  private subscriptions: Subscription = new Subscription();

  /*@Input("categoriesAppelant")
  public set setCategoriesAppelant(values: ReferenceDTO[]) {
    if (values) {
      values.forEach(item => {
        this.inputOptionCategoriesAppelant.options.push({ label: this.labelSelectionnez, value: null });
        values.forEach((item: ReferenceDTO) => {
          this.inputOptionCategoriesAppelant.options.push({ label: item.nom, value: item.code });
        });
      });
    }
  }*/

  @Input()
  doublonPotentielVisible: boolean = true;

  /** Peuple des groupes d'ages */
  @Input("listeGroupeDAge")
  public set setListeGroupeDAge(values: ReferenceDTO[]) {
    if (values) {
      values.forEach(item => {
        this.listeGroupeDAge.push(item);
      });

      // Si le groupe d'âge a été défini avant que la liste ne soit chargée, on redétermine le groupe d'âge affiché.
      if (this.groupeAge) {
        if (this.groupeAge.groupeId) {
          this.groupeAgeAffiche = this.getDescGroupeAgeById(this.groupeAge.groupeId);
        } else if (this.groupeAge.annees || this.groupeAge.mois || this.groupeAge.jours) {
          this.groupeAgeAffiche = this.getDescGroupeAgeByAMJ(+this.groupeAge.annees, +this.groupeAge.mois, +this.groupeAge.jours);
        }
      }
    }
  }

  @Input("listeSexe")
  public set setListeSexe(values: ReferenceDTO[]) {
    if (values) {
      values.forEach(item => {
        this.listeSexe.push(item);
      });

      // Si le sexe a été défini avant que la liste ne soit chargée, on redétermine le sexe affiché.
      if (this.usager?.sexeCode) {
        this.sexeAffiche = this.getSexeAffiche(this.usager.sexeCode);
      }
    }
  }

  @ViewChild('groupeAge', { static: true })
  groupeAgeChosen: SigctChosenComponent;

  /*private labelSelectionnez: string = 'Sélectionnez...'

  public inputOptionCategoriesAppelant: InputOptionCollection = {
    name: "categoriesAppelant",
    options: []
  }*/

  categoriesAppelant: ReferenceDTO[];

  constructor(private appContextStore: AppContextStore) {
  }

  ngOnInit() {
    this.labelMenuTop = "";
  }

  ngOnDestroy() {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  /**
   * Obtient la description du groupe d'âge correspondant à l'âge formée de année, mois et jours.
   *
   * @param annees
   * @param mois
   * @param jours
   */
  private getDescGroupeAgeByAMJ(annees: number, mois: number, jours: number): string {
    return  AgeUtils.getNomGroupeAge(this.listeGroupeDAge, annees, mois, jours);
  }

  /**
   * Obtient la description du groupe d'âge dont l'id correspondant à idGroupeAge.
   *
   * @param idGroupeAge identifiant du groupe d'âge
   */
  private getDescGroupeAgeById(idGroupeAge: number): string {
    let groupeAge: ReferenceDTO = this.listeGroupeDAge.find((value: ReferenceDTO) => value.id == idGroupeAge);

    return groupeAge ? groupeAge.nom : "";
  }

  /**
   * Obtient la description du sexe de l'usager pour l'afficher.
   * @param sexeCode code du sexe à retrouver
   */
  private getSexeAffiche(sexeCode: string): string {
    let sexe: ReferenceDTO = this.listeSexe.find((value: ReferenceDTO) => value.code == sexeCode);

    return sexe ? sexe.nom : "";
  }

  /**
   * Mise à jour de la liste des données de communications.
   *
   * @param values
   */
  public setListeUsagerCommunication(values: UsagerCommDTO[]) {
    this.listeCommunicationAll = new Array<UsagerCommDTO>();
    this.listeCommunicationAff = new Array<UsagerCommDTO>();

    if (values) {
      values.forEach(item => {
        this.listeCommunicationAll.push(item);
      });

      this.listeCommunicationAff = this.listeCommunicationAll.filter(elem => elem.actif);
    }
    this.cacherAfficherReduireCommunication = this.listeCommunicationAll.length === this.listeCommunicationAff.length;
  }

  /**
   * Mise à jour de la liste des lieux de résidence.
   *
   * @param values
   */
  public setListeUsagerLieuResidence(values: UsagerLieuResidenceDTO[]) {
    this.listeAdresseAll = new Array<UsagerLieuResidenceDTO>();
    this.listeAdresseAff = new Array<UsagerLieuResidenceDTO>();

    if (values) {
      values.forEach(item => {
        this.listeAdresseAll.push(item);
      });

      this.listeAdresseAff = this.listeAdresseAll.filter(elem => elem.actif);
    }

    this.cacherAfficherReduireAdresse = this.listeAdresseAll.length === this.listeAdresseAff.length;
  }

  /**
   * Vide les champs avant d'extraire de nouvelles valeur de la BD.
   */
  private viderChamps() {
    this.nomUsager = null;
    this.dateNaissance = null;
    this.usagerDetail = null;
    this.usagerAnonyme = null;
    this.usagerNam = null;
    this.usagerNamExpiration = null;
    this.usagerLangue = null;
    this.usagerMalentendant = null;
    this.usagerDoublon = null;
    this.usagerNomMere = null;
    this.usagerNomPere = null;
    this.ageFormater = null;
    this.sexeAffiche = null;
    this.groupeAgeAffiche = null;
  }

  public setUsager(usagerDTO: UsagerDTO) {
    this.usager = usagerDTO;
    this.usagerId = usagerDTO.id;

    this.chargementDonnee();

    this.appContextStore.setvalue('statusEnregistrementsUsager', this.usager.statusEnregistrement);
  }

  public setGroupeAge(groupeAge: GroupeAgeOptions) {
    this.groupeAge = groupeAge;

    this.ageFormater = "";
    this.groupeAgeAffiche = "";

    if (this.groupeAge) {
      if (this.groupeAge.dateNaissance || this.groupeAge.annees || this.groupeAge.mois || this.groupeAge.jours) {
        const annees: number = (this.groupeAge.annees ? +this.groupeAge.annees : 0);
        const mois: number = (this.groupeAge.mois ? +this.groupeAge.mois : 0);
        const jours: number = (this.groupeAge.jours ? +this.groupeAge.jours : 0);

        this.ageFormater = AgeUtils.formaterAgeFormatLong(annees, mois, jours);

        // Si l'id du groupe d'âge n'est pas fourni, on le calcule avec AMJ.
        if (!this.groupeAge.groupeId) {
          this.groupeAgeAffiche = this.getDescGroupeAgeByAMJ(annees, mois, jours);
        }
      }

      // Si l'id du groupe d'âge est fourni, on récupère sa description.
      if (this.groupeAge.groupeId) {
        this.groupeAgeAffiche = this.getDescGroupeAgeById(this.groupeAge.groupeId);
      }
    }
  }

  /**
   * Chargement des données selon le numéro de l'usager.
   */
  chargementDonnee() {

    this.viderChamps();

    this.listeAdresseAff = new Array<UsagerLieuResidenceDTO>();
    this.listeCommunicationAff = new Array<UsagerCommDTO>();

    if (this.usager.nom !== null || this.usager.prenom !== null) {
      if (this.usager.prenom && this.usager.nom) {
        this.nomUsager = this.usager.nom + " " + this.usager.prenom;
      }

      if (this.usager.nom && (this.usager.prenom === null)) {
        this.nomUsager = this.usager.nom;
      }

      if (this.usager.prenom && (this.usager.nom === null)) {
        this.nomUsager = this.usager.prenom;
      }
    }

    if (this.usager.dtNaiss) {
      this.dateNaissance = this.usager.dtNaiss.toLocaleString();
    }

    this.setGroupeAge(this.usager.groupeAgeOptions);

    if (this.usager.detail) {
      this.usagerDetail = "(" + this.usager.detail + ")";
    }

    this.usagerAnonyme = "";

    if (this.usager.nam) {
      this.usagerNam = this.usager.nam.substr(0, 4) + "-" + this.usager.nam.substr(4, 4) + "-" + this.usager.nam.substr(8, 4);
    }

    if (this.usager.anneeExpr && this.usager.moisExpr) {
      var mois = (this.usager.moisExpr < 10) ? "0" + this.usager.moisExpr : this.usager.moisExpr;
      this.usagerNamExpiration = this.usager.anneeExpr + "-" + mois;
    } else {
      if (this.usager.anneeExpr && this.usager.moisExpr === null) {
        this.usagerNamExpiration = this.usager.anneeExpr;
      }
      if (this.usager.anneeExpr == null && this.usager.moisExpr) {
        var mois = (this.usager.moisExpr < 10) ? "0" + this.usager.moisExpr : this.usager.moisExpr;
        this.usagerNamExpiration = mois
      }
    }

    this.usagerLangue = this.usager.langueNom;
    this.usagerMalentendant = (this.usager.malentendant) ? "Oui" : "Non";
    this.usagerDoublon = (this.usager.doublonPotentiel) ? "Oui" : "Non";


    if (this.usager.nomMere) {
      this.usagerNomMere = this.usager.nomMere;
    }

    if (this.usager.nomMere) {
      if (this.usager.prenomMere) {
        this.usagerNomMere = this.usagerNomMere + " " + this.usager.prenomMere;
      }
    }

    if (this.usager.nomMere === null && this.usager.prenomMere) {
      this.usagerNomMere = this.usager.prenomMere;
    }

    if (this.usager.nomPere) {
      this.usagerNomPere = this.usager.nomPere;
    }

    if (this.usager.nomPere) {
      if (this.usager.prenomPere) {
        this.usagerNomPere = this.usagerNomPere + " " + this.usager.prenomPere;
      }
    }

    if (this.usager.nomPere === null && this.usager.prenomPere) {
      this.usagerNomPere = this.usager.prenomPere;
    }

    this.sexeAffiche = this.getSexeAffiche(this.usager.sexeCode);

    this.getCadenasUsager();
  }

  /**
   * Afficher ou reduire la liste de moyens d'adresses' sauvegardes (actifs ou tous)
   * @param element
   */
  afficherOuReduireListeLieuResidence(element: any) {
    let displayAll = element.displayAll;
    if (!displayAll) {
      this.listeAdresseAff = this.listeAdresseAll.filter(elem => elem.actif);
    } else {
      this.listeAdresseAff = this.listeAdresseAll;
    }
    this.etatAdresseDisplayAll = displayAll;
  }

  /**
   * Format d'un lieu de résidence affiché dans la liste des adresses.
   * @param usagerLieuResidence lieu de résidence à formater
   */
  formatActionUsagerLieuResidence(usagerLieuResidence: UsagerLieuResidenceDTO) {
    let formattedAddress: string = "";

    if (usagerLieuResidence) {
      let codePostal = "";
      if (usagerLieuResidence.codePostal && usagerLieuResidence.codePostal != null) {
        codePostal = usagerLieuResidence.codePostal.substring(0, 3) + " " + usagerLieuResidence.codePostal.substring(3, 6);
      }

      let adresseLigneUn = [usagerLieuResidence.adresse, usagerLieuResidence.nomCategSubdvImmeu, usagerLieuResidence.subdvImmeu, usagerLieuResidence.municNom, codePostal];
      let adresseLigneDeux = [usagerLieuResidence.codeRegion, ' - ', usagerLieuResidence.nomRegion, usagerLieuResidence.nomProvince, usagerLieuResidence.nomPays];
      let adresseLigneTrois = [usagerLieuResidence.rtsNom, usagerLieuResidence.rlsNom, usagerLieuResidence.clscNom];

      var couleur: string;

      if (usagerLieuResidence.actif) {
        couleur = 'black';
      } else {
        couleur = 'grey';
      }

      switch (usagerLieuResidence.codeTypeAdresse) {
        case enumTypeAdr.PRINC: {
          formattedAddress = '<div><table cellspacing="0" style="word-break: break-word;"><tr><td style=" vertical-align:top;" ><div style="float: left; padding-right:29px; font-weight:bold;color:' + couleur + '; white-space:nowrap;">Principale&nbsp;: </div></td><td>';// +

          if (usagerLieuResidence.adresse || usagerLieuResidence.municNom || usagerLieuResidence.nomCategSubdvImmeu || usagerLieuResidence.subdvImmeu || codePostal) {

            formattedAddress = formattedAddress +

              '<div style="width:100%; word-wrap: break-word; margin-bottom:7px;">' +
              adresseLigneUn.filter(Boolean).join(" ") +
              '</div> </div>';
          }

          if (usagerLieuResidence.codeRegion || usagerLieuResidence.nomRegion || usagerLieuResidence.nomProvince || usagerLieuResidence.nomPays) {

            formattedAddress = formattedAddress +

              '<div>' +
              '<div style=" width:100%; word-wrap: break-word; margin-bottom:7px;">' +
              adresseLigneDeux.filter(Boolean).join(" ") +
              '</div> </div>';

          }

          if (usagerLieuResidence.clscNom || usagerLieuResidence.rlsNom || usagerLieuResidence.rtsNom) {
            formattedAddress = formattedAddress +
              '<div>' +
              '<div style=" width:100%; word-wrap: break-word; margin-bottom:7px;">' +
              adresseLigneTrois.filter(Boolean).join(", ") +
              '</div> </div>';
          }


          if (usagerLieuResidence.detail) {
            formattedAddress = formattedAddress + '<div style="with:650px;word-wrap: break-word;">(<i>' + usagerLieuResidence.detail + '</i>)</div>'
          }

          + '</td></tr></table></div>';
          break;
        }
        case enumTypeAdr.SECOND: {
          formattedAddress = '<div><table cellspacing="0"><tr><td style=" vertical-align:top;" ><div style="float: left; padding-right:20px;font-weight:bold;color:' + couleur + ';">Secondaire&nbsp;: </div></td><td>';


          if (usagerLieuResidence.adresse || usagerLieuResidence.municNom || usagerLieuResidence.nomCategSubdvImmeu || usagerLieuResidence.subdvImmeu || codePostal) {

            formattedAddress = formattedAddress +

              '<div style="width:100%; word-wrap: break-word; margin-bottom:7px;">' +
              adresseLigneUn.filter(Boolean).join(" ") +
              '</div> </div>';
          }

          if (usagerLieuResidence.codeRegion || usagerLieuResidence.nomRegion || usagerLieuResidence.nomProvince || usagerLieuResidence.nomPays) {

            formattedAddress = formattedAddress +

              '<div>' +
              '<div style=" width:100%; word-wrap: break-word; margin-bottom:7px;">' +
              adresseLigneDeux.filter(Boolean).join(" ") +
              '</div> </div>';

          }

          if (usagerLieuResidence.clscNom || usagerLieuResidence.rlsNom || usagerLieuResidence.rtsNom) {
            formattedAddress = formattedAddress +
              '<div>' +
              '<div style=" width:100%; word-wrap: break-word; margin-bottom:7px;">' +
              adresseLigneTrois.filter(Boolean).join(", ") +
              '</div> </div>';
          }

          if (usagerLieuResidence.detail) {
            formattedAddress = formattedAddress + '<div style="with:650px;word-wrap: break-word;">(<i>' + usagerLieuResidence.detail + '</i>)</div>'
          }
          + '</td></tr></table></div>';
          break;
        }
        case enumTypeAdr.TEMP: {
          formattedAddress = '<div><table cellspacing="0"><tr><td style=" vertical-align:top;" ><div style="float: left; padding-right:20px;font-weight:bold;color:' + couleur + ';">Temporaire&nbsp;: </div></td><td>';

          if (usagerLieuResidence.adresse || usagerLieuResidence.municNom || usagerLieuResidence.nomCategSubdvImmeu || usagerLieuResidence.subdvImmeu || codePostal) {

            formattedAddress = formattedAddress +

              '<div style="width:100%; word-wrap: break-word; margin-bottom:7px;">' +
              adresseLigneUn.filter(Boolean).join(" ") +
              '</div> </div>';
          }

          if (usagerLieuResidence.codeRegion || usagerLieuResidence.nomRegion || usagerLieuResidence.nomProvince || usagerLieuResidence.nomPays) {

            formattedAddress = formattedAddress +

              '<div>' +
              '<div style=" width:100%; word-wrap: break-word; margin-bottom:7px;">' +
              adresseLigneDeux.filter(Boolean).join(" ") +
              '</div> </div>';
          }

          if (usagerLieuResidence.clscNom || usagerLieuResidence.rlsNom || usagerLieuResidence.rtsNom) {
            formattedAddress = formattedAddress +
              '<div>' +
              '<div style=" width:100%; word-wrap: break-word; margin-bottom:7px;">' +
              adresseLigneTrois.filter(Boolean).join(", ") +
              '</div> </div>';
          }

          if (usagerLieuResidence.detail) {
            formattedAddress = formattedAddress + '<div style="with:650px;word-wrap: break-word;">(<i>' + usagerLieuResidence.detail + '</i>)</div>'
          }
          + '</td></tr></table></div>';
          break;
        }
      }
    }
    return formattedAddress;
  }

  /**
   * Format d'un moyen de communication affiché dans la liste de droite.
   * @param usagerCommunication moyen de communication à formater
   */
  formatActionUsagerCommunication(usagerCommunication: UsagerCommDTO) {
    let usCommFormate: string;
    if (usagerCommunication.actif) {
      usCommFormate = "<span style='color:black;font-weight:bold;'>" + usagerCommunication.nomTypeEquipComm + " " + usagerCommunication.nomTypeCoordComm.toLowerCase() + "</span> : ";
    } else {
      usCommFormate = "<span style='color:grey;font-weight:bold;'>" + usagerCommunication.nomTypeEquipComm + " " + usagerCommunication.nomTypeCoordComm.toLowerCase() + "</span> : ";
    }


    let coordFormate = "";
    if (usagerCommunication.coordonnees != null) {
      if (usagerCommunication.codeTypeEquipComm == enumMoyenComm.COURELEC) {
        coordFormate = usagerCommunication.coordonnees;
      } else if (usagerCommunication.codeTypeEquipComm == enumMoyenComm.TEL || usagerCommunication.codeTypeEquipComm == enumMoyenComm.TEL2) {
        if (usagerCommunication.coordonnees.includes('#')) {
          let tabCoordonnes = usagerCommunication.coordonnees.split('#');
          coordFormate = tabCoordonnes[0].substr(0, 3) + " " + tabCoordonnes[0].substr(3, 3) + "-" + tabCoordonnes[0].substr(6, 4);
          if (tabCoordonnes[1]) {
            coordFormate = coordFormate + " Poste " + tabCoordonnes[1];
          }
        } else {
          coordFormate = usagerCommunication.coordonnees.substr(0, 3) + " " + usagerCommunication.coordonnees.substr(3, 3) + "-" + usagerCommunication.coordonnees.substr(6, 4);
        }
      } else if (usagerCommunication.codeTypeEquipComm == enumMoyenComm.TELSAT) {
        if (usagerCommunication.coordonnees.length == 15) {
          coordFormate = usagerCommunication.coordonnees.substr(0, 3) + "-" + usagerCommunication.coordonnees.substr(3, 4) + "-" + usagerCommunication.coordonnees.substr(7, 3) + "-" + usagerCommunication.coordonnees.substr(10, 5);
        } else {
          coordFormate = usagerCommunication.coordonnees.substr(0, 4) + "-" + usagerCommunication.coordonnees.substr(4, 3) + "-" + usagerCommunication.coordonnees.substr(7, 5);
        }
      } else {
        coordFormate = usagerCommunication.coordonnees.substr(0, 3) + " " + usagerCommunication.coordonnees.substr(3, 3) + "-" + usagerCommunication.coordonnees.substr(6, 4);
      }
    }

    usCommFormate += coordFormate;
    if (usagerCommunication.detail != null) {
      usCommFormate += " (<i>" + usagerCommunication.detail + "</i>)";
    }

    return usCommFormate;
  }

  /**
   * Afficher ou reduire la liste de moyens de communications sauvegardes (actifs ou tous)
   * @param element
   */
  afficherOuReduireListeCommunications(element: any) {
    let displayAll = element.displayAll;

    if (!displayAll) {
      this.listeCommunicationAff = this.listeCommunicationAll.filter(elem => elem.actif);
    } else {
      this.listeCommunicationAff = this.listeCommunicationAll;
    }

    this.etatCommunicationDisplayAll = displayAll;
  }

  /**
   * Affiche le message du cadenas et applique sa couleur.
   */
  getCadenasUsager() {

    if (this.usager.niveauIdent === NiveauIdentificationUsager.ANONYME) {

      this.classCadenaUsager = couleurCadenas.ROUGE;
      this.msgCadenaUsager = "usager.cadenas.rouge.anonyme";

    }

    if (this.usager.niveauIdent === NiveauIdentificationUsager.TOTAL) {

      this.classCadenaUsager = couleurCadenas.VERT;
      this.msgCadenaUsager = "usager.cadenas.vert.total";

    }

    if (this.usager.niveauIdent === NiveauIdentificationUsager.PARTIEL) {

      this.classCadenaUsager = couleurCadenas.JAUNE;
      this.msgCadenaUsager = "usager.cadenas.jaune.partiel";

    }
  }
}
