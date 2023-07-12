import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, iif, Observable, of } from 'rxjs';
import { ProtocoleDTO } from '../models/protocole-dto';
import { RpiApiService, NomType } from '../services/rpi-api.service';
import { catchError, map, mergeMap } from 'rxjs/operators';


const CTX_FICHE_APPEL: string = "/fiches-appel/";
const CTX_PROTOCOLES: string = "/protocoles";
const CTX_PROTOCOLES_GIEA: string = "/protocoles-giea";


@Injectable({
  providedIn: 'root'
})
export class ProtocoleApiService {

  urlApiInfoSante: string;

  constructor(
    private http: HttpClient,
    private rpiApiService: RpiApiService) {
    this.urlApiInfoSante = window["env"].urlSanteApi;
  }

  /**
   * Retourne la liste des protocoles d'une fiche d'appel avec leurs types.
   * @param idFicheAppel identifiant de la fiche d'appel
   * @returns liste de ProtocoleDTO
   */
  public getListeProtocole(idFicheAppel: number): Observable<ProtocoleDTO[]> {
    return this.http.get<ProtocoleDTO[]>(this.urlApiInfoSante + CTX_FICHE_APPEL + idFicheAppel + CTX_PROTOCOLES).pipe(
      mergeMap((protocoles: ProtocoleDTO[]) =>
        iif(() => protocoles.length == 0,
          // Si la liste de protocoles est vide, on retourne une liste vide  
          of([]),
          // Sinon, pour chaque protocole de la liste, récupère le code du type de document dans GIEA.
          forkJoin(protocoles.map((protocole: ProtocoleDTO) =>
            this.rpiApiService.getDocumentIdentificationNomType(protocole.idDocIdent != null ? protocole.idDocIdent : protocole.refDocumentDrupal).pipe(map((nomType: NomType) => {
              protocole.typeDocument = nomType.codeReferenceDocumentType;
              return protocole;
            }))
          ))
        )),
      // Si une erreur survient pendant l'appel à GIEA (serveur down, droits accès insuffisants, etc), 
      // on retourne une liste vide pour ne pas bloquer le traitement.
      catchError(e => of([]))
    );
  }

  /**
   * Ajoute une liste de protocoles aux protocoles d'une fiche d'appel.
   * @param idFicheAppel identifiant de la fiche d'appel
   * @param protocolesDtos liste de ProtocoleDTO à ajouter
   * @returns liste de tous les ProtocoleDTO de la fiche d'appel
   */
  public ajouterListeProtocole(idFicheAppel: number, protocolesDtos: ProtocoleDTO[]): Observable<ProtocoleDTO[]> {
    return this.http.post<ProtocoleDTO[]>(this.urlApiInfoSante + CTX_FICHE_APPEL + idFicheAppel + CTX_PROTOCOLES, protocolesDtos);
  }

  /**
  * Copier et relier un document à une fiche
  * @param idFicheAppel 
  * @param dto 
  * @returns 
  */
  copierDocumentEtInfos(idFicheAppel: number, dto: ProtocoleDTO): Observable<void> {
    return this.http.post<void>(this.urlApiInfoSante + CTX_FICHE_APPEL + idFicheAppel + CTX_PROTOCOLES_GIEA, dto);
  }

  /**
   * Supprime un protocole.
   * @param idProtocole identifiant du protocole à supprimer
   * @returns void
   */
  public supprimerProtocole(idProtocole: number): Observable<void> {
    return this.http.delete<void>(this.urlApiInfoSante + CTX_PROTOCOLES + "/" + idProtocole);
  }
}
