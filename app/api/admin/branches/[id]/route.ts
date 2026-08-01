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

    const branch = await prisma.branch.update({
      where: { id },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(address ? { address: address.trim() } : {}),
        ...(phone ? { phone: phone.trim() } : {}),
        ...(hoursOpen ? { hoursOpen } : {}),
        ...(hoursClose ? { hoursClose } : {}),
        ...(deliveryFee !== undefined ? { deliveryFee: Number(deliveryFee) } : {}),
        ...(deliveryRadiusKm !== undefined
          ? { deliveryRadiusKm: Number(deliveryRadiusKm) }
          : {}),
        ...(lat !== undefined ? { lat: Number(lat) } : {}),
        ...(lng !== undefined ? { lng: Number(lng) } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    return NextResponse.json({ success: true, branch });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update branch" },
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

    // Check order dependency count
    const ordersCount = await prisma.order.count({
      where: { branchId: id },
    });

    if (ordersCount > 0) {
      return NextResponse.json(
        {
          error: `This branch has ${ordersCount} existing orders and cannot be deleted. Please set its status to Inactive instead to stop accepting new orders.`,
        },
        { status: 400 }
      );
    }

    await prisma.branch.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete branch" },
      { status: 500 }
    );
  }
}
