import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { MaterialModalDialogService } from 'projects/sigct-service-ng-lib/src/lib/material-modal-dialog/material-modal-dialogl.service';
import { Observable } from 'rxjs';

export interface HasIsDirty {
  isDirty(): Observable<boolean> | boolean;
}






@Injectable({
  providedIn: 'root'
})
/**
 * Guard permettant de s'assure que la sauvegarde automatique du composant est terminée avant de poursuivre la navigation.
 */
export class AjouterNoteComplementaireGuard implements CanDeactivate<HasIsDirty> {
  
  constructor(private materialModalDialogService: MaterialModalDialogService) {
  }

  canDeactivate(component: HasIsDirty): Observable<boolean> | boolean {
    if (component.isDirty()) {
      // Les informations saisies seront perdues. Voulez-vous continuer?
      return this.materialModalDialogService.popupConfirmer("ss-iu-a00004");
    } else {
      return true;
    }
  }

}
