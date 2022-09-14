import { TestBed } from '@angular/core/testing';

import { AssertapiServerService } from './assertapi-server.service';

describe('AssertapiServerService', () => {
  let service: AssertapiServerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AssertapiServerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
