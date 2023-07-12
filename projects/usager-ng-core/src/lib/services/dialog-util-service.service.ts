import { Injectable } from '@angular/core';
import { AlertStore } from 'projects/sigct-service-ng-lib/src/lib/alert/alert-store';
import { Store } from 'projects/sigct-service-ng-lib/src/lib/store/abstract-store';






@Injectable({
  providedIn: 'root'
})
export class DialogUtilServiceService {

  public dialogOpenedFlag = false;

  constructor(private alertStore: AlertStore) { }

  public informeOpenDialog(){
    this.dialogOpenedFlag = true;
    this.alertStore.resetAlert();
  }

  public informeCloseDialog(){
    this.dialogOpenedFlag = false;
    this.alertStore.resetAlert();
  }

  public get isDialogOpened() : boolean{
    return this.dialogOpenedFlag;
  }

}
