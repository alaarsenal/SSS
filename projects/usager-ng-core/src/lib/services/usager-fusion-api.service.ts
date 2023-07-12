import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ExportationExcelDTO } from '../models/exportation-excel-dto';
import { RechercheFusionUsagerCritereDTO } from '../models/recherche-fusion-usager-critere-dto';
import { RechercheFusionUsagerResultatDTO } from '../models/recherche-fusion-usager-resultat-dto';
import { UsagerDTO } from '../models/usager-dto';
import { UsagerFusionDTO } from '../models/usager-fusion-dto';

/** /fusion/ */
const CTX_USAGER_IDENT_FUSION: string = "/usagers-ident/fusion/";
/** /usagers/ */
const CTX_USAGERS: string = "/usagers/";
/** fusionner */
const CTX_FUSIONNER: string = "fusionner";
/** /usagers-fusion/ */
const CTX_USAGERS_FUSION: string = "/usagers-fusion/";
/** /fiches-appel */
const CTX_FICHES_APPEL: string = "/fiches-appel";
/** /nombre-fiches-ouvertes */
const CTX_NB_FICHES_OUVERTES = "/nombre-fiches-ouvertes"

const HTTP_OPTIONS = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token'
  })
};

@Injectable({
  providedIn: "root"
})
export class UsagerFusionApiService {
  private urlInfoSanteApi: string;
  private urlInfoSocialApi: string;
  private urlUsagerApi: string;

  constructor(private http: HttpClient) {
    this.urlInfoSanteApi = window["env"].urlSanteApi;
    this.urlInfoSocialApi = window["env"].urlInfoSocial + "/api";
    this.urlUsagerApi = window["env"].urlUsagerApi;
  }

  /**
   * Sauvegarde un usager resultant d'une fusion entre deux usagers.
   * @param usagerFusionDto 
   * @returns 
   */
  sauvegarderUsagerFusion(usagerFusionDto: UsagerFusionDTO): Observable<UsagerDTO> {
    return this.http.post<UsagerDTO>(this.urlUsagerApi + CTX_USAGER_IDENT_FUSION, usagerFusionDto, HTTP_OPTIONS);
  }

  /**
   * Remplace idUsagerIdentSrc1 et idUsagerIdentSrc2 par idUsagerIdentFusion dans la table SA_USAGER.
   * @param idUsagerIdentSrc1 
   * @param idUsagerIdentSrc2 
   * @param idUsagerIdentFusion 
   * @returns 
   */
  updateUsagersFusionSante(idUsagerIdentSrc1: number, idUsagerIdentSrc2: number, idUsagerIdentFusion: number): Observable<void> {
    const usagerFusion = {
      idUsagerIdentSrc1: idUsagerIdentSrc1,
      idUsagerIdentSrc2: idUsagerIdentSrc2,
      idUsagerIdentResultat: idUsagerIdentFusion
    };

    const url: string = this.urlInfoSanteApi + CTX_USAGERS + CTX_FUSIONNER;
    return this.http.put<void>(url, usagerFusion);
  }

  /**
   * Remplace idUsagerIdentSrc1 et idUsagerIdentSrc2 par idUsagerIdentFusion dans la table SO_USAGER.
   * @param idUsagerIdentSrc1 
   * @param idUsagerIdentSrc2 
   * @param idUsagerIdentFusion 
   * @returns 
   */
  updateUsagersFusionSocial(idUsagerIdentSrc1: number, idUsagerIdentSrc2: number, idUsagerIdentFusion: number): Observable<void> {
    const usagerFusion = {
      idUsagerIdentSrc1: idUsagerIdentSrc1,
      idUsagerIdentSrc2: idUsagerIdentSrc2,
      idUsagerIdentResultat: idUsagerIdentFusion
    };

    const url: string = this.urlInfoSocialApi + CTX_USAGERS + CTX_FUSIONNER;
    return this.http.put<void>(url, usagerFusion);
  }

  /**
   * Recherche les fusions d'usagers correspondant aux critères inclus dans rechercheFusionUsagerCritereDto.
   * @param rechercheFusionUsagerCritereDto RechercheFusionUsagerCritereDTO
   * @returns RechercheFusionUsagerResultatDTO
   */
  rechercherUsagerFusion(rechercheFusionUsagerCritereDto: RechercheFusionUsagerCritereDTO): Observable<RechercheFusionUsagerResultatDTO> {
    const url: string = this.urlUsagerApi + CTX_USAGERS_FUSION;
    return this.http.post<RechercheFusionUsagerResultatDTO>(url, rechercheFusionUsagerCritereDto);
  }

  genererExcelFusion(criteresRecherche: RechercheFusionUsagerCritereDTO): Observable<ExportationExcelDTO> {
    const url: string = this.urlUsagerApi + CTX_USAGERS_FUSION;
    return this.http.post<ExportationExcelDTO>(url + "download", criteresRecherche);
  }

  private getNombreFicheAppelSanteOuverteByIdUsagerIdent(idUsagerIdent: number): Observable<number> {
    const url: string = this.urlInfoSanteApi + CTX_FICHES_APPEL + CTX_NB_FICHES_OUVERTES + "/" + idUsagerIdent;
    return this.http.get<number>(url);
  }

  private getNombreFicheAppelSocialOuverteByIdUsagerIdent(idUsagerIdent: number): Observable<number> {
    const url: string = this.urlInfoSocialApi + CTX_FICHES_APPEL + CTX_NB_FICHES_OUVERTES + "/" + idUsagerIdent;
    return this.http.get<number>(url);
  }

  getNombreFicheAppelOuverteByIdUsagerIdent(idUsagerIdent: number): Observable<number> {
    return forkJoin([
      this.getNombreFicheAppelSanteOuverteByIdUsagerIdent(idUsagerIdent),
      this.getNombreFicheAppelSocialOuverteByIdUsagerIdent(idUsagerIdent),
    ]).pipe(map(results => {
      const nbFicheSante = results[0] as number;
      const nbFicheSocial = results[1] as number;
      return nbFicheSante + nbFicheSocial;
    }));
  }

  convertByteDataToExcelAndMakeDownload(fileContent: any, fileName: string) {
    if (fileContent) {
      const a = document.createElement('a');
      document.body.appendChild(a);

      const data: any = fileContent;
      const byteCharacters = atob(data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      let blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

      const fileURL = window.URL.createObjectURL(blob);
      a.href = fileURL;
      a.download = fileName;
      a.click();
    }
  }

}
