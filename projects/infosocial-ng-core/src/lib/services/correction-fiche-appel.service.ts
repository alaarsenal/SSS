import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { FicheAppelCorrectionDTO } from 'projects/sigct-service-ng-lib/src/lib/models/fiche-appel-correction-dto';
import { Observable, of } from 'rxjs';
import { CorrectionFicheAppelWrapperDTO } from '../models/correction-fiche-appel-wrapper-dto';
import { FicheAppelSocialDTO } from '../models/fiche-appel-social-dto';

const CTX_FICHE_APPEL: string = "/fiches-appel/";
const CTX_CORRECTION: string = "/correction";

const HTTP_OPTIONS = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
    Authorization: "my-auth-token"
  })
};

@Injectable({
  providedIn: "root"
})
export class CorrectionFicheAppelService {

  private urlBase: string;

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler) {
    this.urlBase = window["env"].urlInfoSocial + '/api';
    this.httpErrorHandler.createHandleError('CorrectionFicheAppelService');
  }

  /**Verifier si l'usager est déjà relié à une autre fiche du même appel
   * @param idUsagerIdent
   * @param ficheAppel
   */
  isUsagerLieAutreFiche(idUsagerIdent: number, ficheAppel: FicheAppelSocialDTO): Observable<boolean> {
    if (!idUsagerIdent || !ficheAppel || !ficheAppel.idAppel) {
      return of(false);
    }
    return this.http.get<boolean>(this.urlBase + CTX_FICHE_APPEL + ficheAppel.idAppel + CTX_CORRECTION + "/usager-relie/" + idUsagerIdent);
  }

  /**Valider la correction de la fiche d'appel avant de la terminer
   * @param dto: le wrapper de la correction de la fiche d'appel
   * @returns un observable avec le wrapper de la correction de la
   * fiche d'appel validée
   */
  validerCorrectionFicheAppel(dto: CorrectionFicheAppelWrapperDTO): Observable<CorrectionFicheAppelWrapperDTO> {
    return this.http.post<CorrectionFicheAppelWrapperDTO>(this.urlBase + CTX_FICHE_APPEL + dto.ficheAppel.id + CTX_CORRECTION + '/valider', dto, HTTP_OPTIONS);
  }

  /**Terminer la correction de la fiche d'appel une fois validée
   * @param dto: le wrapper de la correction de la fiche d'appel
   * @returns un observable avec l'id de la fiche d'appel corrigée
   */
  terminerCorrectionFicheAppel(dto: CorrectionFicheAppelWrapperDTO): Observable<Number> {
    return this.http.post<Number>(this.urlBase + CTX_FICHE_APPEL + dto.ficheAppel.id + CTX_CORRECTION + '/terminer', dto, HTTP_OPTIONS);
  }

  findAllByIdFicheAppel(idFicheAppel: number): Observable<FicheAppelCorrectionDTO[]> {
    return this.http.get<FicheAppelCorrectionDTO[]>(this.urlBase + CTX_FICHE_APPEL + idFicheAppel + CTX_CORRECTION + '/all');
  }

}
