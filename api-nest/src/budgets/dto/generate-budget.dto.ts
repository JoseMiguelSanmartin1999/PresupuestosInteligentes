import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class FixedExpenseDto {
  @ApiProperty({
    example: 'Arriendo',
    description: 'Nombre del gasto fijo obligatorio',
    minLength: 2,
    maxLength: 80,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @ApiProperty({
    example: 300,
    description: 'Monto del gasto fijo',
    minimum: 0.01,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(9999999999.99)
  amount: number;

  @ApiPropertyOptional({
    example: 'cmvobefa90001v3x40z39pobf',
    description: 'ID opcional de categoría asociada',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  categoryId?: string;
}

export class GenerateBudgetDto {
  @ApiPropertyOptional({
    example: 1200,
    description:
      'Ingreso mensual estimado. Si se omite, calcula el promedio de los últimos 3 meses',
    minimum: 0.01,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(9999999999.99)
  monthlyIncome?: number;

  @ApiPropertyOptional({
    example: 10,
    default: 10,
    description: 'Porcentaje de ahorro deseado (0 - 80%)',
    minimum: 0,
    maximum: 80,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(80)
  savingsGoalPercent = 10;

  @ApiPropertyOptional({
    type: [FixedExpenseDto],
    description: 'Lista de gastos fijos conocidos que se restarán antes del gasto variable',
    example: [
      { name: 'Arriendo', amount: 300 },
      { name: 'Servicios básicos', amount: 45 },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FixedExpenseDto)
  fixedExpenses: FixedExpenseDto[] = [];
}
