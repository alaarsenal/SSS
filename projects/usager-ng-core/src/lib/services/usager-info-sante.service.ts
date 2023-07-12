import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { UsagerIdentHistoDTO } from 'projects/usager-ng-core/src/lib/models/usager-ident-histo-dto';
import { Observable, of } from 'rxjs';

const CTX_CODE_POSTAL: string = '/exists-code-postal/';
const CTX_HISTORIQUES: string = '/historiques/';
const CTX_USAGERS_IDENT: string = '/usagers-ident/';
const CTX_FUSIONNER: string = '/usagers/fusionner/';

const HTTP_OPTIONS = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
    Authorization: "my-auth-token"
  })
};

@Injectable({
  providedIn: "root"
})
export class UsagerInfoSanteService {

  constructor(private http: HttpClient) { }

  existsCodePostalUsager(idUsagerIdent: number): Observable<boolean> {
    const url: string = window["env"].urlUsagerApi + CTX_CODE_POSTAL + idUsagerIdent;
    return this.http.get<boolean>(url, HTTP_OPTIONS);
  }

  creerHistoriqueUsagerIdent(idUsagerIdent: number): Observable<UsagerIdentHistoDTO> {
    if (!idUsagerIdent) {
      return of(null);
    }
    const url: string = window["env"].urlUsagerApi + CTX_USAGERS_IDENT + idUsagerIdent + CTX_HISTORIQUES;
    return this.http.post<UsagerIdentHistoDTO>(url, null);
  }

}
