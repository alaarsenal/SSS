import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { Observable } from 'rxjs';

const CTX_APPELS_ANTERIEURS: string = "/appels-anterieur/";
const CTX_ACCESSIBLE: string = "/accessible";

@Injectable({
  providedIn: 'root'
})
export class AppelAnterieurApiService {

  private urlBase: string;

  constructor(private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler) {
    this.urlBase = window["env"].urlUsagerApi;
    this.httpErrorHandler.createHandleError('AppelAnterieurApiService');
  }

  /**
   * Vérifie si une fiche d'appel peut être accédée par l'utilisateur connecté.
   * @param idFicheAppel identifiant de la fiche d'appel à valider
   */
  isFicheAppelAccessible(domaine: String, idFicheAppel: number): Observable<boolean> {
    return this.http.get<boolean>(this.urlBase + CTX_APPELS_ANTERIEURS + domaine + "/" + idFicheAppel + CTX_ACCESSIBLE);
  }

}
