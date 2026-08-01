import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await prisma.menuItem.findMany({
      orderBy: { name: "asc" },
      include: {
        category: true,
        addonOptions: true,
      },
    });

    return NextResponse.json({ success: true, items });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch menu items" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "owner") {
      return NextResponse.json(
        { error: "Forbidden: Owner access required." },
        { status: 403 }
      );
    }

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

    if (!name || !categoryId || price === undefined) {
      return NextResponse.json(
        { error: "Missing required fields (name, category, price)" },
        { status: 400 }
      );
    }

    // Generate unique slug
    let baseSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    let slug = baseSlug;
    let count = 1;
    while (await prisma.menuItem.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`;
    }

    const newItem = await prisma.menuItem.create({
      data: {
        name: name.trim(),
        slug,
        categoryId,
        description: description || null,
        price: Number(price),
        imageUrl: imageUrl || null,
        hasHeatGauge: Boolean(hasHeatGauge),
        flavorOptions: Array.isArray(flavorOptions) ? flavorOptions : [],
        isNew: Boolean(isNew),
        isSignature: Boolean(isSignature),
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        ...(Array.isArray(addonOptions) && addonOptions.length > 0
          ? {
              addonOptions: {
                create: addonOptions.map((a: any) => ({
                  name: a.name.trim(),
                  price: Number(a.price),
                })),
              },
            }
          : {}),
      },
      include: {
        category: true,
        addonOptions: true,
      },
    });

    return NextResponse.json({ success: true, item: newItem });
  } catch (error: any) {
    console.error("Failed to create menu item:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create menu item" },
      { status: 500 }
    );
  }
}
