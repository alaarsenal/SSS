import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

export interface MessageData {
  message: string;
  titre: string;
  labelBouton?: string;
}

@Component({
  selector: 'material-ok-dialog',
  templateUrl: './mat-ok-dialog.component.html',
  styleUrls: ['./mat-ok-dialog.component.css'],
})
export class MatOkDialogComponent implements OnInit {
  titre: string;
  monMessage: string;
  labelBouton: string;

  constructor(
    public dialogRef: MatDialogRef<MatOkDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MessageData,
    public translateService: TranslateService) {

  }

  ngOnInit(): void {
    this.titre = this.translateService.instant(this.data?.titre ? this.data?.titre : "sigct.ss.modal.avertissement");

    if (this.data?.message) {
      this.monMessage = this.translateService.instant(this.data?.message);
    }

    if (this.data?.labelBouton) {
      this.labelBouton = this.translateService.instant(this.data?.labelBouton);
    } else {
      this.labelBouton = this.translateService.instant("button.fermer.label");
    }
  }

  close(): void {
    this.dialogRef.close(true);
  }
}