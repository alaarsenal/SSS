import { Injectable } from '@angular/core';
import CollectionUtils from 'projects/sigct-service-ng-lib/src/lib/utils/collection-utils';
import { Subject, Observable } from 'rxjs';

export enum ConsultationRouterState {
  CONSULTATION_FICHE_WRAPPER,
  RELANCE_WRAPPER,
  NOTE_COMPLEMENTAIRE_WRAPPER,
}

export interface StateStorage {
  state: ConsultationRouterState;
  idFicheAppel: number;
}

@Injectable({
  providedIn: 'root'
})
export class ConsultationContainerStateService {

  /**
   * Ces éléments ne doivent être accessible que par cette class
   * Toute autre accès doit passer par les méthodes appropriées
   */
  private stateStorages: StateStorage[];
  private state: ConsultationRouterState;

  /**
   * Utiliser pour distinguer les urls de chaque interface
   * liée à la consultation. Comme le routing n'est pas utilisé.
   * Example d'utilisation: aide en ligne.
    */
  private suffixUrlConsultationSubject: Subject<string> = new Subject();

  constructor() { }

  changeState(idFicheAppel: number, newState?: ConsultationRouterState): void {
    if (!idFicheAppel) {
      throw new Error("The Fiche Appel id can't be null.");
    }
    if (newState == null || newState == undefined) {
      newState = ConsultationRouterState.CONSULTATION_FICHE_WRAPPER;
    }
    this.state = newState;
    const stateStorage = { state: newState, idFicheAppel: idFicheAppel };
    if (CollectionUtils.isBlank(this.stateStorages)) {
      this.stateStorages = [stateStorage];
    } else {
      let _stateStorage = this.stateStorages.find(item => item.idFicheAppel == idFicheAppel);
      if (_stateStorage) {
        _stateStorage.state = newState;
      } else {
        this.stateStorages.push(stateStorage);
      }
    }
    this.triggerSuffixUrlConsultationSubject();
  }

  changeStateIfNotExists(idFicheAppel: number, newState?: ConsultationRouterState): void {
    if (!idFicheAppel) {
      throw new Error("The Fiche Appel id can't be null.");
    }
    let _state = this.stateStorages?.find(item => item.idFicheAppel == idFicheAppel)?.state;
    if (_state == null || _state == undefined) {
      _state = newState;
    }
    this.changeState(idFicheAppel, _state);
  }

  get currentState(): ConsultationRouterState {
    return this.state;
  }

  triggerSuffixUrlConsultationSubject(): void {
    let suffixUrlConsultation: string;
    switch (this.state) {
      case ConsultationRouterState.NOTE_COMPLEMENTAIRE_WRAPPER:
        suffixUrlConsultation = '/notes';
        break;
      case ConsultationRouterState.RELANCE_WRAPPER:
        suffixUrlConsultation = '/relance';
        break;
      default:
        suffixUrlConsultation = '';
        break;
    }
    this.suffixUrlConsultationSubject.next(suffixUrlConsultation);
  }

  listenSuffixUrlConsultationSubject(): Observable<string> {
    return this.suffixUrlConsultationSubject.asObservable();
  }
}
