import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { UsagerSanterSocialFichierDTO } from 'projects/sigct-ui-ng-lib/src/lib/model/UsagerSanterSocialFichierDTO';
import { Observable } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token'
  })
};

@Injectable(
  { providedIn: 'root' }
)
export class UsagerEnregistrementFichireService {
  /** Url de base de l'api (.../api)*/
  private baseUrlApiUsager: string;
  /** Url de l'api REST Usager (.../api/usagers-ident)*/
  private urlApiEnregistrement: string;

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler) {
    this.urlApiEnregistrement = window["env"].urlUsagerApi + '/enregistrement';
    this.httpErrorHandler.createHandleError('UsagerEnregistrementFichireService'); //Important pour instancier correctement le service

  }

  sauvegarder(fichier: UsagerSanterSocialFichierDTO, idEnregistrement: number): Observable<UsagerSanterSocialFichierDTO> {
    const ctx = this.urlApiEnregistrement + "/" + idEnregistrement + '/fichier';
    const data: FormData = new FormData();

    data.append('file', fichier.file);
    data.append('idReferenceType', fichier.idReferenceTypeFichier.toString());

    return this.http.post<UsagerSanterSocialFichierDTO>(ctx, data);
  }

  liste(idEnregistrement: number) {
    const ctx = this.urlApiEnregistrement + "/" + idEnregistrement + '/fichier';
    return this.http.get<UsagerSanterSocialFichierDTO[]>(ctx);
  }

  supprimer(idEnregistrement: number, idFichier: number) {
    const ctx = this.urlApiEnregistrement + "/" + idEnregistrement + '/fichier/' + idFichier;
    return this.http.delete(ctx);
  }

  getLinktelechargement(idEnregistrement: number, idFichier: number) {
    return this.urlApiEnregistrement + "/" + idEnregistrement + '/fichier/' + idFichier + '/telecharge';
  }

  getUrlBaseTelechargement(idEnregistrement: number) {
    return this.urlApiEnregistrement + "/" + idEnregistrement + '/fichier/{idFichier}/telecharge';
  }

}
