import { TestBed } from '@angular/core/testing';

import { GraphQueryService } from './graph-query.service';

describe('GraphQueryService', () => {
  let service: GraphQueryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GraphQueryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
