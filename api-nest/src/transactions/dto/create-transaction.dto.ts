import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreateTransactionDto {
  @ApiProperty({
    example: 45.5,
    description: 'Importe monetario de la transacción',
    minimum: 0.01,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(9999999999.99)
  amount: number;

  @ApiProperty({
    enum: TransactionType,
    example: TransactionType.EXPENSE,
    description: 'Tipo de movimiento (INCOME o EXPENSE)',
  })
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiPropertyOptional({
    example: 'Almuerzo con compañeros de trabajo',
    description: 'Descripción o concepto opcional del movimiento',
    maxLength: 250,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(250)
  description?: string;

  @ApiPropertyOptional({
    example: '2026-10-25T14:30:00.000Z',
    description: 'Fecha en formato ISO 8601 (por defecto fecha actual)',
  })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({
    example: 'cmvobefa90001v3x40z39pobf',
    description: 'ID de la categoría a la que pertenece la transacción',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  categoryId?: string;
}
