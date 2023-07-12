import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { Observable } from 'rxjs';
import { ParameterDTO } from '../models/parameter-dto';

const headers: HttpHeaders = new HttpHeaders().append('Content-Type', 'application/json').append('Authorization', 'my-auth-token');

const httpOptions = {
  headers
};

@Injectable({
  providedIn: 'root'
})
export class ParametreSanteDataService {

  private urlApiSante = window["env"].urlSanteApi;

  constructor(
    private http: HttpClient,
    httpErrorHandler: HttpErrorHandler) {
    httpErrorHandler.createHandleError('FicheAppelService'); //Important pour instancier correctement le service
  }

  obtenirParametre(code: string): Observable<ParameterDTO> {
    return this.http.get<ParameterDTO>(this.urlApiSante + '/parametres-sante/' + code, httpOptions);
  }
}
