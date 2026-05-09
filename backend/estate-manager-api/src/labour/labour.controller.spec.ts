import { Test, TestingModule } from '@nestjs/testing';
import { LabourController } from './labour.controller';

describe('LabourController', () => {
  let controller: LabourController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LabourController],
    }).compile();

    controller = module.get<LabourController>(LabourController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
