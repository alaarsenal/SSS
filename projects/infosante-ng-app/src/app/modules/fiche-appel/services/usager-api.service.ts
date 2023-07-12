import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UsagerDTO } from 'projects/infosante-ng-core/src/lib/models/usager-dto';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { LinkedUsagerDTO } from 'projects/sigct-service-ng-lib/src/lib/models/linked-usager-dto';
import { Observable } from 'rxjs';

const CTX_SEXE_EXISTS: string = '/exists-sexe/';
const CTX_USAGERS_IDENT: string = '/usagers-ident/';

const HTTP_OPTIONS = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token'
  })
};

@Injectable({
  providedIn: 'root'
})
export class UsagerApiService {

  urlApiSante = window["env"].urlSanteApi;
  urlApiUsager = window["env"].urlUsagerApi;

  ctxFichesAppels = '/fiches-appel';
  ctxUsagers = '/usagers';

  constructor(private http: HttpClient,
    httpErrorHandler: HttpErrorHandler) {
    httpErrorHandler.createHandleError('UsagerService'); //Important pour instancier correctement le service
  }

  /**
   * Relier un usager à une fiche d'appel.
   * @param idFicheAppel identifiant de la fiche d'appel
   * @param usagerDto usager à lier
   */
  relierUsager(idFicheAppel: number, usagerDto: UsagerDTO): Observable<UsagerDTO> {
    if (usagerDto && usagerDto.id) {
      return this.http.put<UsagerDTO>(this.urlApiSante + this.ctxFichesAppels + "/" + idFicheAppel + this.ctxUsagers + "/" + usagerDto.id, usagerDto, HTTP_OPTIONS);
    } else {
      return this.http.post<UsagerDTO>(this.urlApiSante + this.ctxFichesAppels + "/" + idFicheAppel + this.ctxUsagers, usagerDto, HTTP_OPTIONS);
    }
  }

  /**
   * Vérifie l'existence du sexe pour un usager.
   * @param idUsagerIdent identifiant de l'usager
   */
  existsSexeUsager(idUsagerIdent: number): Observable<boolean> {
    const url: string = this.urlApiUsager + CTX_USAGERS_IDENT + idUsagerIdent + CTX_SEXE_EXISTS;
    return this.http.get<boolean>(url, HTTP_OPTIONS);
  }

  fetchAllUsagerLinkedToGivenFicheAppels(idFicheAppel: number, idAppel: number): Observable<LinkedUsagerDTO[]> {
    return this.http.get<LinkedUsagerDTO[]>(this.urlApiSante + this.ctxFichesAppels + "/" + idFicheAppel + "/usagers/" + idAppel);
  }

  /**
   * Retourn l'usager relié à la fiche d'appel idFicheAppel
   * @param idFicheAppel identifiant de la fiche d'appel
   * @returns un LinkedUsagerDTO
   */
  getUsagerFicheAppel(idFicheAppel: number): Observable<LinkedUsagerDTO> {
    return this.http.get<LinkedUsagerDTO>(this.urlApiSante + this.ctxFichesAppels + "/" + idFicheAppel + "/usagers");
  }
}
