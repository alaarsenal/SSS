import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { SaisirParSystemePopupDataDTO } from "../../../models/saisir-par-systeme-popup-data-dto";
import { SaisirReferencePopupComponent } from "./saisir-reference-popup.component";

export class SaisirReferencePopupLauncher {


  static launch(dialog: MatDialog, data: SaisirParSystemePopupDataDTO) {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.restoreFocus = true;
    dialogConfig.width = "90vw";
    dialogConfig.maxWidth = "90vw";
    dialogConfig.height = "calc(100% - 120px)";

    dialogConfig.data = { data }

    const dialogRef = dialog.open(SaisirReferencePopupComponent, dialogConfig);
  }

}
