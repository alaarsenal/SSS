import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VerificateurChangmentService {

  public originalData: any;

  public data: any;

  public beforeUnLoad = ()=>{};

  constructor() { }

  public isExisteChangements(): boolean {
    let currentData = JSON.stringify(this.data);
    return !(currentData === this.originalData);
  }

}
