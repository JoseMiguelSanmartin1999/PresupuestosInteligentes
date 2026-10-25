
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
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
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  categoryId: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(9999999999.99)
  amount: number;
}

export class ApproveBudgetDto {
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2200)
  year: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ApprovedCategoryBudgetDto)
  categories: ApprovedCategoryBudgetDto[];
}
