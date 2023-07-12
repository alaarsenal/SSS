import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpErrorHandler } from 'projects/sigct-service-ng-lib/src/lib/http/http-error-handler.service';
import { ReferenceDTO } from 'projects/sigct-service-ng-lib/src/lib/models/reference-dto';
import { Observable } from 'rxjs';


const CTX_REFERENCE: string = "/references";

const HTTP_OPTIONS = {
  headers: new HttpHeaders({
    "Content-Type": "application/json",
    Authorization: "my-auth-token"
  })
};

@Injectable({
  providedIn: "root"
})
export class RaccourciService {

  private urlBase: string;

  private ctxRaccourcis = '/raccourcis';

  private mapRaccourcis : Map<string, string> = new Map();

  constructor(
    private http: HttpClient,
    private httpErrorHandler: HttpErrorHandler) {

    this.httpErrorHandler.createHandleError('ConsultationService'); //Important pour instancier correctement le service
    this.urlBase = this.getUrlBasedOnModuleNom();

  }

  public populeRaccourcis(list: ReferenceDTO[]) {
    list.forEach(r => this.mapRaccourcis.set(r.nom.toLowerCase(), r.description));
  }

   //Extraction de la liste des raccourcis
   public getListeRaccourcis(): Observable<Object | ReferenceDTO[]> {
    return this.http.get(this.urlBase + CTX_REFERENCE + this.ctxRaccourcis);
  }

  private getUrlBasedOnModuleNom(): string {
    let appName: string = window["env"].appName;
    let urlBase: string;
    if (appName == "infosante") {
      urlBase = window["env"].urlSante + '/api';
    }
    if (appName == "infosocial") {
      urlBase = window["env"].urlInfoSocial + '/api';
    }
    return urlBase;
  }

  public getModule(): string {
    return window["env"].appName;
  }


  parseRaccousi(ev: KeyboardEvent): string {

      const inputObj: any = ev.composedPath()[0];
      if (!inputObj) {
        throw new Error("il n'a pas été possible d'identifier l'objet qui a déclenché l'événement.");
      }

      if (inputObj.value) {
        const cursorPosition: number = inputObj.selectionStart;
        const textTraite: string = inputObj.value.split("\n").join(" ");
        let key: string = textTraite.substring(0, cursorPosition);
        key = key.substring(key.lastIndexOf(" ")+1);

        let result: String  = this.mapRaccourcis.get(key.trim().toLocaleLowerCase());

        if (result) {
          result = result.trim();
          const multiligne: boolean = result.indexOf("\\n")>=0
          result = multiligne ? result.split("\\n").join(" \n") : result;
          const permitRemplacer: boolean = !multiligne ? true : (inputObj.type == 'textarea' ? true : false );

          if (permitRemplacer) {
            let textAvantRaccourci: string  = inputObj.value.substring(0, cursorPosition - key.length);
            let textApresRaccourci: string = inputObj.value.substring(cursorPosition);
            let textComplet: string = textAvantRaccourci?.concat(result.toString().concat(' ')).concat(textApresRaccourci);
            textComplet =  textComplet?.length > inputObj.maxLength ? textComplet.substring(0, inputObj.maxLength) : textComplet;
            inputObj.value = textComplet;
            let newCursorPosition: number = cursorPosition + result.length - key.length + 1;
            newCursorPosition = newCursorPosition > inputObj.maxLength ? inputObj.maxLength-1 : newCursorPosition;
            this.setCaretPosition(inputObj, newCursorPosition);
            return inputObj.value;
          }
        }
      }
      return null;
  }

  setCaretPosition(elem: any, caretPos: number) {
    if(elem != null) {
        if(elem.createTextRange) {
            var range = elem.createTextRange();
            range.move('character', caretPos);
            range.select();
        }
        else {
            if(elem.selectionStart) {
                elem.focus();
                elem.setSelectionRange(caretPos, caretPos);
            }
            else
                elem.focus();
        }
    }
  }

  /**
   * Retourne le raccourci correspondant à key
   * @param key 
   * @returns 
   */
   getRaccourci(key: string): string {
    let raccourci: string = null;
    if (key) {
      raccourci = this.mapRaccourcis.get(key.trim().toLowerCase());

      if (!raccourci) {
        raccourci = this.mapRaccourcis.get(key.trim().toUpperCase());
      }
    }
    return raccourci;
  }
}


