import { Test, TestingModule } from '@nestjs/testing';
import { DailyReportService } from './daily-report.service';

describe('DailyReportService', () => {
  let service: DailyReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DailyReportService],
    }).compile();

    service = module.get<DailyReportService>(DailyReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
