import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'demo.presupuestos@example.com',
    description: 'Correo electrónico registrado',
  })
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({
    example: 'PruebaSegura123!',
    description: 'Contraseña del usuario',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(72)
  password: string;
}
