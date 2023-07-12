import { TestBed } from '@angular/core/testing';

import { SigctAutocompleteService } from './sigct-autocomplete.service';

describe('SigctAutocompleteService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SigctAutocompleteService = TestBed.get(SigctAutocompleteService);
    expect(service).toBeTruthy();
  });
});
