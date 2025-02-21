import { IsInt } from 'class-validator';
import { UserExists } from 'src/modules/users/decorators/user-exists.decorator';

export class CreateEmergencyNotificationDto {
  @IsInt()
  @UserExists({ message: 'Usuario no existe' })
  user_id: number;
}
