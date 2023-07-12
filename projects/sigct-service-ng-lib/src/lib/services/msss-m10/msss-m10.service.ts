import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { Observable, of, Subscription } from "rxjs";
import { map } from 'rxjs/operators';
import { MsssM10AdresseFeature } from '../../models/msss-m10-adresse-feature';
import { MsssM10AdresseResponse } from '../../models/msss-m10-adresse-response';
import { MsssM10CodePostal } from '../../models/msss-m10-code-postal';
import { MsssM10CodePostalResponse } from '../../models/msss-m10-code-postal-response';
import { MsssM10Adresse, MsssM10Municipalite, MsssM10Pays, MsssM10Province, MsssM10Territoire, MsssM10TerritoireCodePostal, MsssM10TerritoireFeature, MsssM10TerritoireResponse, TypeTerritoireEnum } from '../../models/msss-m10-models';
import { AppelAdmParameterService } from '../appel-adm-parameter/appel-adm-parameter.service';

enum Type {
  RTS = "rts",
  ANCIENNE_MUNICIPALITE = "ancienne_municipalite",
  MUNICIPALITE = "municipalite",
  REGION_ADMIN = "regadmin"
}

enum TargetEnum {
  ADRESSE = "ObtenirGeocode",
  CODE_POSTAL = "ObtenirAutocompletionCodePostal",
  MUNICIPALITE = "ObtenirGeocode",
  TERRITOIRES = "ObtenirTerritoires"
}

@Injectable({
  providedIn: 'root'
})
export class MsssM10Service {
  private m10CryptKey: string;
  private m10CryptIv: string;

  private m10User: string;
  private m10MotDePasse: string;

  private m10BaseUrl: string;

  private subscription: Subscription = new Subscription();

  constructor(private http: HttpClient,
    private appelAdmParameterService: AppelAdmParameterService,
   ) {

    this.subscription.add(this.appelAdmParameterService.obtenirAdmParametersM10(window["env"].urlPortail).subscribe((objJson: any) => {
      this.m10BaseUrl = objJson.M10_URL;
      this.m10User = objJson.M10_ID;
      this.m10CryptKey = this.debrouillerCryptKey(objJson.M10_CRYPTKEY);
      this.m10CryptIv = this.debrouillerCryptIv(objJson.M10_CRYPTIV);
      this.m10MotDePasse = this.debrouillerMotPasse(objJson.M10_PASSWORD);
    }));

  }

  /**
   * Débrouille le code "obfuscated" de CryptKey.
   * @param m10CryptKey 
   */
  private debrouillerCryptKey(m10CryptKey: string): string {
    let cryptKey = "";
    if (m10CryptKey) {
      var sigct = sigct || {};
      sigct.toxiQc = sigct.toxiQc || {};
      sigct.toxiQc.m10CryptKey = sigct.toxiQc.m10CryptKey || {};
      eval(m10CryptKey);
      cryptKey = sigct.toxiQc.m10CryptKey;
    }
    return cryptKey;
  }

  /**
   * Débrouille le code "obfuscated" de CryptIv.
   * @param m10CryptIv 
   */
  private debrouillerCryptIv(m10CryptIv: string): string {
    let cryptIv = "";
    if (m10CryptIv) {
      var sigct = sigct || {};
      sigct.toxiQc = sigct.toxiQc || {};
      sigct.toxiQc.m10CryptIv = sigct.toxiQc.m10CryptIv || {};
      eval(m10CryptIv);
      cryptIv = sigct.toxiQc.m10CryptIv;
    }
    return cryptIv;
  }

  /**
   * Débrouille le code "obfuscated" du mot de passe.
   * @param m10Password 
   */
  private debrouillerMotPasse(m10Password: string): string {
    let motPasse = "";
    if (m10Password) {
      var sigct = sigct || {};
      sigct.toxiQc = sigct.toxiQc || {};
      sigct.toxiQc.m10Password = sigct.toxiQc.m10Password || {};
      eval(m10Password);
      motPasse = sigct.toxiQc.m10Password;
    }
    return motPasse;
  }

  /**
   * Crypte une chaine de caractères avec les identifications de M10.
   * @param params 
   */
  private crypterParamsM10(params: string): string {
    let key = CryptoJS.enc.Utf8.parse(this.m10CryptKey);
    let iv = CryptoJS.enc.Hex.parse(this.m10CryptIv);

    let encryptedParams = CryptoJS.DES.encrypt(CryptoJS.enc.Utf8.parse(params), key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return encryptedParams;
  }

  /**
   * Retourne l'url de base du service M10.
   * @returns 
   */
  public getM10BaseUrl(): string {
    return this.m10BaseUrl;
  }

  /**
   * Recherche les adresses contenant le paramètre "adresse".
   * @param adresse liste de mots à rechercher séparés par un espace
   * @param inclureAnciennes indique si la recherche inclus les anciennes adresses
   * @returns une liste de MsssM10Adresse contenant les adresses correspondantes
   */
  public rechercherAdresses(adresse: string, inclureAnciennes: boolean): Observable<MsssM10Adresse[]> {
    if (!adresse || adresse.trim().length == 0) {
      return of([]);
    }

    let typesAdresses = "adresse";
    if (inclureAnciennes) {
      typesAdresses += ",ancienne_adresse";
    }
    const params = `codeAbonne=${this.m10User}&motDePasse=${this.m10MotDePasse}&entree=${encodeURI(adresse.trim())}&nbItem=15&geometrie=&ecmax=85&type=${typesAdresses}&filtre=*`;

    const url = this.m10BaseUrl + TargetEnum.ADRESSE + "?enc=" + this.crypterParamsM10(params);

    return this.http.get<MsssM10AdresseResponse>(url).pipe(
      map((response: MsssM10AdresseResponse) => {
        let msssM10Adresses: MsssM10Adresse[] = [];
        if (response && response.code_retour == 1 && response.features && response.features.length > 0) {
          response.features.forEach((adresseFeature: MsssM10AdresseFeature) => {
            let msssM10Adresse: MsssM10Adresse = new MsssM10Adresse();
            msssM10Adresse.highlight = adresseFeature.highlight;
            msssM10Adresse.adrId = adresseFeature.properties.id
            msssM10Adresse.adrComplete = adresseFeature.properties.recherche;

            if (adresseFeature.doc_type == TypeTerritoireEnum.ANCIENNE_ADRESSE) {
              msssM10Adresse.typeAdresse = TypeTerritoireEnum.ANCIENNE_ADRESSE;
              msssM10Adresse.adrRue = adresseFeature.properties.adresse_reference;
              msssM10Adresse.highlight += " -> [" + adresseFeature.properties.adresse_reference + "]";
              msssM10Adresse.adrComplete += " -> [" + adresseFeature.properties.adresse_reference + "]";
            } else {
              msssM10Adresse.typeAdresse = TypeTerritoireEnum.ADRESSE;
              msssM10Adresse.adrNoCivique = adresseFeature.properties.numero_civique;
              msssM10Adresse.adrNoCiviqueSuffixe = adresseFeature.properties.numero_civique_suffixe;
              msssM10Adresse.adrRue = adresseFeature.properties.rue;
              msssM10Adresse.codePostal = adresseFeature.properties.code_postal;
              msssM10Adresse.municipaliteCode = adresseFeature.properties.municipaliteCode;
              msssM10Adresse.municipaliteNom = adresseFeature.properties.municipalite;
            }

            if (adresseFeature.properties.pays) {
              msssM10Adresse.paysCode = adresseFeature.properties.pays.code;
              msssM10Adresse.paysNom = adresseFeature.properties.pays.nom;
            }
            if (adresseFeature.properties.province) {
              msssM10Adresse.provinceCode = adresseFeature.properties.province.code;
              msssM10Adresse.provinceNom = adresseFeature.properties.province.nom;
            }

            msssM10Adresses.push(msssM10Adresse);
          });
        }
        return msssM10Adresses;
      }),
    );
  }

  /**
   * Recherche les codes postaux contenant "codePostal".
   * @param codePostal fragment du code postal à rechercher
   * @returns une liste de MsssM10CodePostal contenant les codes postaux correspondants
   */
  public rechercherCodesPostaux(codePostal: string): Observable<MsssM10CodePostal[]> {
    if (!codePostal || codePostal.trim().length == 0) {
      return of([]);
    }

    // Il aurait été plus optimal de rechercher d'un seul coup tous les territoires de chaque code postal.
    // Par contre, il y a un problème avec M10 dans cette situation. 
    // L'utilisation du paramètre typeTerritoire=mun,rss,rls,rts,clsc lors de la recherche d'un code postal 
    // possédant plus d'une municipalité, retourne les territoires de ses municipalités à l'intérieur
    // d'un même code postale rendant impossible la distinction entre ceux-ci.
    // Ex: La recherche de "G0M1H1" pour typeTerritoire=mun,rss retourne ce JSON
    // "G0M1H1": [
    //   {
    //     "Code": "12",
    //     "doc_type": "RSS",
    //     "Nom": "Chaudière-Appalaches",
    //     "Recherche": "G0M1H1"
    //   },
    //   {
    //     "Code": "05",
    //     "doc_type": "RSS",
    //     "Nom": "Estrie",
    //     "Recherche": "G0M1H1"
    //   },
    //   {
    //     "Code": "30095",
    //     "doc_type": "MUN",
    //     "Nom": "Lambton",
    //     "Recherche": "G0M1H1"
    //   },
    //   {
    //     "Code": "31050",
    //     "doc_type": "MUN",
    //     "Nom": "Sainte-Praxède",
    //     "Recherche": "G0M1H1"
    //   }
    // ]
    // Pour palier à ce problème, on récupère que les territoires de type "mun" et un appel est fait à M10 
    // pour récupérer les territoires de la municipalité liée au code postal lors de la sélection.
    const params = `codeAbonne=${this.m10User}&motDePasse=${this.m10MotDePasse}&entree=${encodeURI(codePostal.trim())}&dateCodePostal=&typeTerritoire=mun&filtreTerritoire=&codeTerritoire=&typeCodeTerr=tss&nbItems=15`;

    const url = this.m10BaseUrl + TargetEnum.CODE_POSTAL + "?enc=" + this.crypterParamsM10(params);

    return this.http.get<MsssM10CodePostalResponse>(url).pipe(
      map((response: MsssM10CodePostalResponse) => {
        let listeCodePostaux: MsssM10CodePostal[] = [];
        if (response && response.ListeCodesPostaux) {
          Object.keys(response.ListeCodesPostaux).forEach(key => {
            response.ListeCodesPostaux[key].forEach((m10Territoire: MsssM10TerritoireCodePostal) => {
              let m10CodePostal: MsssM10CodePostal = new MsssM10CodePostal();
              m10CodePostal.codePostal = m10Territoire.Recherche;
              m10CodePostal.codeMunicipalite = m10Territoire.Code;
              m10CodePostal.nomMunicipalite = m10Territoire.Nom;
              m10CodePostal.territoires = [];

              listeCodePostaux.push(m10CodePostal);
            });
          });
        }
        return listeCodePostaux;
      }));
  }

  /**
   * Recherche les municipalités correspondant à "nomMunicipalite".
   * @param nomMunicipalite nom de la municipalité à rechercher
   * @returns une liste de MsssM10Municipalite contenant les municipalités correspondantes
   */
  public rechercherMunicipalites(nomMunicipalite: string): Observable<MsssM10Municipalite[]> {
    if (!nomMunicipalite || nomMunicipalite.trim().length == 0) {
      return of([]);
    }

    const params = `codeAbonne=${this.m10User}&motDePasse=${this.m10MotDePasse}&entree=${encodeURI(nomMunicipalite.trim())}&nbItem=15&geometrie=&ecmax=100&type=ancienne_municipalite,municipalite&filtre=*`;

    const url = this.m10BaseUrl + TargetEnum.MUNICIPALITE + "?enc=" + this.crypterParamsM10(params);

    return this.http.get<MsssM10AdresseResponse>(url).pipe(
      map((result: MsssM10AdresseResponse) => {
        let msssM10Municipalites: MsssM10Municipalite[] = [];

        if (result.features && result.features.length > 0) {
          result.features.forEach((feature: MsssM10AdresseFeature) => {
            let msssM10Municipalite: MsssM10Municipalite = new MsssM10Municipalite();
            msssM10Municipalite.highlight = feature.highlight;

            msssM10Municipalite.code = feature.properties.id;
            if (feature.doc_type == TypeTerritoireEnum.ANCIENNE_MUNICIPALITE) {
              // Ancienne municipalité
              msssM10Municipalite.typeMunicipalite = TypeTerritoireEnum.ANCIENNE_MUNICIPALITE;
              msssM10Municipalite.nom = feature.properties.mun_reference;
              msssM10Municipalite.ancienNom = feature.properties.nom_mun;
              msssM10Municipalite.highlight = (feature.properties.recherche + " -> [" + feature.properties.mun_reference + "]");
            } else {
              msssM10Municipalite.typeMunicipalite = TypeTerritoireEnum.MUNICIPALITE;
              msssM10Municipalite.nom = feature.properties.municipalite;
              msssM10Municipalite.highlight = feature.properties.recherche;
            }

            if (feature.properties.pays) {
              msssM10Municipalite.pays = new MsssM10Pays();
              msssM10Municipalite.pays.code = feature.properties.pays.code;
              msssM10Municipalite.pays.nom = feature.properties.pays.nom;
            }
            if (feature.properties.province) {
              msssM10Municipalite.province = new MsssM10Province();
              msssM10Municipalite.province.code = feature.properties.province.code;
              msssM10Municipalite.province.nom = feature.properties.province.nom;
            }

            msssM10Municipalites.push(msssM10Municipalite);
          });
        }
        return msssM10Municipalites;
      })
    );
  }

  /**
   * Récupère dans une liste la municipalité, la région socio-sanitaire (RSS), le réseau territorial des services (RTS), 
   * le réseau local de service (RLS) et le territoire de CLSC d'un code de municipalité.
   * @param codeMunicipalite code de la municipalité à traiter
   */
  public obtenirTerritoiresByCodeMunicipalite(codeMunicipalite: string): Observable<MsssM10Territoire[]> {
    if (!codeMunicipalite) {
      return of(null);
    }

    // S'assure que le code municipalité possède 5 caractères.
    codeMunicipalite = codeMunicipalite.padStart(5, "0");

    const params = `codeAbonne=${this.m10User}&motDePasse=${this.m10MotDePasse}&entree=${codeMunicipalite}&source=municipalite&type=municipalite,rss,rts,rls,clsc&filtre=&geometries=`;

    const url = this.m10BaseUrl + TargetEnum.TERRITOIRES + "?enc=" + this.crypterParamsM10(params);

    return this.http.get<MsssM10TerritoireResponse>(url).pipe(map((response: MsssM10TerritoireResponse) => {
      let m10Territoires: MsssM10Territoire[] = [];

      if (response.code_retour == 1) {
        if (response.features && response.features.length > 0) {
          response.features.forEach((feature: MsssM10TerritoireFeature) => {
            const m10Territoire: MsssM10Territoire = new MsssM10Territoire(feature.properties.doc_type, feature.properties.code, feature.properties.nom);

            m10Territoires.push(m10Territoire);
          });
        }
      } else {
        console.error("obtenirTerritoiresByCodeMunicipalite(" + codeMunicipalite + ") retourne l'erreur '" + response.message_retour + "'");
      }

      return m10Territoires;
    }));
  }

  /**
   * Récupère dans une liste la municipalité, la région socio-sanitaire (RSS), le réseau territorial des services (RTS), 
   * le réseau local de service (RLS) et le territoire de CLSC d'un code postal.
   * @param codePostal code postal à traiter
   */
  public obtenirTerritoiresByCodePostal(codePostal: string): Observable<MsssM10Territoire[]> {
    if (!codePostal) {
      return of(null);
    } else {
      codePostal = codePostal.replace(" ", "");
      if (codePostal.length != 6) {
        return of(null);
      }
    }

    const params = `codeAbonne=${this.m10User}&motDePasse=${this.m10MotDePasse}&entree=${codePostal}&source=code_postal&type=municipalite,rss,rts,rls,clsc&filtre=&geometries=`;

    const url = this.m10BaseUrl + TargetEnum.TERRITOIRES + "?enc=" + this.crypterParamsM10(params);

    return this.http.get<MsssM10TerritoireResponse>(url).pipe(map((response: MsssM10TerritoireResponse) => {
      let m10Territoires: MsssM10Territoire[] = [];

      if (response.code_retour == 1) {
        if (response.features && response.features.length > 0) {
          response.features.forEach((feature: MsssM10TerritoireFeature) => {
            const m10Territoire: MsssM10Territoire = new MsssM10Territoire(feature.properties.doc_type, feature.properties.code, feature.properties.nom);

            m10Territoires.push(m10Territoire);
          });
        }
      } else {
        console.error("obtenirTerritoiresByCodePostal(" + codePostal + ") retourne l'erreur '" + response.message_retour + "'");
      }

      return m10Territoires;
    }));
  }

  /**
   * Récupère dans une liste la municipalité, la région socio-sanitaire (RSS), le réseau territorial des services (RTS), le réseau local de service (RLS) et le territoire de CLSC d'une adresse.
   * @param idAdresse identifiant d'une adresse
   */
  public obtenirTerritoiresByIdAdresse(idAdresse: string): Observable<MsssM10Territoire[]> {
    if (!idAdresse) {
      return of(null);
    }

    const params = `codeAbonne=${this.m10User}&motDePasse=${this.m10MotDePasse}&entree=${idAdresse}&source=adresse&type=municipalite,rts,rls,rss,clsc&filtre=&geometries=`;

    const url = this.m10BaseUrl + TargetEnum.TERRITOIRES + "?enc=" + this.crypterParamsM10(params);

    return this.http.get<MsssM10TerritoireResponse>(url).pipe(map((response: MsssM10TerritoireResponse) => {
      let m10Territoires: MsssM10Territoire[] = [];

      if (response.code_retour == 1) {
        if (response.features && response.features.length > 0) {
          response.features.forEach((feature: MsssM10TerritoireFeature) => {
            const m10Territoire: MsssM10Territoire = new MsssM10Territoire(feature.properties.doc_type, feature.properties.code, feature.properties.nom);

            m10Territoires.push(m10Territoire);
          });
        }
      } else {
        console.error("obtenirTerritoiresByIdAdresse(" + idAdresse + ") retourne l'erreur '" + response.message_retour + "'");
      }

      return m10Territoires;
    }));
  }

}
