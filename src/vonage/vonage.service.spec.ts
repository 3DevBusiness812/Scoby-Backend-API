import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { VonageService } from './vonage.service';

// jest.mock('Opentok');

describe('VonageService', () => {
  let service: VonageService;
  let config: { opentok: { API_KEY: string; API_SECRET: string } };

  beforeEach(async () => {
    config = {
      opentok: {
        API_KEY: 'vonageProjectId',
        API_SECRET: 'vonageApiSecret',
      }
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forFeature(() => config)],
      providers: [VonageService],
    }).compile();

    service = module.get<VonageService>(VonageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
