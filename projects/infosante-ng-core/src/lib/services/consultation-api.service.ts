import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { ConsultationInteractionDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/section-interaction-dto';
import { Observable } from 'rxjs';
import { ConsultationDemandeEvaluationDTO, ConsultationFicheAppelDTO, ConsultationReferentielDTO } from '../models';


@Injectable({
  providedIn: 'root'
})
export class ConsultationApiService {

  private urlApiSante: string;
  /** /consultation/demande-evaluation */
  private ctxDemandeEvaluation: string = "/consultation/demande-evaluation";
  /** /fiches-appel/ */
  private ctxFicheAppel: string = "/fiches-appel/";
  /** /consultation/demande-evaluation */
  private ctxReferentiel: string = "/consultation/referentiel";
  /** /appels/ */
  private ctxAppel: string = "/appels/";
  /** /consultation/interaction */
  private ctxInteraction:string ="/consultation/interaction";

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler) {
    this.httpErrorHandler.createHandleError('ConsultationService'); //Important pour instancier correctement le service
    this.urlApiSante = window["env"].urlSanteApi;
  }

  getConsultationDemandeEvaluation(idFicheAppel: number): Observable<ConsultationDemandeEvaluationDTO> {
    return this.http.get<ConsultationDemandeEvaluationDTO>(this.urlApiSante + this.ctxFicheAppel + idFicheAppel + this.ctxDemandeEvaluation);
  }

  getConsultationFicheAppel(idFicheAppel: number): Observable<ConsultationFicheAppelDTO> {
    return this.http.get<ConsultationFicheAppelDTO>(this.urlApiSante + this.ctxFicheAppel + idFicheAppel);
  }

  getConsultationReferentiel(idFicheAppel: number): Observable<ConsultationReferentielDTO> {
    return this.http.get<ConsultationReferentielDTO>(this.urlApiSante + this.ctxFicheAppel + idFicheAppel + this.ctxReferentiel);
  }

  getConsultationInteraction(idAppel:number): Observable<ConsultationInteractionDTO> {
    return this.http.get<ConsultationInteractionDTO>(this.urlApiSante + this.ctxAppel + idAppel + this.ctxInteraction);
  }
}
