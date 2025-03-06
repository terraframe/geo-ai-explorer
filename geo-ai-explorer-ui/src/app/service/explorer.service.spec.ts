import { TestBed } from '@angular/core/testing';

import { ExplorerService as ExplorerService } from './explorer.service';

describe('GraphQueryService', () => {
  let service: ExplorerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExplorerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
