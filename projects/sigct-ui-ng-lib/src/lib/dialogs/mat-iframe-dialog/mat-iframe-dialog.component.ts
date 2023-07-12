import { HostListener, Inject, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SafeResourceUrl } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

export interface IsiswHistoData {
  url: SafeResourceUrl;
}

@Component({
  selector: 'material-iframe-dialog',
  templateUrl: './mat-iframe-dialog.component.html',
  styleUrls: ['./mat-iframe-dialog.component.css'],
})
export class MatIframeDialogComponent implements OnInit {
  url: SafeResourceUrl;

  constructor(
    public dialogRef: MatDialogRef<MatIframeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IsiswHistoData,
    public translateService: TranslateService) {
  }

  ngOnInit(): void {
    this.url = this.data.url;
  }

  close(): void {
    this.dialogRef.close(true);
  }

  @HostListener('window:message', ['$event']) onPostMessage(event) {
    //console.dir(event);
    // if (event.origin != "http://localhost:4200") {
    //   return false;
    // }

    if (event.data == "close") {
      this.close();
    }
  }
}