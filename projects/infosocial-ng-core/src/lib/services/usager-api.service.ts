import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UsagerDTO } from 'projects/infosocial-ng-core/src/lib/models/usager-dto';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { Observable } from 'rxjs';
import { LinkedUsagerDTO } from '../../../../sigct-service-ng-lib/src/lib/models/linked-usager-dto';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token'
  })
};

@Injectable({
  providedIn: 'root'
})
export class UsagerApiService {

  urlApiInfoSocial: string;

  ctxFichesAppels = '/fiches-appel';
  ctxUsagers = '/usagers';

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler) {
    this.urlApiInfoSocial = window["env"].urlInfoSocial + '/api';
    this.httpErrorHandler.createHandleError('UsagerApiService');
  }

  /**
   * Relier un usager à une fiche d'appel.
   * @param idFicheAppel identifiant de la fiche d'appel
   * @param usagerDto usager à lier
   */
  relierUsager(idFicheAppel: number, usagerDto: UsagerDTO): Observable<UsagerDTO> {
    if (usagerDto && usagerDto.id) {
      return this.http.put<UsagerDTO>(this.urlApiInfoSocial + this.ctxFichesAppels + "/" + idFicheAppel + this.ctxUsagers + "/" + usagerDto.id, usagerDto, httpOptions);
    } else {
      return this.http.post<UsagerDTO>(this.urlApiInfoSocial + this.ctxFichesAppels + "/" + idFicheAppel + this.ctxUsagers, usagerDto, httpOptions);
    }
  }

  fetchAllUsagerLinkedToGivenFicheAppels(idFicheAppel: number, idAppel: number): Observable<LinkedUsagerDTO[]> {
    return this.http.get<LinkedUsagerDTO[]>(this.urlApiInfoSocial + this.ctxFichesAppels + "/" + idFicheAppel + "/usagers/" + idAppel);
  }

  /**
   * Retourn l'usager relié à la fiche d'appel idFicheAppel
   * @param idFicheAppel identifiant de la fiche d'appel
   * @returns un LinkedUsagerDTO
   */
  getUsagerFicheAppel(idFicheAppel: number): Observable<LinkedUsagerDTO> {
    return this.http.get<LinkedUsagerDTO>(this.urlApiInfoSocial + this.ctxFichesAppels + "/" + idFicheAppel + "/usagers");
  }
}
