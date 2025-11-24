import connectDB from "@/lib/db";
import Dish from "@/models/Dish";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const dish = await Dish.findById(id).populate("ingredients.ingredientId");

    if (!dish) {
      return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    }

    return NextResponse.json(dish);
  } catch (error) {
    console.error("Failed to fetch dish:", error);
    return NextResponse.json(
      { error: "Failed to fetch dish" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { name, ingredients } = await request.json();

    const dish = await Dish.findByIdAndUpdate(
      id,
      { name, ingredients },
      { new: true }
    ).populate("ingredients.ingredientId");

    if (!dish) {
      return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    }

    return NextResponse.json(dish);
  } catch (error) {
    console.error("Failed to update dish:", error);
    return NextResponse.json(
      { error: "Failed to update dish" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const dish = await Dish.findByIdAndDelete(id);

    if (!dish) {
      return NextResponse.json({ error: "Dish not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Dish deleted" });
  } catch (error) {
    console.error("Failed to delete dish:", error);
    return NextResponse.json(
      { error: "Failed to delete dish" },
      { status: 500 }
    );
  }
}
