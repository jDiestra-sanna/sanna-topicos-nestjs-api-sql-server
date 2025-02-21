import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserExists } from 'src/modules/users/decorators/user-exists.decorator';

export class CreateNotificationDto {
  @IsInt()
  @UserExists({ message: 'Usuario no existe' })
  user_id: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  body: string;

  @IsOptional()
  @IsString()
  data?: string;
}
