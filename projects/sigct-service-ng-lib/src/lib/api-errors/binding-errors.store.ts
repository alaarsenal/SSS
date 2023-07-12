import { Injectable } from '@angular/core';
import { Store } from '../store/abstract-store';
import { BindingErrors } from './binding-errors';


@Injectable({
    providedIn: 'root'
  })
export class BindingErrorsStore extends Store<BindingErrors> {

    constructor () {
        super({});
      }
}