import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import { ValidationDTO } from 'projects/sigct-ui-ng-lib/src/lib/components/indicateurs-fin-intervention/validation-dto';
import { forkJoin, Observable, of } from "rxjs";

const URL_API_FICHE_APPEL: string = "/api/fiches-appel";
const CTX_VALIDATION: string = "/validation";

const HTTP_OPTIONS = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
    Authorization: "my-auth-token"
  })
};

@Injectable({
  providedIn: "root"
})
export class ValidationService {

  private urlBase: string;

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler) {
    this.urlBase = window["env"].urlInfoSocial;
    this.httpErrorHandler.createHandleError('ValidationService');
  }

  saveAll(dtos: ValidationDTO[], codeRefTypeFicheAppel: string): Observable<ValidationDTO[]> {
    if (CollectionUtils.isBlank(dtos)) {
      return of(null);
    }
    return forkJoin(dtos.map(dto => this.save(dto, codeRefTypeFicheAppel)));
  }

  save(dto: ValidationDTO, codeRefTypeFicheAppel: string): Observable<ValidationDTO> {
    dto.codeRefTypeFicheAppel = codeRefTypeFicheAppel;
    return dto.id ? this.update(dto) : this.create(dto);
  }

  create(dto: ValidationDTO): Observable<ValidationDTO> {
    return this.http.post<ValidationDTO>(this.urlBase + URL_API_FICHE_APPEL + CTX_VALIDATION, dto, HTTP_OPTIONS);
  }

  update(dto: ValidationDTO): Observable<ValidationDTO> {
    return this.http.put<ValidationDTO>(this.urlBase + URL_API_FICHE_APPEL + CTX_VALIDATION, dto, HTTP_OPTIONS);
  }

  findAllByIdFicheAppel(idFicheAppel: number): Observable<ValidationDTO[]> {
    return this.http.get<ValidationDTO[]>(this.urlBase + URL_API_FICHE_APPEL + "/" + idFicheAppel + CTX_VALIDATION);
  }

}
