
import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { GenerateBudgetDto } from './dto/generate-budget.dto.js';
import { ApproveBudgetDto } from './dto/approve-budget.dto.js';

const roundMoney = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

@Injectable()
export class BudgetsService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(userId: string, dto: GenerateBudgetDto) {
    const now = new Date();

    // Tres meses completos anteriores al mes actual.
    const end = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      1,
    ));

    const start = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() - 3,
      1,
    ));

    const historyMonths = 3;

    // Validar las categorías asociadas a los gastos fijos.
    const fixedCategoryIds = [
      ...new Set(
        (dto.fixedExpenses ?? [])
          .map((expense) => expense.categoryId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    if (fixedCategoryIds.length > 0) {
      const categories = await this.prisma.category.findMany({
        where: {
          id: { in: fixedCategoryIds },
          userId,
          type: TransactionType.EXPENSE,
        },
        select: { id: true },
      });

      if (categories.length !== fixedCategoryIds.length) {
        throw new BadRequestException(
          'Una o más categorías de gastos fijos no existen o no son válidas',
        );
      }
    }

    // Utilizar el ingreso indicado o calcular su promedio histórico.
    let monthlyIncome: number;
    let incomeSource: 'USER_ESTIMATE' | 'HISTORICAL_AVERAGE';

    if (dto.monthlyIncome !== undefined) {
      monthlyIncome = roundMoney(dto.monthlyIncome);
      incomeSource = 'USER_ESTIMATE';
    } else {
      const income = await this.prisma.transaction.aggregate({
        where: {
          userId,
          type: TransactionType.INCOME,
          date: { gte: start, lt: end },
        },
        _sum: { amount: true },
      });

      const historicalIncome = Number(
        income._sum.amount ?? new Prisma.Decimal(0),
      );

      if (historicalIncome <= 0) {
        throw new BadRequestException(
          'Registra ingresos de los últimos tres meses o proporciona monthlyIncome para generar el presupuesto',
        );
      }

      monthlyIncome = roundMoney(
        historicalIncome / historyMonths,
      );
      incomeSource = 'HISTORICAL_AVERAGE';
    }

    const savingsGoalPercent = dto.savingsGoalPercent ?? 10;

    const savingsAmount = roundMoney(
      monthlyIncome * savingsGoalPercent / 100,
    );

    const fixedExpenses = (dto.fixedExpenses ?? []).map(
      (expense) => ({
        name: expense.name.trim(),
        categoryId: expense.categoryId ?? null,
        amount: roundMoney(expense.amount),
      }),
    );

    const fixedExpensesTotal = roundMoney(
      fixedExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0,
      ),
    );

    // Obtener gastos históricos agrupados por categoría.
    // Las categorías declaradas como gastos fijos no se duplican.
    const categoryFilter: Prisma.StringNullableFilter = {
      not: null,
    };

    if (fixedCategoryIds.length > 0) {
      categoryFilter.notIn = fixedCategoryIds;
    }

    const historicalGroups = await this.prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: TransactionType.EXPENSE,
        date: { gte: start, lt: end },
        categoryId: categoryFilter,
      },
      _sum: { amount: true },
    });

    const historicalCategoryIds = historicalGroups
      .map((group) => group.categoryId)
      .filter((id): id is string => id !== null);

    const categories = historicalCategoryIds.length
      ? await this.prisma.category.findMany({
          where: {
            id: { in: historicalCategoryIds },
            userId,
            type: TransactionType.EXPENSE,
          },
          select: { id: true, name: true },
        })
      : [];

    const categoryNames = new Map(
      categories.map((category) => [
        category.id,
        category.name,
      ]),
    );

    const historicalBudgets = historicalGroups
      .filter(
        (group) =>
          group.categoryId !== null &&
          categoryNames.has(group.categoryId),
      )
      .map((group) => ({
        categoryId: group.categoryId!,
        name: categoryNames.get(group.categoryId!)!,
        averageMonthlySpend: roundMoney(
          Number(group._sum.amount ?? 0) / historyMonths,
        ),
      }))
      .filter((item) => item.averageMonthlySpend > 0);

    const historicalTotal = roundMoney(
      historicalBudgets.reduce(
        (sum, item) => sum + item.averageMonthlySpend,
        0,
      ),
    );

    // Dinero disponible para gastos variables después del ahorro
    // y de los gastos fijos declarados.
    const variableCapacity = roundMoney(
      Math.max(
        0,
        monthlyIncome - savingsAmount - fixedExpensesTotal,
      ),
    );

    // Si el historial excede el límite disponible, reducir
    // proporcionalmente los límites de las categorías.
    const scale = historicalTotal > variableCapacity &&
      historicalTotal > 0
      ? variableCapacity / historicalTotal
      : 1;

    const proposedCategories = historicalBudgets.map((item) => ({
      categoryId: item.categoryId,
      name: item.name,
      averageMonthlySpend: item.averageMonthlySpend,
      proposedAmount: roundMoney(
        item.averageMonthlySpend * scale,
      ),
    }));

    const variableBudgetTotal = roundMoney(
      proposedCategories.reduce(
        (sum, item) => sum + item.proposedAmount,
        0,
      ),
    );

    const plannedTotal = roundMoney(
      savingsAmount + fixedExpensesTotal + variableBudgetTotal,
    );

    const remainingAmount = roundMoney(
      monthlyIncome - plannedTotal,
    );

    const warnings: string[] = [];

    if (historicalBudgets.length === 0) {
      warnings.push(
        'No hay gastos históricos categorizados suficientes. Registra gastos y asígnales categorías para mejorar las recomendaciones.',
      );
    }

    if (historicalTotal > variableCapacity) {
      warnings.push(
        'El gasto histórico supera el dinero disponible para gastos variables. Se han reducido proporcionalmente los límites sugeridos.',
      );
    }

    if (remainingAmount < 0) {
      warnings.push(
        'Los gastos fijos y la meta de ahorro superan el ingreso disponible. Debes revisar los importes antes de aprobar el presupuesto.',
      );
    }

    return {
      status: remainingAmount < 0 ? 'DEFICIT' : 'WITHIN_INCOME',
      period: {
        year: now.getUTCFullYear(),
        month: now.getUTCMonth() + 1,
        historyMonths,
        historyFrom: start.toISOString().slice(0, 10),
        historyTo: new Date(end.getTime() - 86400000)
          .toISOString()
          .slice(0, 10),
      },
      incomeSource,
      summary: {
        monthlyIncome: roundMoney(monthlyIncome),
        savingsGoalPercent,
        savingsAmount,
        fixedExpensesTotal,
        historicalVariableSpend: historicalTotal,
        variableBudgetTotal,
        plannedTotal,
        remainingAmount,
      },
      fixedExpenses,
      categories: proposedCategories,
      warnings,
      requiresReview: true,
    };
  }
  
  async approve(userId: string, dto: ApproveBudgetDto) {
  // Evitar repetir una categoría dentro de la misma aprobación.
  const categoryIds = dto.categories.map((item) => item.categoryId);

  if (new Set(categoryIds).size !== categoryIds.length) {
    throw new BadRequestException(
      'No puedes incluir la misma categoría más de una vez',
    );
  }

  // Comprobar que todas las categorías pertenecen al usuario
  // y son categorías de gastos.
  const validCategories = await this.prisma.category.findMany({
    where: {
      id: { in: categoryIds },
      userId,
      type: TransactionType.EXPENSE,
    },
    select: { id: true },
  });

  if (validCategories.length !== categoryIds.length) {
    throw new BadRequestException(
      'Una o más categorías no existen o no son categorías de gastos de tu usuario',
    );
  }

  // Guardar todo en una transacción: si algo falla, no se
  // debe guardar una aprobación incompleta.
  const savedBudgets = await this.prisma.$transaction(
    dto.categories.map((item) =>
      this.prisma.budget.upsert({
        where: {
          userId_categoryId_month_year: {
            userId,
            categoryId: item.categoryId,
            month: dto.month,
            year: dto.year,
          },
        },
        create: {
          userId,
          categoryId: item.categoryId,
          month: dto.month,
          year: dto.year,
          amount: new Prisma.Decimal(item.amount),
        },
        update: {
          amount: new Prisma.Decimal(item.amount),
        },
        include: {
          category: true,
        },
      }),
    ),
  );

  return {
    message: 'Presupuesto aprobado y guardado correctamente',
    period: {
      year: dto.year,
      month: dto.month,
    },
    count: savedBudgets.length,
    budgets: savedBudgets.map((budget) => ({
      id: budget.id,
      categoryId: budget.categoryId,
      category: budget.category.name,
      amount: budget.amount.toString(),
      month: budget.month,
      year: budget.year,
    })),
  };
}

async getProgress(userId: string, year: number, month: number) {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new BadRequestException('El mes debe estar entre 1 y 12');
  }

  if (!Number.isInteger(year) || year < 2000 || year > 2200) {
    throw new BadRequestException('El año no es válido');
  }

  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1));

  const budgets = await this.prisma.budget.findMany({
    where: { userId, year, month },
    include: { category: true },
    orderBy: { category: { name: 'asc' } },
  });

  const categoryIds = budgets.map((budget) => budget.categoryId);

  const expenseGroups = categoryIds.length > 0
    ? await this.prisma.transaction.groupBy({
        by: ['categoryId'],
        where: {
          userId,
          type: TransactionType.EXPENSE,
          date: { gte: start, lt: end },
          categoryId: { in: categoryIds },
        },
        _sum: { amount: true },
      })
    : [];

  const spentByCategory = new Map(
    expenseGroups.map((group) => [
      group.categoryId,
      Number(group._sum.amount ?? 0),
    ]),
  );

  const details = budgets.map((budget) => {
    const limit = Number(budget.amount);
    const spent = Math.round(
      ((spentByCategory.get(budget.categoryId) ?? 0) +
        Number.EPSILON) * 100,
    ) / 100;

    const remaining = Math.round(
      (limit - spent + Number.EPSILON) * 100,
    ) / 100;

    const usagePercent = Math.round(
      (spent / limit) * 10000,
    ) / 100;

    let status: 'ON_TRACK' | 'NEAR_LIMIT' | 'EXCEEDED';

    if (spent > limit) {
      status = 'EXCEEDED';
    } else if (usagePercent >= 80) {
      status = 'NEAR_LIMIT';
    } else {
      status = 'ON_TRACK';
    }

    return {
      categoryId: budget.categoryId,
      category: budget.category.name,
      budget: limit,
      spent,
      remaining,
      usagePercent,
      status,
    };
  });

  const totalBudget = Math.round(
    details.reduce((sum, item) => sum + item.budget, 0) * 100,
  ) / 100;

  const totalSpent = Math.round(
    details.reduce((sum, item) => sum + item.spent, 0) * 100,
  ) / 100;

  return {
    period: { year, month },
    hasBudget: budgets.length > 0,
    summary: {
      totalBudget,
      totalSpent,
      remaining: Math.round(
        (totalBudget - totalSpent) * 100,
      ) / 100,
      usagePercent: totalBudget > 0
        ? Math.round((totalSpent / totalBudget) * 10000) / 100
        : 0,
      categoriesCount: budgets.length,
      exceededCategories: details.filter(
        (item) => item.status === 'EXCEEDED',
      ).length,
    },
    categories: details,
    note: 'El seguimiento incluye únicamente gastos asociados a categorías que tienen un presupuesto aprobado.',
  };
}

}
