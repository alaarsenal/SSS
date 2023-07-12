import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { Observable, of } from 'rxjs';
import { SigneDTO } from '../models';


@Injectable({
  providedIn: 'root'
})
export class SigneService {

  private urlBase: string = '';
  private ctxSigne: string = '/signes/';
  private ctxFicheAppel: string = '/fiches-appel/';

  constructor(
    private http: HttpClient,
    httpErrorHandler: HttpErrorHandler,
  ) {
    this.urlBase = window["env"].urlSanteApi;

    httpErrorHandler.createHandleError('SigneService'); //Important pour instancier correctement le service
  }

  getSigne(idFicheAppel: number, idSigne: number): Observable<SigneDTO> {
    return this.http.get<SigneDTO>(this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxSigne + idSigne);
  }

  supprimerSigne(idFicheAppel: number, idSigne: number): Observable<any> {
    return this.http.delete(this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxSigne + idSigne);
  }

  getListeSigne(idFicheAppel: number): Observable<SigneDTO[]> {
    return this.http.get<SigneDTO[]>(this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxSigne);
  }

  ajouterSigne(idFicheAppel: number, dto: SigneDTO): Observable<SigneDTO> {
    return this.http.post<SigneDTO>(this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxSigne, dto);
  }

  modifierSigne(idFicheAppel: number, dto: SigneDTO): Observable<SigneDTO> {
    return this.http.put<SigneDTO>(this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxSigne, dto);
  }

  save(dto: SigneDTO): Observable<SigneDTO> {
    if (!dto) {
      return of(null);
    }
    return dto.id
      ? this.modifierSigne(dto.ficheAppelId, dto)
      : this.ajouterSigne(dto.ficheAppelId, dto);
  }

}
