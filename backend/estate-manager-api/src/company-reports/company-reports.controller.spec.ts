import { Test, TestingModule } from '@nestjs/testing';
import { CompanyReportsController } from './company-reports.controller';

describe('CompanyReportsController', () => {
  let controller: CompanyReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyReportsController],
    }).compile();

    controller = module.get<CompanyReportsController>(CompanyReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
