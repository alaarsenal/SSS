import { Injectable } from "@angular/core";
import { HttpHeaders, HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ReferenceSuitesInterventionDTO } from '../models/reference-suites-intervention-dto';

const CTX_FICHE_APPEL: string = "/fiches-appel"
const CTX_REFERENCE: string = "/suites-intervention/reference";

const HTTP_OPTIONS = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
    Authorization: "my-auth-token"
  })
};

@Injectable({
  providedIn: "root"
})
export class SigctReferenceSuitesInterventionService {

  constructor(private http: HttpClient) { }

  create(urlBase: string, referenceSuitesIntervention: ReferenceSuitesInterventionDTO): Observable<ReferenceSuitesInterventionDTO> {
    return this.http.post<ReferenceSuitesInterventionDTO>(
      urlBase + CTX_FICHE_APPEL + CTX_REFERENCE,
      referenceSuitesIntervention,
      HTTP_OPTIONS
    );
  }

  findAll(urlBase: string, idFicheAppel: number): Observable<ReferenceSuitesInterventionDTO[]> {
    return this.http.get<ReferenceSuitesInterventionDTO[]>(
      urlBase + CTX_FICHE_APPEL + "/" + idFicheAppel + CTX_REFERENCE
    );
  }

  delete(urlBase: string, idReference: number): Observable<any> {
    return this.http.delete<any>(
      urlBase + CTX_FICHE_APPEL + CTX_REFERENCE + "/" + idReference,
      HTTP_OPTIONS
    );
  }
}
