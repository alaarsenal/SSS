import { Store } from 'projects/sigct-service-ng-lib/src/lib/store/abstract-store';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
  })
export class AppContextStore extends Store<AppContext> {
    constructor() {
        super(new Array<AppContext>());
      }

    setvalue(key: string, value: any) {
     let appcontext : AppContext = this._state$.getValue();
     appcontext[key] = value;
     this._state$.next(appcontext);
    }
}

export interface AppContext {
    [key: string]: any;  
}


