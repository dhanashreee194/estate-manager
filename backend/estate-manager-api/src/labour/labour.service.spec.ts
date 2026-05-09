import { Test, TestingModule } from '@nestjs/testing';
import { LabourService } from './labour.service';

describe('LabourService', () => {
  let service: LabourService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LabourService],
    }).compile();

    service = module.get<LabourService>(LabourService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
