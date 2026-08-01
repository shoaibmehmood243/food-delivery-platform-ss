import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    return NextResponse.json({ success: true, branches });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch branches" },
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
      address,
      phone,
      hoursOpen,
      hoursClose,
      deliveryFee,
      deliveryRadiusKm,
      lat,
      lng,
      isActive,
    } = body;

    if (!name || !address || !phone) {
      return NextResponse.json(
        { error: "Missing required branch details (name, address, phone)" },
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
    while (await prisma.branch.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${count++}`;
    }

    const branch = await prisma.branch.create({
      data: {
        name: name.trim(),
        slug,
        address: address.trim(),
        phone: phone.trim(),
        hoursOpen: hoursOpen || "12 PM",
        hoursClose: hoursClose || "12 AM",
        deliveryFee: Number(deliveryFee) || 150,
        deliveryRadiusKm: Number(deliveryRadiusKm) || 5.0,
        lat: Number(lat) || 31.5204,
        lng: Number(lng) || 74.3587,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, branch });
  } catch (error: any) {
    console.error("Failed to create branch:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create branch" },
      { status: 500 }
    );
  }
}
