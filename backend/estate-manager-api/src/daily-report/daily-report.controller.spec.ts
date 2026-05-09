import { Test, TestingModule } from '@nestjs/testing';
import { DailyReportController } from './daily-report.controller';

describe('DailyReportController', () => {
  let controller: DailyReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyReportController],
    }).compile();

    controller = module.get<DailyReportController>(DailyReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
