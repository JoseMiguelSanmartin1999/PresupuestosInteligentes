import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { TransactionsService } from './transactions.service.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { QueryTransactionsDto } from './dto/query-transactions.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string };
}

@ApiTags('Transactions')
@ApiBearerAuth()
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un movimiento (ingreso o gasto)' })
  @ApiResponse({ status: 201, description: 'Transacción creada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o categoría incompatible' })
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(req.user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar transacciones con filtros y paginación' })
  @ApiResponse({ status: 200, description: 'Listado paginado de transacciones' })
  findAll(
    @Req() req: AuthenticatedRequest,
    @Query() query: QueryTransactionsDto,
  ) {
    return this.transactionsService.findAll(req.user.userId, query);
  }

  @Get('summary/:year/:month')
  @ApiOperation({ summary: 'Obtener sumario mensual de ingresos, gastos y balance' })
  @ApiResponse({ status: 200, description: 'Totales calculados del periodo' })
  monthlySummary(
    @Req() req: AuthenticatedRequest,
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
  ) {
    return this.transactionsService.monthlySummary(
      req.user.userId,
      year,
      month,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar una transacción existente' })
  @ApiResponse({ status: 200, description: 'Transacción actualizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos o categoría incompatible' })
  @ApiResponse({ status: 404, description: 'Transacción no encontrada' })
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una transacción' })
  @ApiResponse({ status: 200, description: 'Transacción eliminada' })
  @ApiResponse({ status: 404, description: 'Transacción no encontrada' })
  remove(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.transactionsService.remove(req.user.userId, id);
  }
}
