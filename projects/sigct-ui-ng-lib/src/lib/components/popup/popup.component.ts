import { Component, OnInit, EventEmitter, Output, ViewChild, TemplateRef, Input, OnDestroy } from '@angular/core';
import { MatDialogConfig, MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

@Component({
  selector: 'msss-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.css']
})
export class PopupComponent implements OnInit, OnDestroy {
  private subscription: Subscription = new Subscription();

  @ViewChild('popupContainer', { static: true })
  popupContainer: TemplateRef<any>;

  @Input()
  set openPopup(value: boolean) {
    if (value) {
      this.openDialog();
    }
  }

  @Input()
  buttonCloseLabel: string = "Fermer";

  @Input()
  buttonCloseTitle: string = "Fermer";

  @Input()
  contentHeight: string = "200px";

  @Output()
  closedEvent = new EventEmitter<void>();

  constructor(
    private dialog: MatDialog,) { }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(this.popupContainer, this.getDialogConfig());
    this.subscription.add(
      dialogRef.afterClosed().subscribe(() => {
        this.closedEvent.emit();
      })
    );
  }

  private getDialogConfig(): MatDialogConfig {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.restoreFocus = true;
    if (window.innerWidth > 1440) {
      dialogConfig.width = "30vw";
      dialogConfig.maxWidth = "30vw";
      dialogConfig.height = this.contentHeight;
    } else {
      dialogConfig.width = "50vw";
      dialogConfig.maxWidth = "50vw";
      dialogConfig.panelClass = "popup-container"
    }
    return dialogConfig
  }

}
