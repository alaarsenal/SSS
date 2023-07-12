import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { Observable } from 'rxjs';
import { SigctAbout } from "./sigct-about";


const headers: HttpHeaders = new HttpHeaders().append('Content-Type', 'application/json').append('Authorization', 'my-auth-token');

const httpOptions = {
  headers
};

/**
 * Classe gérant l'appel au backend l'URL reference/system/config
 */
@Injectable({
  providedIn: 'root'
})
export class SigctAboutService {

  private baseUrl: String;

  constructor(private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler) {
    this.httpErrorHandler.createHandleError('SigctAboutService');
  }

  public getSigctAboutInfo(): Observable<SigctAbout> {

    let baseUrl: String;
    let appName: String = window["env"].appName;

    switch (appName) {
      case "infosante":
        baseUrl = window["env"].urlSante
        break;
      case "infosocial":
        baseUrl = window["env"].urlInfoSocial
        break;
      case "usager":
        baseUrl = window["env"].urlUsager
        break;
      default:
        baseUrl = window["env"].urlPortail
        break;
    }
    this.baseUrl = baseUrl;
    return this.http.get<SigctAbout>(baseUrl + '/rest/about');
  }

  // Rafraichir la cache applicative
  public getRafraichirCacheApplicative(): Observable<any> {
    if (this.baseUrl) {
      let url = this.baseUrl + '/api/cache/rafraichir';
      return this.http.get<any>(url);
    }

  }

  //TODO : créer un service approprié pour la cache
  // Rafraichir organisme RRSS
  public getRafraichirOrganisme(url: string) {
    this.http.get(url);
  }

  public getIndexer(dateDebut: Date, collection: string): Observable<any> {

    let baseUrl: String;

    baseUrl = window["env"].urlUsager

    return this.http.get<any>(baseUrl + '/api/indexer/' + collection + '/' + dateDebut.getTime(), httpOptions);
  }

  public getStatutFiche(nomModule: string): Observable<string> {

    let baseUrl: String;


    baseUrl = window["env"].urlUsager

    return this.http.get<string>(baseUrl + '/api/indexer/fiches/statut', httpOptions);
  }

  public getStatutUsager(nomModule: string): Observable<string> {

    let baseUrl: String;


    baseUrl = window["env"].urlUsager

    return this.http.get<string>(baseUrl + '/api/indexer/usager/statut', httpOptions);
  }

}