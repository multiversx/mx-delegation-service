import { Test, TestingModule } from '@nestjs/testing';
import { TransactionProcessorService } from './transaction-processor.service';

describe('TransactionProcessorService', () => {
  let service: TransactionProcessorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionProcessorService],
    }).compile();

    service = module.get<TransactionProcessorService>(TransactionProcessorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
