import { Module } from '@nestjs/common';
import { AidescribeService } from './aidescribe.service';
import { AidescribeController } from './aidescribe.controller';

@Module({
  controllers: [AidescribeController],
  providers: [AidescribeService],
})
export class AidescribeModule {}
