import { TestBed } from '@angular/core/testing';

import { UsagerNgCoreService } from './usager-ng-core.service';

describe('UsagerNgCoreService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: UsagerNgCoreService = TestBed.get(UsagerNgCoreService);
    expect(service).toBeTruthy();
  });
});
