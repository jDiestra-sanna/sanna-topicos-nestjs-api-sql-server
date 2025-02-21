import { Injectable } from "@nestjs/common";
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

@Injectable()
export class TotpService {
  generateSecret() {
    return speakeasy.generateSecret({ length: 20 });
  }

  generateQRCode(secret: string, label: string): Promise<string> {
    const otpAuthUrl = speakeasy.otpauthURL({
      secret,
      label,
      encoding: 'base32',
    });
    return qrcode.toDataURL(otpAuthUrl);
  }

  verifyToken(secret: string, token: string) {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
    });
  }
}