import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'Jose Sanmartin',
    description: 'Nombre completo del usuario',
    minLength: 2,
    maxLength: 80,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @ApiProperty({
    example: 'demo.presupuestos@example.com',
    description: 'Correo electrónico único',
  })
  @IsEmail()
  @MaxLength(254)
  email: string;

  @ApiProperty({
    example: 'PruebaSegura123!',
    description: 'Contraseña segura (mínimo 10 caracteres)',
    minLength: 10,
    maxLength: 72,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(72)
  password: string;
}