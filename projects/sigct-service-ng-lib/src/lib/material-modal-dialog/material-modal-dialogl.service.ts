import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatConfirmationDialogComponent } from 'projects/sigct-service-ng-lib/src/lib/material-modal-dialog/mat-confirmation-dialog/mat-confirmation-dialog.component';
import { MatOkDialogComponent, MessageData } from 'projects/sigct-service-ng-lib/src/lib/material-modal-dialog/mat-ok-dialog/mat-ok-dialog.component';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class MaterialModalDialogService {
  private okDialogRef: MatDialogRef<MatOkDialogComponent>;

  constructor(private matDialog: MatDialog) {
  }

  closeOpenedOkPopup(): void {
    this.okDialogRef?.close();
  }

  /**
   * Affiche un message de confirmation dans un popup modal. Retourne true si l'utilisateur confirme.
   * @param msg message à afficher dans le popup
   * @param height hauteur du popup 200px par défaut 
   * @param width largeur du popup 600px par défaut
   */
  popupConfirmer(msg: string, height: string = "200px", width: string = "600px"): Observable<boolean> {

    const matDialogConfig = new MatDialogConfig();

    matDialogConfig.disableClose = true;
    matDialogConfig.autoFocus = false;
    matDialogConfig.restoreFocus = false;

    matDialogConfig.width = width;
    matDialogConfig.maxWidth = "800px";
    matDialogConfig.height = height;
    matDialogConfig.maxHeight = "500px";
    matDialogConfig.panelClass = "noPadding";

    matDialogConfig.data = {
      message: msg
    };

    const dialogRef = this.matDialog.open(MatConfirmationDialogComponent, matDialogConfig);

    return dialogRef.afterClosed().pipe(map((reponse: boolean) => {
      return reponse;
    }));
  }

  /**
   * Affiche un message d'avertissement dans un popup modal.
   * @param msg message à afficher dans le popup
   * @param height hauteur du popup 200px par défaut 
   * @param width largeur du popup 600px par défaut
   * @param labelBouton libellé du bouton de fermeture
   */
  popupAvertissement(msg: string, height: string = "200px", width: string = "600px", labelBouton: string = null): Observable<boolean> {
    return this.popup("sigct.ss.modal.avertissement", msg, height, width, labelBouton);
  }

  /**
   * Affiche un message d'erreur dans un popup modal.
   * @param msg message à afficher dans le popup
   * @param height hauteur du popup 200px par défaut 
   * @param width largeur du popup 600px par défaut
   */
  popupErreur(msg: string, height: string = "200px", width: string = "600px"): Observable<boolean> {
    return this.popup("sigct.ss.modal.erreur", msg, height, width);
  }

  /**
   * Affiche un message dans un popup modal.
   * @param msg message à afficher dans le popup
   * @param height hauteur du popup 200px par défaut 
   * @param width largeur du popup 600px par défaut
   * @param labelBouton libellé du bouton de fermeture
   */
  private popup(titre: string, msg: string, height: string, width: string, labelBouton: string = null): Observable<boolean> {
    const matDialogConfig = new MatDialogConfig();

    matDialogConfig.disableClose = true;
    matDialogConfig.autoFocus = true;
    matDialogConfig.restoreFocus = true;

    matDialogConfig.width = width;
    matDialogConfig.maxWidth = "800px";
    matDialogConfig.height = height;
    matDialogConfig.maxHeight = "500px";
    matDialogConfig.panelClass = "noPadding";

    matDialogConfig.data = <MessageData>{
      message: msg,
      titre: titre,
      labelBouton: labelBouton
    };

    this.okDialogRef = this.matDialog.open(MatOkDialogComponent, matDialogConfig);

    return this.okDialogRef.afterClosed().pipe(map((reponse: boolean) => {
      return reponse;
    }));
  }
}
