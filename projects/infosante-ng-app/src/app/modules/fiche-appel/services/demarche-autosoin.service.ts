import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { Observable } from 'rxjs';
import { DemarcheAnterieuresDTO } from '../models/demarche-anterieures-dto';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token'
  })
};

@Injectable({
  providedIn: 'root'
})
export class DemarcheAutosoinService {

  urlBase: string = '';
  urlBaseAjout: string = '';

  ctxDemarcheAnterieures: string = '/demarcheautosoin';
  ctxFicheAppel: string = '/fiches-appel/';

  constructor(private http: HttpClient,
    httpErrorHandler: HttpErrorHandler,
    ) {


    this.urlBase = window["env"].urlSanteApi;


    httpErrorHandler.createHandleError('DemarcheAutosoinService'); //Important pour instancier correctement le service
  }

  getDemarcheAnterieures(idAppel: number, idDemarcheAnterieures: number): Observable<DemarcheAnterieuresDTO> {
    return this.http.get<DemarcheAnterieuresDTO>(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxDemarcheAnterieures +'/' + idDemarcheAnterieures, httpOptions);
  }

  supprimerDemarcheAnterieures(idAppel: number, idDemarcheAnterieures: number) : Observable<any>{
    return this.http.delete(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxDemarcheAnterieures +'/' + idDemarcheAnterieures, httpOptions);
  }

  //Le id est le numéro de l'appel courrant
  getListeDemarcheAnterieures(idAppel: number): Observable<DemarcheAnterieuresDTO[]> {
    return this.http.get<DemarcheAnterieuresDTO[]>(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxDemarcheAnterieures  + '/', httpOptions);
  }

  ajouterDemarcheAnterieures(idAppel:number ,dto: DemarcheAnterieuresDTO): Observable<DemarcheAnterieuresDTO> {
    return this.http.post<DemarcheAnterieuresDTO>(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxDemarcheAnterieures , dto , httpOptions  ); 
  } 
   
  modifierDemarcheAnterieures(idAppel:number, dto: DemarcheAnterieuresDTO): Observable<DemarcheAnterieuresDTO> {
    return this.http.put<DemarcheAnterieuresDTO>(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxDemarcheAnterieures, dto, httpOptions);
  }

}
