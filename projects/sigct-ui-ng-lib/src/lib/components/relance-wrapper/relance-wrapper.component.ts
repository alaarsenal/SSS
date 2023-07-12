import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { MaterialModalDialogService } from 'projects/sigct-service-ng-lib/src/lib/material-modal-dialog/material-modal-dialogl.service';
import { Subscription } from 'rxjs';
import { RelanceComponent } from '../relance/relance.component';

@Component({
  selector: 'app-relance-wrapper',
  templateUrl: './relance-wrapper.component.html',
  styleUrls: ['./relance-wrapper.component.css']
})
export class RelanceWrapperComponent implements OnInit {

  @ViewChild('appRelance', { static: true })
  appRelance: RelanceComponent;

  @Output()
  relanceReturnEvent = new EventEmitter();

  @Input()
  domaine: string;

  @Input()
  idFicheAppel: number;

  private subscriptions: Subscription = new Subscription();

  constructor(
    private materialModalDialogService: MaterialModalDialogService) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onRelanceCancelEvent(): void {
    if (!this.appRelance.isFormVide()) {
      // Les informations saisies seront perdues. Voulez-vous continuer?
      this.subscriptions.add(
        this.materialModalDialogService.popupConfirmer("ss-iu-a00004").subscribe(
          (confirm: boolean) => {
            if (confirm) {
              this.appRelance.resetForm(this.idFicheAppel);
            }
          }
        )
      );
    }
  }

  onRelanceReturnEvent(): void {
    if (!this.appRelance.isFormVide()) {
      // Les informations saisies seront perdues. Voulez-vous continuer?
      this.subscriptions.add(
        this.materialModalDialogService.popupConfirmer("ss-iu-a00004").subscribe(
          (confirm: boolean) => {
            if (confirm) {
              this.relanceReturnEvent.emit();
            }
          }
        )
      );
    } else {
      this.relanceReturnEvent.emit();
    }
  }

  canLeavePage(): boolean {
    return this.appRelance?.isFormVide();
  }
}
