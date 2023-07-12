import { Component, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, finalize, switchMap, tap } from 'rxjs/operators';
import { AutoCompleteResponse } from './sigct-autocomplete.object';
import { SigctAutocompleteService } from './sigct-autocomplete.service';

@Component({
  selector: 'msss-sigct-autocomplete',
  templateUrl: './sigct-autocomplete.component.html',
  styleUrls: ['./sigct-autocomplete.component.css']
})
export class SigctAutocompleteComponent implements OnInit {
  filteredResult: AutoCompleteResponse[] = [];
  isLoading = false;
  toHighlight: string = '';
  
  constructor(private sigctAutocompleteService: SigctAutocompleteService) {}

  formControl = new FormControl();

  @Input()
  url:string;

  @Input("label")
  label: string;

  @Input("id")
  id: string;

  @Input("name")
  name: string;

  @Input("value")
  val : string;

  ngOnInit() {

    this.formControl
      .valueChanges
      .pipe(
        debounceTime(300),
        tap(() => this.isLoading = true),
        switchMap(
          value => this.sigctAutocompleteService.search(this.url, value, {name: value}, 1)
        .pipe(
          finalize(() => this.isLoading = false),
          )

        )
      )
      .subscribe(users => this.filteredResult = users.results);
  }

 

  displayFn(response: AutoCompleteResponse) {
    if (response) { return response.name; }
  }

}


