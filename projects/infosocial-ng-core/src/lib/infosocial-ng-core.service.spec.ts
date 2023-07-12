import { TestBed } from '@angular/core/testing';

import { InfosocialNgCoreService } from './infosocial-ng-core.service';

describe('InfosocialNgCoreService', () => {
  let service: InfosocialNgCoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InfosocialNgCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
