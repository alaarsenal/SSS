import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AlertComponent } from './alert/alert.component';
import { ModalComponent } from './modal-dialog/modal-dialog.component';


@NgModule({
  declarations: [ModalComponent, AlertComponent],
  imports: [
    CommonModule,
    RouterModule,
    RouterModule
  ],
  exports: [
    AlertComponent,
  ]
})
export class MsssServicesModule {
}
