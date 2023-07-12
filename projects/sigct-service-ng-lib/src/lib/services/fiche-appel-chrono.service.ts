import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EMPTY, Observable, Subject, of } from 'rxjs';
import { map } from 'rxjs/operators';
import AuthenticationUtils from '../auth/authentication-utils';
import { User } from '../auth/user';
import { FicheAppelChronoDTO } from '../models/fiche-appel-chrono-dto';
import DateUtils from '../utils/date-utils';

@Injectable({
  providedIn: "root"
})
export class FicheAppelChronoService {
  private ficheAppelChronoDto: FicheAppelChronoDTO = new FicheAppelChronoDTO();

  private startChronoSubj: Subject<FicheAppelChronoDTO> = new Subject<FicheAppelChronoDTO>();

  private urlFichesAppel: string;

  constructor(private http: HttpClient) {
    this.urlFichesAppel = this.getUrlBasedOnModuleNom();
  }

  private getUrlBasedOnModuleNom(): string {
    let appName: string = window["env"].appName;
    let urlBase: string;
    if (appName == "infosante") {
      urlBase = window["env"].urlSante + '/api/fiches-appel/';
    }
    if (appName == "infosocial") {
      urlBase = window["env"].urlInfoSocial + '/api/fiches-appel/';
    }
    return urlBase;
  }

  /**
   * Sauvegarde le chrono d'une fiche d'appel sans attendre le retour (sendBeacon).
   * @param ficheAppelChronoDto 
   */
  private saveChrono(): void {
    if (this.isStopped()) {
      const json = JSON.stringify(this.ficheAppelChronoDto);
      const url: string = this.urlFichesAppel + this.ficheAppelChronoDto.idFicheAppel + "/durees";

      // Création d'un blob pour permettre l'envoie de données json.
      const blob = new Blob([json], { type: 'application/json; charset=UTF-8' });

      // La sauvegarde doit se faire à l'aide de sendBeacon, sinon lors d'un appel http standard,
      // la requête est annulée à la destruction de l'appelant.
      // ATTENTION, sendBeacon effectue un POST
      navigator.sendBeacon(url, blob);

      // Vide le chrono après sauvegarde
      this.ficheAppelChronoDto = new FicheAppelChronoDTO();
    }
  }

  /**
   * Observable qui sauvegarde le chrono dans la BD.
   */
  private saveChrono$(): Observable<void> {
    // Vérifie si le chrono est arrêté
    if (this.isStopped()) {
      const url: string = this.urlFichesAppel + this.ficheAppelChronoDto.idFicheAppel + "/durees";
      return this.http.post<void>(url, this.ficheAppelChronoDto).pipe(
        map(() => {
          // Vide le chrono après sauvegarde
          this.ficheAppelChronoDto = null;
          return void 0;
        }));
    } else {
      console.warn("Chrono non valide pour sauvegarde");
      return EMPTY;
    }
  }

  /**
   * Vérifie si le chrono est actif.
   * @returns 
   */
  isRunning(): boolean {
    return !!this.ficheAppelChronoDto?.idFicheAppel &&
      !!this.ficheAppelChronoDto?.dateDebut &&
      !this.ficheAppelChronoDto?.dateFin;
  }

  /**
   * Vérifie si le chrono est arrêté.
   * @returns 
   */
  isStopped(): boolean {
    return !!this.ficheAppelChronoDto?.idFicheAppel &&
      !!this.ficheAppelChronoDto?.dateDebut &&
      !!this.ficheAppelChronoDto?.dateFin;
  }

  /**
   * Retourne le FicheAppelChronoDTO en cours.
   * @returns FicheAppelChronoDTO
   */
  getDTO(): FicheAppelChronoDTO {
    return this.ficheAppelChronoDto;
  }

  /**
   * Retourne la durée du chrono. Retourne 0 si l'état du chrono ne permet pas de calculer la durée.
   * @returns durée en secondes
   */
  getDuree(): number {
    let duree: number = 0;
    if (this.isRunning()) {
      duree = DateUtils.calculerNbSecondesBetween(this.ficheAppelChronoDto.dateDebut, new Date());
    } else if (this.isStopped()) {
      duree = DateUtils.calculerNbSecondesBetween(this.ficheAppelChronoDto.dateDebut, this.ficheAppelChronoDto.dateFin);
    }
    return duree;
  }

  /**
   * Initialise et démarre le chrono.
   * Sauvegarde le chrono est en cours d'exécution s'il y a lieu.
   * @param idFicheAppel identifiant de la fiche d'appel
   */
  startChrono(idFicheAppel: number): void {
    // Si un chrono est en cours d'exécution, on le sauvegarde
    if (this.isRunning()) {
      this.stopAndSaveChrono();
    }

    // Initialise un nouveau chrono pour la fiche d'appel
    this.ficheAppelChronoDto = new FicheAppelChronoDTO();
    this.ficheAppelChronoDto.idFicheAppel = idFicheAppel;
    this.ficheAppelChronoDto.dateDebut = new Date();

    const connectedUser: User = AuthenticationUtils.getUserFromStorage();
    this.ficheAppelChronoDto.idOrganismes = connectedUser.idOrganismeCourant;
    this.ficheAppelChronoDto.usernameIntervenant = connectedUser.name;

    this.startChronoSubj.next(this.ficheAppelChronoDto);
  }

  /**
   * Stoppe le chrono.
   */
  private stopChrono(): void {
    // Arrête le chrono.
    this.ficheAppelChronoDto.dateFin = new Date();
  }

  /**
   * Stoppe le chrono et le sauvegarde dans la BD.
   */
  stopAndSaveChrono(): void {
    if (this.isRunning()) {
      // Arrête le chrono.
      this.stopChrono();

      // Sauvegarde le chrono
      this.saveChrono();
    }
  }

  /**
   * Observable qui stoppe le chrono et le sauvegarde dans la BD.
   */
  stopAndSaveChrono$(): Observable<void> {
    if (this.isRunning()) {
      // Arrête le chrono.
      this.stopChrono();

      // Sauvegarde le chrono
      return this.saveChrono$();
    } else {
      return of(void 0);
    }
  }

  /**
   * Notifie un observateur que le chrono est démarré.
   * @returns FicheAppelChronoDTO démarré
   */
  onStartChrono(): Observable<FicheAppelChronoDTO> {
    return this.startChronoSubj.asObservable();
  }
}
