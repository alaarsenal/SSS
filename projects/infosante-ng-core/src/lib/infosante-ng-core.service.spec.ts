import { TestBed } from '@angular/core/testing';

import { InfosanteNgCoreService } from './infosante-ng-core.service';

describe('InfosanteNgCoreService', () => {
  let service: InfosanteNgCoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InfosanteNgCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
