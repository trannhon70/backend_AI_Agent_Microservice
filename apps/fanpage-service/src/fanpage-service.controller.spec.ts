import { Test, TestingModule } from '@nestjs/testing';
import { FanpageServiceController } from './fanpage-service.controller';
import { FanpageServiceService } from './fanpage-service.service';

describe('FanpageServiceController', () => {
  let fanpageServiceController: FanpageServiceController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [FanpageServiceController],
      providers: [FanpageServiceService],
    }).compile();

    fanpageServiceController = app.get<FanpageServiceController>(FanpageServiceController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(fanpageServiceController.getHello()).toBe('Hello World!');
    });
  });
});
