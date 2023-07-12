import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { Observable } from 'rxjs';
import { DemarcheTraitementDTO } from '../models/demarche-traitement-dto';



const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token'
  })
};

@Injectable({
  providedIn: 'root'
})
export class DemarcheTraitementService {

  urlBase: string = '';
  urlBaseAjout: string = '';

  ctxDemarcheTraitement: string = '/demarchetraitement';
  ctxFicheAppel: string = '/fiches-appel/';

  constructor(private http: HttpClient,
    httpErrorHandler: HttpErrorHandler,
    ) {


    this.urlBase = window["env"].urlSanteApi;


    httpErrorHandler.createHandleError('DemarcheTraitementService'); //Important pour instancier correctement le service
  }

  getDemarcheTraitement(idAppel: number, idDemarcheTraitement: number): Observable<DemarcheTraitementDTO> {
    return this.http.get<DemarcheTraitementDTO>(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxDemarcheTraitement +'/' + idDemarcheTraitement, httpOptions);
  }

  supprimerDemarcheTraitement(idAppel: number, idDemarcheTraitement: number) : Observable<any>{
    return this.http.delete(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxDemarcheTraitement +'/' + idDemarcheTraitement, httpOptions);
  }

  //Le id est le numéro de l'appel courrant
  getListeDemarcheTraitement(idAppel: number): Observable<DemarcheTraitementDTO[]> {
    return this.http.get<DemarcheTraitementDTO[]>(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxDemarcheTraitement  + '/', httpOptions);
  }

  ajouterDemarcheTraitement(idAppel:number ,dto: DemarcheTraitementDTO): Observable<DemarcheTraitementDTO> {
    return this.http.post<DemarcheTraitementDTO>(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxDemarcheTraitement , dto , httpOptions  ); 
  } 
   
  modifierDemarcheTraitement(idAppel:number, dto: DemarcheTraitementDTO): Observable<DemarcheTraitementDTO> {
    return this.http.put<DemarcheTraitementDTO>(this.urlBase + this.ctxFicheAppel + idAppel + this.ctxDemarcheTraitement, dto, httpOptions);
  }


}
