import { TestBed } from '@angular/core/testing';

import { TeamRosterService } from './team-roster.service';

describe('TeamRosterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TeamRosterService = TestBed.get(TeamRosterService);
    expect(service).toBeTruthy();
  });
});
