import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { MailsService } from './mails.service';
import { SettingsModule } from 'src/modules/settings/settings.module';

@Module({
  imports: [
    SettingsModule,
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        transport: `smtps://${configService.get('MAIL_USER')}:${configService.get('MAIL_PASS')}@${configService.get('MAIL_HOST')}`,
        defaults: {
          from: '"nest-modules" <modules@nestjs.com>',
        },
        template: {
          dir: join(__dirname, '..', '..', 'src/mails/templates'),
          adapter: new EjsAdapter({ inlineCssEnabled: true }),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [MailsService],
  exports: [MailsService],
})
export class MailsModule {}
