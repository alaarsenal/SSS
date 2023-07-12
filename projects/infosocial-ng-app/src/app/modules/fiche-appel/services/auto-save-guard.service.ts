import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { isObservable, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface HasAutoSave {
  autoSaveBeforeRoute(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree;
}

@Injectable({
  providedIn: 'root'
})
/**
 * Service permettant de s'assurer que la sauvegarde automatique du composant est terminée avant de poursuivre la navigation.
 */
export class AutoSaveGuardService implements CanDeactivate<HasAutoSave> {
  canDeactivate(component: HasAutoSave,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    const response = component.autoSaveBeforeRoute ? component.autoSaveBeforeRoute() : true;

    if (isObservable(response)) {
      return response.pipe(
        map((value: boolean | UrlTree) => {
          // Un problème Angular survient lorsque canDeactivate retourne un UrlTree et tente d'atteindre une nouvelle route. 
          // canDeactivate est alors appelé en boucle. 
          // Le if suivant permet de sortir de cette boucle.
          // Réf: https://github.com/angular/angular/issues/31385
          if (value instanceof UrlTree && nextState.url == value.toString()) {
            return true;
          } else {
            return value;
          }
        })
      );
    } else {
      return response;
    }
  }

}