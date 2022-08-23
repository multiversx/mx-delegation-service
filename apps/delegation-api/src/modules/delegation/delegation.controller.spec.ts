import { Test, TestingModule } from '@nestjs/testing';
import { DelegationController } from './delegation.controller';

describe('DelegationController', () => {
  let controller: DelegationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DelegationController],
    }).compile();

    controller = module.get<DelegationController>(DelegationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
