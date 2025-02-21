import { IsDateString, IsInt, IsString, Matches, Min } from 'class-validator';
import { CampusExists } from 'src/modules/campus/decorators/campus-exists.decorator';
import { SessionExists } from 'src/modules/sessions/decorators/session-exists.decorator';
import { UserExists } from 'src/modules/users/decorators/user-exists.decorator';

export class RegisterEntryTimeRequestDto {
  @IsDateString()
  day: string;

  @IsString()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/, {
    message: 'El formato de la hora debe ser HH:mm:ss',
  })
  entry_time: string;

  @IsInt()
  @CampusExists({ message: 'Campus no existe' })
  campus_id: number;
}

export class RegisterEntryTimeDto extends RegisterEntryTimeRequestDto {
  @IsInt()
  @Min(1)
  @UserExists({ message: 'Usuario no existe' })
  user_id: number;

  @IsInt()
  @SessionExists({ message: 'Sesion no existe' })
  session_id: number;
}
