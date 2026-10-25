
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { QueryTransactionsDto } from './dto/query-transactions.dto.js';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateTransactionDto) {
    if (dto.categoryId) {
      const category = await this.prisma.category.findFirst({
        where: {
          id: dto.categoryId,
          userId,
          type: dto.type,
        },
      });

      if (!category) {
        throw new BadRequestException(
          'La categoría no existe o no corresponde al tipo de movimiento',
        );
      }
    }

    return this.prisma.transaction.create({
      data: {
        amount: new Prisma.Decimal(dto.amount),
        type: dto.type,
        description: dto.description?.trim(),
        date: dto.date ? new Date(dto.date) : new Date(),
        userId,
        categoryId: dto.categoryId,
      },
      include: { category: true },
    });
  }

  async findAll(userId: string, query: QueryTransactionsDto) {
    const { from, to, type, categoryId, page, limit } = query;

    if (from && to && new Date(from) > new Date(to)) {
      throw new BadRequestException(
        'La fecha inicial no puede ser posterior a la fecha final',
      );
    }

    const where: Prisma.TransactionWhereInput = {
      userId,
      ...(type && { type }),
      ...(categoryId && { categoryId }),
      ...(from || to
        ? {
            date: {
              ...(from && { gte: new Date(from) }),
              ...(to && { lte: new Date(to) }),
            },
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async remove(userId: string, id: string) {
    const result = await this.prisma.transaction.deleteMany({
      where: { id, userId },
    });

    if (result.count === 0) {
      throw new NotFoundException('Transacción no encontrada');
    }

    return { message: 'Transacción eliminada correctamente' };
  }

  async monthlySummary(
    userId: string,
    year: number,
    month: number,
  ) {
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw new BadRequestException('El mes debe estar entre 1 y 12');
    }

    if (!Number.isInteger(year) || year < 2000 || year > 2200) {
      throw new BadRequestException('El año no es válido');
    }

    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));

    const [income, expenses] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          userId,
          type: TransactionType.INCOME,
          date: { gte: start, lt: end },
        },
        _sum: { amount: true },
      }),
      this.prisma.transaction.aggregate({
        where: {
          userId,
          type: TransactionType.EXPENSE,
          date: { gte: start, lt: end },
        },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = income._sum.amount ?? new Prisma.Decimal(0);
    const totalExpenses = expenses._sum.amount ?? new Prisma.Decimal(0);

    return {
      year,
      month,
      totalIncome: totalIncome.toString(),
      totalExpenses: totalExpenses.toString(),
      balance: totalIncome.minus(totalExpenses).toString(),
    };
  }
}
