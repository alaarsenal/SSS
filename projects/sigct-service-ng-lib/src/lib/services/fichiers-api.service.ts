import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpErrorHandler } from '../http/http-error-handler.service';
import { TableFichierDTO } from '../models/TableFichierDTO';
import StringUtils from '../utils/string-utils';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token'
  })
};

@Injectable({
  providedIn: 'root'
})
export class FichiersApiService {

  /** Url de base de l'api (.../api)*/
  private baseUrlApiUsager: string;
  /** Url de l'api REST Usager (.../api/usagers-ident)*/
  private urlApiFichiers: string;

  private readonly REF_TABLE_SANTE: string = "SA_FICHE_APPEL";
  private readonly REF_TABLE_SOCIAL: string = "SO_FICHE_APPEL";

  constructor(
    private http: HttpClient,
    httpErrorHandler: HttpErrorHandler,
   ) {

    this.urlApiFichiers = this.getUrlBasedOnModuleNom() + '/fichiers';

    httpErrorHandler.createHandleError('FichierseService'); //Important pour instancier correctement le service

  }


  sauvegarder(fichier: TableFichierDTO, refId: number, refTable?: string): Observable<TableFichierDTO> {
    const ctx = this.urlApiFichiers + "/" + refId + '/fichiers';
    const data: FormData = new FormData();
    data.append('file', fichier.file);
    if (fichier.id) {
      data.append('idFile', fichier.id.toString());
    } else {
      data.append('idFile', "");
    }
    data.append("refTable", StringUtils.isBlank(refTable) ? "" : refTable);
    return this.http.post<TableFichierDTO>(ctx, data);
  }

  editer(fichiers: TableFichierDTO[], refId: number): Observable<TableFichierDTO[]> {
    const ctx = this.urlApiFichiers + "/" + refId + '/fichiers';

    return this.http.put<TableFichierDTO[]>(ctx, fichiers);
  }

  liste(refId: number, refTable?: string, domaine?: string) {
    const urlApiFichiers: string = this.getUrlBasedOnDomaine(domaine) + '/fichiers';
    const ctx = urlApiFichiers + "/" + refId + '/fichiers';
    let params = new HttpParams();
    if (!refTable) {
      refTable = this.getTableRefSelonLeModule()
    }
    params = params.append("refTable", refTable);
    return this.http.get<TableFichierDTO[]>(ctx, { params: params });
  }

  supprimer(refId: number, idFichier: number) {
    const ctx = this.urlApiFichiers + "/" + idFichier;
    return this.http.delete(ctx);
  }

  getLinktelechargement(refId: number, idFichier: number, domaine?: string) {
    const urlApiFichiers: string = this.getUrlBasedOnDomaine(domaine) + '/fichiers';
    return urlApiFichiers + "/" + idFichier + '/telechargelink';
  }

  getFichierTelechargement(idFichier: number): Observable<TableFichierDTO> {
    return this.http.get<TableFichierDTO>(this.urlApiFichiers + "/" + idFichier + '/telecharge');
  }

  getUrlBaseTelechargement(domaine?: string) {
    const urlApiFichiers: string = this.getUrlBasedOnDomaine(domaine) + '/fichiers';
    return urlApiFichiers + "/{idFichier}/telechargelink";
  }

  getUrlBaseTelecharge() {
    return this.urlApiFichiers + "/{idFichier}/telecharge";
  }

  getUrlBaseTelechargeAvecParametre(idFichier: number) {
    return this.urlApiFichiers + "/" + idFichier + "/telecharge";
  }

  getUrlBaseTelechargementAvecParametre(idFichier: number, domaine?: string) {
    const urlApiFichiers: string = this.getUrlBasedOnDomaine(domaine) + '/fichiers';
    return urlApiFichiers + "/" + idFichier + "/telechargelink";
  }

  /**
   * Retourne l'url du serveur selon le domaine SA/SO/US.
   * @param domaine SA/SO/US
   * @returns
   */
  private getUrlBasedOnDomaine(domaine: string): string {
    let urlBase: string = this.getUrlBasedOnModuleNom();
    switch (domaine) {
      case "SA":
        urlBase = window["env"].urlSanteApi;
        break;
      case "SO":
        urlBase = window["env"].urlInfoSocial + '/api';
        break;
      case "US":
        urlBase = window["env"].urlUsagerApi;
        break;
    }
    return urlBase;
  }

  private getUrlBasedOnModuleNom(): string {
    let appName: string = window["env"].appName;
    let urlBase: string;
    if (appName == "infosante") {
      urlBase = window["env"].urlSante + '/api';
    }
    if (appName == "infosocial") {
      urlBase = window["env"].urlInfoSocial + '/api';
    }
    if (appName == "usager") {
      urlBase = window["env"].urlUsagerApi;
    }
    return urlBase;
  }

  private getTableRefSelonLeModule(): string {
    let appName: string = window["env"].appName;
    if (appName == "infosante") {
      return this.REF_TABLE_SANTE
    }
    if (appName == "infosocial") {
      return this.REF_TABLE_SOCIAL
    }
  }
}
