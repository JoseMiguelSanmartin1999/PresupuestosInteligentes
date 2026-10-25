
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
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(9999999999.99)
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  categoryId?: string;
}

export class GenerateBudgetDto {
  // Si no se proporciona, se utilizará el promedio
  // de ingresos de los últimos tres meses completos.
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(9999999999.99)
  monthlyIncome?: number;

  // Porcentaje del ingreso que se desea ahorrar.
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(80)
  savingsGoalPercent = 10;

  // Gastos fijos que el usuario conoce de antemano.
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FixedExpenseDto)
  fixedExpenses: FixedExpenseDto[] = [];
}
