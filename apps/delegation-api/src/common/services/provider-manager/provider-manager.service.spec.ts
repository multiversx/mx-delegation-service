import { Test, TestingModule } from '@nestjs/testing';
import { ProviderManagerService } from './provider-manager.service';

describe('ProviderManagerService', () => {
  let service: ProviderManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProviderManagerService],
    }).compile();

    service = module.get<ProviderManagerService>(ProviderManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
