import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { Observable, } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AideEnLigneApiService {

    constructor(
        private http: HttpClient,
        httpErrorHandler: HttpErrorHandler) {
        httpErrorHandler.createHandleError('AideEnLigneApiService');
    }

    /**s
    * Récupère l'URL de la page aide en ligne selon l'URL courante 
    * @param urlApi URL de l'api à utiliser pour aller chercher l'information
    * @param urlCourrante url ou se trouve actuellement l'utilisateur au cas ou une page spécifique ait sa propre aide
    */
    obtenirURLAidePage(urlApi: string, urlCourante: string): Observable<string> {
        let params = new HttpParams().set('urlCourante', urlCourante + '/');
        return this.http.get<string>(urlApi + '/aide-en-ligne'
            , { params });
    }

    /**
   * Récupère l'URL de la page aide en ligne selon l'URL courante 
   * @param urlApi URL de l'api à utiliser pour aller chercher l'information
   * @param urlCourrante url ou se trouve actuellement l'utilisateur au cas ou une page spécifique ait sa propre aide
   * @param aideBaseUrl url du module aide
   */
    buildURLAidePage(urlApi: string, urlCourante: string, aideBaseUrlModule: string): Observable<string> {
        let params = new HttpParams()
            .set('urlCourante', urlCourante + '/')
            .set('aideBaseUrlModule', aideBaseUrlModule);
        return this.http.get<string>(urlApi + '/aide-en-ligne', { params });
    }

    getAllAideUrls(urlApi: string): Observable<string []> {
        return this.http.get<string []>(urlApi + '/aide-en-ligne-urls');
    }

    getAideUrlByDefault(urlApi: string): Observable<any> {
        return this.http.get<any>(urlApi + '/aide-en-ligne-default');
    }
}
