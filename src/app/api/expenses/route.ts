import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: 'desc' },
      take: 100,
    });

    const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

    return NextResponse.json({
      expenses,
      totalExpense,
    });
  } catch (error: any) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, title, amount, date, paymentMethod = 'CASH', notes } = body;

    if (!category || !title || !amount) {
      return NextResponse.json({ error: 'Category, title, and amount are required' }, { status: 400 });
    }

    const expense = await prisma.expense.create({
      data: {
        category,
        title,
        amount: Number(amount),
        date: date ? new Date(date) : new Date(),
        paymentMethod: paymentMethod as any,
        notes: notes || null,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error: any) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: error.message || 'Failed to create expense' }, { status: 500 });
  }
}
