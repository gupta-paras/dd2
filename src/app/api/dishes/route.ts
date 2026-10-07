import { NextRequest, NextResponse } from 'next/server';
import { getDishService } from '@/services/dish.service';
import { dishCreateSchema, dishFilterSchema } from '@/services/dish.validator';
import { isAuthorizedAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const rawFilters = {
      availability: searchParams.get('availability') ?? undefined,
      is_available: searchParams.get('is_available') ?? undefined,
      daily_special: searchParams.get('daily_special') ?? undefined,
      category: searchParams.get('category') ?? undefined,
      tags: searchParams.get('tags') ?? undefined,
      name: searchParams.get('name') ?? undefined,
      is_coming_soon: searchParams.get('is_coming_soon') ?? undefined,
    };

    const parsed = dishFilterSchema.safeParse(rawFilters);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid filter parameters', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const dishService = getDishService();
    const result = await dishService.getDishes(parsed.data);

    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAuthorized = await isAuthorizedAdmin(request);
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const parsed = dishCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const dishService = getDishService();
    const newDish = await dishService.createDish(parsed.data);

    return NextResponse.json(
      {
        success: true,
        data: newDish,
        ...newDish,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
