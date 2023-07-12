import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { Observable } from 'rxjs';
import { ProjetRechercheDTO } from '../models/projet-recherche-dto';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token'
  })
};


@Injectable({
  providedIn: 'root'
})
export class ProjetRechercheService {

  urlBase: string = '';
  urlBaseAjout: string = '';

  ctxProjetRecherche: string = '/projetrecherche';
  ctxFicheAppel: string = '/fiches-appel/';

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler) {
    this.urlBase = window["env"].urlSanteApi;
    this.httpErrorHandler.createHandleError('ProjetRechercheService'); //Important pour instancier correctement le service
  }

  getProjetRecherche(idAppel: number, idProjetRecherche: number): Observable<ProjetRechercheDTO> {
    return this.http.get<ProjetRechercheDTO>(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxProjetRecherche + '/' + idProjetRecherche, httpOptions);
  }

  supprimerProjetRecherche(idAppel: number, idProjetRecherche: number): Observable<any> {
    return this.http.delete(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxProjetRecherche + '/' + idProjetRecherche, httpOptions);
  }

  //Le id est le numéro de l'appel courrant
  getListeProjetRecherche(idAppel: number): Observable<ProjetRechercheDTO[]> {
    return this.http.get<ProjetRechercheDTO[]>(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxProjetRecherche + '/', httpOptions);
  }

  ajouterProjetRecherche(idAppel: number, dto: ProjetRechercheDTO): Observable<ProjetRechercheDTO> {
    return this.http.post<ProjetRechercheDTO>(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxProjetRecherche, dto, httpOptions);
  }

  validerProjetRecherche(id: number, dto?: ProjetRechercheDTO): Observable<ProjetRechercheDTO> {
    return this.http.post<ProjetRechercheDTO>(this.urlBase + this.ctxFicheAppel + id + this.ctxProjetRecherche + "valider", dto, httpOptions);
  }


}
