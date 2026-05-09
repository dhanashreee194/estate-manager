import { Test, TestingModule } from '@nestjs/testing';
import { InstallmentsController } from './installments.controller';

describe('InstallmentsController', () => {
  let controller: InstallmentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InstallmentsController],
    }).compile();

    controller = module.get<InstallmentsController>(InstallmentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
