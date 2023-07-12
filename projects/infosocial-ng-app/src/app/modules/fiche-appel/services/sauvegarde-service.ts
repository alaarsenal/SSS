import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SauvegarderService {
  private _save = new Subject();
  save$ = this._save.asObservable();

  save() {
    this._save.next();
  }
}
