import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { Observable } from 'rxjs';

const CTX_DOCUMENTS_IDENTIFICATION: string = "/documents-identification/";
const CTX_NOM_TYPE: string = "/nom-type";

export interface NomType {
  codeReferenceDocumentType: string;
}

@Injectable({
  providedIn: 'root'
})
export class RpiApiService {

  private urlGieaApi: string;
  private httpSansInterceptor: HttpClient;

  constructor(
    private handler: HttpBackend,
    private httpErrorHandler: HttpErrorHandler) {
    this.urlGieaApi = window["env"].urlGieaApi;
    this.httpErrorHandler.createHandleError('RpiApiService');

    // L'utilisation de HttpBackend permet de by-passer l'interceptor.
    this.httpSansInterceptor = new HttpClient(this.handler);
  }

  /**
   * Récupère le nom d'un document et le code de son type de document.
   * @param urlApi
   * @param idDocumentIdent 
   * @returns 
   */
  getDocumentIdentificationNomType(idDocumentIdent: number): Observable<NomType> {
    // Cette méthode peut être appelée alors que l'utilisateur n'a pas les droits d'accès à GIEA.
    // httpSansInterceptor permet de by-passer l'interceptor sans quoi une erreur Problème serveur s'affiche.
    // withCredentials est important pour éviter un problème de CORS.
    return this.httpSansInterceptor.get<NomType>(this.urlGieaApi + CTX_DOCUMENTS_IDENTIFICATION + idDocumentIdent + CTX_NOM_TYPE, { withCredentials: true });
  }
}
