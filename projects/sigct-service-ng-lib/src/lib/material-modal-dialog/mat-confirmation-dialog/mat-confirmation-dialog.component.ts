import { Inject, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

export interface MessageData {
  message: string;
}

@Component({
  selector: 'material-confirmation-dialog',
  templateUrl: './mat-confirmation-dialog.component.html',
  styleUrls: ['./mat-confirmation-dialog.component.css'],
})
export class MatConfirmationDialogComponent implements OnInit {
  titre: string;
  monMessage: string;

  constructor(
    public dialogRef: MatDialogRef<MatConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: MessageData,
    public translateService: TranslateService) {

  }

  ngOnInit(): void {
    this.titre = this.translateService.instant("sigct.ss.modal.confirmation");

    if (this.data?.message) {
      this.monMessage = this.translateService.instant(this.data?.message);
    }
  }

  onOuiClick(): void {
    this.dialogRef.close(true);
  }
  
  onNonClick(): void {
    this.dialogRef.close(false);
  }
}