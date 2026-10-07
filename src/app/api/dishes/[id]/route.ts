import { NextRequest, NextResponse } from 'next/server';
import { getDishService } from '@/services/dish.service';
import { dishUpdateSchema } from '@/services/dish.validator';
import { isAuthorizedAdmin } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;
    const dishService = getDishService();
    const dish = await dishService.getDishById(id);

    if (!dish) {
      return NextResponse.json(
        { success: false, error: 'Dish not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: dish,
        ...dish,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const isAuthorized = await isAuthorizedAdmin(request);
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const parsed = dishUpdateSchema.safeParse(body);
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
    const updated = await dishService.updateDish(id, parsed.data);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Dish not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: updated,
        ...updated,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const isAuthorized = await isAuthorizedAdmin(request);
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const dishService = getDishService();
    const deleted = await dishService.deleteDish(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Dish not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Dish deleted successfully',
        dish_id: id,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
