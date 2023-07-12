import { HttpBackend, HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import { Observable, of } from 'rxjs';

const CTX_RESUMES_RUBRIQUES: string = "/rubriques-information-resumee";
const CTX_DOCUMENTS_IDENTIFICATION: string = "/documents-dentification/";
const CTX_NOM_TYPE: string = "/nom-type";

export interface NomType {
  nom: string;
  codeReferenceDocumentType: string;
}

@Injectable({
  providedIn: 'root'
})
export class GippApiService {

  private urlGippApi: string;
  private httpSansInterceptor: HttpClient;

  constructor(
    private http: HttpClient,
    private handler: HttpBackend,
    private httpErrorHandler: HttpErrorHandler) {
    this.urlGippApi = window["env"].urlGippApi;
    this.httpErrorHandler.createHandleError('GippApiService');

    // L'utilisation de HttpBackend permet de by-passer l'interceptor.
    this.httpSansInterceptor = new HttpClient(this.handler);
  }

  getListeResumeRubriques(rubriqueIds: string[]): Observable<string[]> {
    if (CollectionUtils.isNotBlank(rubriqueIds)) {
      let qryParams: HttpParams = new HttpParams();
      rubriqueIds.forEach((rubriqueId: string) => {
        qryParams = qryParams.append('rubriqueIds', rubriqueId);
      })

      return this.http.get<string[]>(this.urlGippApi + CTX_RESUMES_RUBRIQUES, { params: qryParams });
    } else {
      return of([]);
    }
  }

  /**
   * Récupère le nom d'un document et le code de son type de document.
   * @param urlApi
   * @param idDocumentIdent 
   * @returns 
   */
  getDocumentIdentificationNomType(idDocumentIdent: number): Observable<NomType> {
    // Cette méthode peut être appelée alors que l'utilisateur n'a pas les droits d'accès à GIPP.
    // httpSansInterceptor permet de by-passer l'interceptor sans quoi une erreur Problème serveur s'affiche.
    // withCredentials est important pour éviter un problème de CORS.
    return this.httpSansInterceptor.get<NomType>(this.urlGippApi + CTX_DOCUMENTS_IDENTIFICATION + idDocumentIdent + CTX_NOM_TYPE, { withCredentials: true });
  }
}
