import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MoyenSocialDTO } from 'projects/infosocial-ng-core/src/lib/models/moyen-social-dto';
import { GippApiService, NomType } from 'projects/infosocial-ng-core/src/lib/services/gipp-api.service';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { forkJoin, iif, Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MoyenSocialService {
  private urlBase: string;

  /** /moyenSocial */
  private ctxMoyen: string = '/moyenSocial';
  /** /fiches-appel/ */
  private ctxFicheAppel: string = '/fiches-appel/';

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler,
    private gippApiService: GippApiService) {

    this.urlBase = window["env"].urlInfoSocial + '/api';
    this.httpErrorHandler.createHandleError('MoyenSocialService');
  }

  getListeMoyen(idFicheAppel: number): Observable<MoyenSocialDTO[]> {
    return this.http.get<MoyenSocialDTO[]>(this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxMoyen + '/').pipe(
      mergeMap((moyens: MoyenSocialDTO[]) =>
        iif(() => moyens.length == 0,
          // Si la liste de moyens est vide, on retourne une liste vide  
          of([]),
          // Sinon, pour chaque moyen de la liste, récupère le nom et le code du type de document dans GIPP.
          forkJoin(moyens.map((moyen: MoyenSocialDTO) =>
            this.gippApiService.getDocumentIdentificationNomType(moyen.idDocumentIdentificationSocial).pipe(map((nomType: NomType) => {
              moyen.codeDocumentIdentificationReferenceDocumentTypeSocial = nomType.codeReferenceDocumentType;
              moyen.nomDocumentIdentificationSocial = nomType.nom;
              return moyen;
            }))
          ))
        )),
      // Si une erreur survient pendant l'appel à GIPP (serveur down, droits accès insuffisants, etc), 
      // on retourne une liste vide pour ne pas bloquer le traitement.
      catchError(e => of([]))
    );
  }

  ajouterMoyen(idFicheAppel: number, dto: MoyenSocialDTO): Observable<MoyenSocialDTO> {
    return this.http.post<MoyenSocialDTO>(this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxMoyen + '/', dto);
  }

  deleteMoyen(idFicheAppel: number, idMoyenSocial: number): Observable<any> {
    return this.http.delete(this.urlBase + this.ctxFicheAppel + idFicheAppel + this.ctxMoyen + '/' + idMoyenSocial);
  }


}
