import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsHexColor,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreateCategoryDto {
  @ApiProperty({
    example: 'Alimentación',
    description: 'Nombre de la categoría',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    enum: TransactionType,
    example: TransactionType.EXPENSE,
    description: 'Tipo de movimiento (INCOME o EXPENSE)',
  })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiPropertyOptional({
    example: '#F97316',
    description: 'Código de color hexadecimal para la UI',
    default: '#64748b',
  })
  @IsOptional()
  @IsHexColor()
  color?: string;
}
