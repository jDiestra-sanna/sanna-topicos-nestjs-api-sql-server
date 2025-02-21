import { IsString, Matches } from 'class-validator';

export class ResetPasswordDto {
  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d]{8,}$/, {
    message:
      'Contraseña solo letras y numeros, minimo: 8 caracteres, 1 letra minuscula, 1 letra mayuscula y 1 numero ',
  })
  password: string;

  @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z\d]{8,}$/, {
    message:
      'Contraseña solo letras y numeros, minimo: 8 caracteres, 1 letra minuscula, 1 letra mayuscula y 1 numero ',
  })
  repeat_password: string;
}
