import { Module } from '@nestjs/common';
import { RemotoController } from './remoto.controller';
import { RemotoService } from './remoto.service';

@Module({
  controllers: [RemotoController],
  providers: [RemotoService],
})
export class RemotoModule {}
