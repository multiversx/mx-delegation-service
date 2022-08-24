import { Test, TestingModule } from '@nestjs/testing';
import { DelegationService } from './delegation.service';

describe('DelegationService', () => {
  let service: DelegationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DelegationService],
    }).compile();

    service = module.get<DelegationService>(DelegationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

});
