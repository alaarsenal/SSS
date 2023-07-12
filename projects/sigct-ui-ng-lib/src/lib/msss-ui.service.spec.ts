import { TestBed } from '@angular/core/testing';

import { MsssUiService } from './sigct-ui-ng-lib.service';

describe('MsssUiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MsssUiService = TestBed.get(MsssUiService);
    expect(service).toBeTruthy();
  });
});
