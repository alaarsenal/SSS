import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

export interface HasAutoSave {
  autoSaveBeforeRoute(): Observable<boolean> | Promise<boolean> | boolean;
}






@Injectable({
  providedIn: 'root'
})
/**
 * Service permettant de s'assure que la sauvegarde automatique du composant est terminée avant de poursuivre la navigation.
 */
export class AutoSaveGuardService implements CanDeactivate<HasAutoSave> {
  canDeactivate(component: HasAutoSave): Observable<boolean> | Promise<boolean> | boolean {
    return component.autoSaveBeforeRoute ? component.autoSaveBeforeRoute() : true;
  }

}
