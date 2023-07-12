import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AppelApiService } from 'projects/infosante-ng-core/src/lib/services/appel-api.service';
import { GlasgowComponent } from '../glasgow/glasgow.component';

@Component({
  selector: 'app-link-glasgow',
  templateUrl: './link-glasgow.component.html',
  styleUrls: ['./link-glasgow.component.css']
})
export class LinkGlasgowComponent implements OnInit {

  @Input()
  id: string;

  @Input('link')
  link: string = 'Glasgow';


  @Output('dialogClosed')
  dialogClosedEvent: EventEmitter<string> = new EventEmitter<string>();

  isDialogOpened: boolean;

  @Input()
  isDisabled = false;

  constructor(
    private dialog: MatDialog,
    private appelApiService: AppelApiService,) { }

  ngOnInit(): void {
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(GlasgowComponent, this.getDialogConfig());
    dialogRef.afterOpened().subscribe(() => {
      this.isDialogOpened = true;
    });

  }

  private getDialogConfig(): MatDialogConfig {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.restoreFocus = true;

    if (window.innerWidth > 1440) {
      dialogConfig.width = "39vw";
      dialogConfig.maxWidth = "39vw";
      dialogConfig.height = "545px";
    } else {
      dialogConfig.width = "100vw";
      dialogConfig.maxWidth = "100vw";
      dialogConfig.height = "560px";
    }



    return dialogConfig
  }


}
