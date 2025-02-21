import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { SettingsService } from 'src/modules/settings/settings.service';

@Injectable()
export class MailsService {
  private setting: Record<string, any>;

  constructor(
    private readonly mailerService: MailerService,
    private readonly settingsService: SettingsService,
  ) {
    this.init();
  }

  async init() {
    this.setting = await this.settingsService.getMappedToOne();
  }

  async sendRecoverPassword(name: string, email: string, token: string) {
    let url = `${process.env.URL_WEB}/recover-password/${token}`;
    
    try {
      this.mailerService.sendMail({
        to: email,
        from: process.env.MAIL_SENDER,
        subject: `Recuperar contraseña en ${this.setting.brand}`,
        template: 'base.template.ejs',
        context: {
          setting: this.setting,
          contentFile: 'recover.template.ejs',
          url,
          name,
        },
      });

      return true;
    } catch (error) {
      return false;
    }
  }
}
