import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "owner") {
      return NextResponse.json(
        { error: "Forbidden: Owner access required." },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const {
      name,
      categoryId,
      description,
      price,
      imageUrl,
      hasHeatGauge,
      flavorOptions,
      isNew,
      isSignature,
      isActive,
      addonOptions,
    } = body;

    const updatedItem = await prisma.$transaction(async (tx) => {
      // If addonOptions is provided, update addons
      if (Array.isArray(addonOptions)) {
        await tx.addonOption.deleteMany({
          where: { menuItemId: id },
        });

        if (addonOptions.length > 0) {
          await tx.addonOption.createMany({
            data: addonOptions.map((a: any) => ({
              menuItemId: id,
              name: a.name.trim(),
              price: Number(a.price),
            })),
          });
        }
      }

      const item = await tx.menuItem.update({
        where: { id },
        data: {
          ...(name ? { name: name.trim() } : {}),
          ...(categoryId ? { categoryId } : {}),
          ...(description !== undefined ? { description: description || null } : {}),
          ...(price !== undefined ? { price: Number(price) } : {}),
          ...(imageUrl !== undefined ? { imageUrl: imageUrl || null } : {}),
          ...(hasHeatGauge !== undefined ? { hasHeatGauge: Boolean(hasHeatGauge) } : {}),
          ...(flavorOptions !== undefined
            ? { flavorOptions: Array.isArray(flavorOptions) ? flavorOptions : [] }
            : {}),
          ...(isNew !== undefined ? { isNew: Boolean(isNew) } : {}),
          ...(isSignature !== undefined ? { isSignature: Boolean(isSignature) } : {}),
          ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
        },
        include: {
          category: true,
          addonOptions: true,
        },
      });

      return item;
    });

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error: any) {
    console.error("Failed to update menu item:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update menu item" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "owner") {
      return NextResponse.json(
        { error: "Forbidden: Owner access required." },
        { status: 403 }
      );
    }

    const { id } = params;

    await prisma.menuItem.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete menu item" },
      { status: 500 }
    );
  }
}
