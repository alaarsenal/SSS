import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IAutoCompleteResponse, AutoCompleteResponse } from './sigct-autocomplete.object';




@Injectable({
  providedIn: 'root'
})
export class SigctAutocompleteService { 
  

  constructor(private http: HttpClient) { }

  search(url:string, term:string, filter: {name: string} = {name: ''}, page = 1): Observable<IAutoCompleteResponse> {
    
    if(!term)
      term = "*"

    return this.http.get<IAutoCompleteResponse>(url + "/" + term)
      .pipe(
        tap((response: IAutoCompleteResponse) => {
          response.results = response.results
            .map(response => new AutoCompleteResponse(response.id, response.name))
            // Not filtering in the server since in-memory-web-api has somewhat restricted api
            .filter(user => user.name.includes(filter.name))
  
          return response;
        })
        );
      }
    
  
}
