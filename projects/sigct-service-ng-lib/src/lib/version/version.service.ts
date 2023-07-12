import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Version } from "./version";


/**
 * Classe gérant l'appel au backend l'URL reference/system/config
 */
@Injectable({
  providedIn: 'root'
})
export class VersionService {

  constructor(private http: HttpClient) {
  }

  removeVersionLocalStorage(): void {
    sessionStorage.removeItem("version");
  }

  saveVersionLocalStrorage(version: Version): void {
    sessionStorage.setItem("version", JSON.stringify(version));
  }

  /**
   * Méthode utilisé par les autres classes pour obtenir le numéro de version
   * Si le numéro de version n'existe pas encore au storage, il est récuperé
   * du serveur et sauvegardé au storage
   */
  loadVersion(): Observable<Version> {
    let version: Version = <Version>JSON.parse(sessionStorage.getItem("version"));
    if (version) {
      if (version?.appVersion.includes("-")) {
        version.appVersion = version.appVersion.split("-")[0];
      }
      return of(version);
    }
    return this.http.get<Version>(window["env"].urlConfig).pipe(
      map((result: Version) => {
        if (result?.appVersion.includes("-")) {
          result.appVersion = result.appVersion.split("-")[0];
        }
        this.saveVersionLocalStrorage(result);
        return result;
      }, catchError((error: HttpErrorResponse) => {
        return of(error);
      }))
    );
  }

}
