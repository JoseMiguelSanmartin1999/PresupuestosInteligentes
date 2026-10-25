
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { GenerateBudgetDto } from './dto/generate-budget.dto.js';
import { ApproveBudgetDto } from './dto/approve-budget.dto.js';
import { BudgetsService } from './budgets.service.js';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetsController {
  constructor(
    private readonly budgetsService: BudgetsService,
  ) {}

  @Post('generate')
  generate(
    @Req() req: AuthenticatedRequest,
    @Body() dto: GenerateBudgetDto,
  ) {
    return this.budgetsService.generate(
      req.user.userId,
      dto,
    );
  }

  @Post('approve')
  approve(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ApproveBudgetDto,
  ) {
    return this.budgetsService.approve(
      req.user.userId,
      dto,
    );
  }
  
@Get(':year/:month')
getProgress(
  @Req() req: AuthenticatedRequest,
  @Param('year', ParseIntPipe) year: number,
  @Param('month', ParseIntPipe) month: number,
) {
  return this.budgetsService.getProgress(
    req.user.userId,
    year,
    month,
  );
}

}
