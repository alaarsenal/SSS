import { Injectable } from '@angular/core';



@Injectable({
    providedIn: 'root'
  })
export class ConfirmationDialogService {

    constructor() { }

    private modals: any[] = [];

    add(modal: any) {
        // add modal to array of active modals
        this.modals.push(modal);
    }

    remove(id: string) {
        // remove modal from array of active modals
        this.modals = this.modals.filter(x => x.id !== id);
    }

    open(id: string) {
        // open modal specified by id
        let modal: any = this.modals.filter(x => x.id === id)[0];
        modal.open();
    }

    /**
     * Affiche la fenêtre de confirmation dont l'identifiant est idDialog et met le focus
     * sur l'élément dont l'identifiant est idElemFocus.
     * @param idDialog identifiant de la fenêtre de dialogue
     * @param idElemFocus identifiant de l'élement recevant le focus
     */
    openAndFocus(idDialog: string, idElemFocus: string) {
        // open modal specified by id
        let modal: any = this.modals.filter(x => x.id === idDialog)[0];
        modal.openAndFocus(idElemFocus);
    }

    close(id: string) {
        // close modal specified by id
        let modal: any = this.modals.filter(x => x.id === id)[0];
        if (modal) {
          modal.close();
        }
    }

}
