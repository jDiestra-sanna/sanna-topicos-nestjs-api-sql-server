import { IsInt, Min } from 'class-validator';
import { UserExists } from '../decorators/user-exists.decorator';
import { CampusExists } from 'src/modules/campus/decorators/campus-exists.decorator';

export class NewUserAssignmentDto {
  @IsInt()
  @Min(1)
  @UserExists({ message: 'Usuario no existe' })
  user_id: number;

  @IsInt()
  @Min(1)
  @CampusExists({ message: 'Campus no existe' })
  campus_id: number;
}
