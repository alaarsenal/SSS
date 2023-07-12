import { Component, EventEmitter, Input, Output, HostListener } from '@angular/core';
import { HasAutoSave } from '../../../services/auto-save-guard.service';
import { Observable } from 'rxjs';




@Component({
  selector: 'sigct-base-usager-container',
  template: `Vide!`
})

/**
 * Conteneur de base de Usager qui permet de gérer l'apparition du bouton fermer.
 */
export abstract class BaseUsagerContainerComponent {

  @Input()
  boutonFermerDialogVisible: boolean = false;

  @Output()
  fermerDialog = new EventEmitter<void>();

  protected afficherPopUpUnload: boolean = false;

  /**
   * Lance un événement de fermeture.
   */
  actionFermer = (): void => {
    this.fermerDialog.emit();
  }

  /**
   * Lance la sauvegarde automatique lorsque le navigateur se ferme, ou qu'une navigation
   * externe s'effectue (ex: retour au portail).
   * @param event
   */
  @HostListener('window:beforeunload ', ['$event'])
  beforeUnload(event: any) {
    try {
      if (this.afficherPopUpUnload) {
        event.returnValue = "popup";
      } else {
        this.autoSaveBeforeUnload();
      }
    } finally {
      // Retourner "undefined" permet d'éviter l'affichage du message de confirmation par défaut du navigateur.
      // Chrome: "Les modifications que vous avez apportées ne seront peut-être pas enregistrées."
      // Le finally permet d'éviter l'apparition du message en cas d'erreur inattendue dans autoSaveBeforeUnload().

      return undefined;
    }
  }

  /**
   * Lorsqu'une navigation "externe" est enclenchée.
   * IMPORTANT: L'implémentation doit sauvegarder les données à l'aide de navigation.sendBeacon()
   */
  abstract autoSaveBeforeUnload(): void;

}
