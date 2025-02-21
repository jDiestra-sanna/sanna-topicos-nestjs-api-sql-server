import { Module } from '@nestjs/common';
import { TotpService } from './totp.service';

@Module({
  imports: [],
  controllers: [],
  providers: [TotpService],
  exports: [TotpService],
})
export class TotpModule {}
