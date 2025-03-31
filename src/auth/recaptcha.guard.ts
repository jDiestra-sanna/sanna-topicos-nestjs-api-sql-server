import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class RecaptchaGuard implements CanActivate {
  constructor(private readonly httpService: HttpService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const { body } = context.switchToHttp().getRequest();
    
    if (process.env.NODE_ENV !== 'production') return true;
    
    const { data } = await this.httpService.axiosRef.post(
      `https://www.google.com/recaptcha/api/siteverify?response=${body.token_recaptcha}&secret=${process.env.RECAPTCHA_SECRET_KEY}`,
    );

    if (!data.success) {
      throw new BadRequestException('Recaptcha invalido');
    }

    return true;
  }
}
