import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ApprovedCategoryBudgetDto {
  @ApiProperty({
    example: 'cmvobefa90001v3x40z39pobf',
    description: 'ID de la categoría a presupuestar',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  categoryId: string;

  @ApiProperty({
    example: 200,
    description: 'Límite máximo de gasto aprobado para el mes',
    minimum: 0.01,
  })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(9999999999.99)
  amount: number;
}

export class ApproveBudgetDto {
  @ApiProperty({
    example: 2026,
    description: 'Año del periodo a presupuestar',
    minimum: 2000,
    maximum: 2200,
  })
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2200)
  year: number;

  @ApiProperty({
    example: 10,
    description: 'Mes del periodo a presupuestar (1 al 12)',
    minimum: 1,
    maximum: 12,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({
    type: [ApprovedCategoryBudgetDto],
    description: 'Lista de categorías con sus límites asignados',
    example: [
      { categoryId: 'cmvobefa90001v3x40z39pobf', amount: 200 },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ApprovedCategoryBudgetDto)
  categories: ApprovedCategoryBudgetDto[];
}
