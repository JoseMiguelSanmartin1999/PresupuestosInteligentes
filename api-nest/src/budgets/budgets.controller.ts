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
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
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

@ApiTags('Budgets')
@ApiBearerAuth()
@Controller('budgets')
@UseGuards(JwtAuthGuard)
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post('generate')
  @ApiOperation({
    summary: 'Generar propuesta inteligente de presupuesto mensual',
    description:
      'Calcula topes sugeridos analizando 3 meses de historial o el ingreso estimado, descontando ahorro y gastos fijos.',
  })
  @ApiResponse({ status: 201, description: 'Propuesta de presupuesto generada' })
  @ApiResponse({ status: 400, description: 'Datos insuficientes o gastos fijos inválidos' })
  generate(
    @Req() req: AuthenticatedRequest,
    @Body() dto: GenerateBudgetDto,
  ) {
    return this.budgetsService.generate(req.user.userId, dto);
  }

  @Post('approve')
  @ApiOperation({
    summary: 'Aprobar y guardar el presupuesto mensual',
    description:
      'Guarda transaccionalmente los montos aprobados por categoría para el mes y año seleccionados.',
  })
  @ApiResponse({ status: 201, description: 'Presupuesto aprobado y registrado' })
  @ApiResponse({ status: 400, description: 'Categorías duplicadas o inválidas' })
  approve(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ApproveBudgetDto,
  ) {
    return this.budgetsService.approve(req.user.userId, dto);
  }

  @Get(':year/:month')
  @ApiOperation({
    summary: 'Monitorear ejecución del presupuesto en tiempo real',
    description:
      'Compara gastos reales contra el límite aprobado del mes y clasifica el estado en ON_TRACK, NEAR_LIMIT o EXCEEDED.',
  })
  @ApiResponse({ status: 200, description: 'Estado y porcentajes de cumplimiento del presupuesto' })
  getProgress(
    @Req() req: AuthenticatedRequest,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    return this.budgetsService.getProgress(req.user.userId, year, month);
  }
}
