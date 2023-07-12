import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { OrientationSuitesInterventionDTO } from "../models/orientation-suites-intervention-dto";
import { Observable } from "rxjs";
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';

const URL_FICHE_APPEL: string = '/fiches-appel';
const CTX_ORIENTATION: string = '/suites-intervention/orientation';

const HTTP_OPTIONS = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
    Authorization: "my-auth-token"
  })
};

@Injectable({
  providedIn: 'root'
})
export class SigctOrientationSuitesInterventionService {


  constructor(private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler) {

    this.httpErrorHandler.createHandleError('SigctOrientationSuitesInterventionService');

  }

  create(urlBase: string, orientationSuitesIntervention: OrientationSuitesInterventionDTO): Observable<OrientationSuitesInterventionDTO> {
    return this.http.post<OrientationSuitesInterventionDTO>(
      urlBase + URL_FICHE_APPEL + CTX_ORIENTATION,
      orientationSuitesIntervention,
      HTTP_OPTIONS
    )
  }

  getListOrientations(urlBase: string, idFicheAppel: number): Observable<OrientationSuitesInterventionDTO[]> {
    return this.http.get<OrientationSuitesInterventionDTO[]>(
      urlBase + URL_FICHE_APPEL + "/" + idFicheAppel + CTX_ORIENTATION
    );
  }  

  delete(urlBase: string, idOrientatoin: number): Observable<any> {
    return this.http.delete<any>(
      urlBase + URL_FICHE_APPEL + CTX_ORIENTATION + "/" + idOrientatoin,
      HTTP_OPTIONS
    );
  }  
}