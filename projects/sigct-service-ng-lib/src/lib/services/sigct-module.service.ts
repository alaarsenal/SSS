import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SigctModuleDTO } from '../models/sigct-module-dto';

@Injectable({
  providedIn: 'root'
})
export class SigctModuleService {
  constructor(private http: HttpClient) {
  }

  /**
   * Appel le service web pour récupérer les informations de l'utilisateur connecté.
   */
  public getAllSigctModule(): Observable<SigctModuleDTO[]> {
    const urlPortail: string = window["env"].urlPortail;
    return this.http.get<SigctModuleDTO[]>(urlPortail + "sigct-modules");
  }

}
