import { IsNumber, IsString } from 'class-validator';
import { UserExists } from 'src/modules/users/decorators/user-exists.decorator';

export class CreateTokenDto {
  @IsNumber()
  @UserExists({ message: 'Usuario no existe' })
  user_id: number;

  @IsString()
  token: string;

  @IsString()
  date_expiration: string;
}
