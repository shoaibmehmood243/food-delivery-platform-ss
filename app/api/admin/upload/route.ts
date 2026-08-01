import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "owner") {
      return NextResponse.json(
        { error: "Forbidden: Owner access required." },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const imageUrlInput = formData.get("imageUrl") as string | null;

    if (imageUrlInput && imageUrlInput.trim().length > 0) {
      return NextResponse.json({
        success: true,
        imageUrl: imageUrlInput.trim(),
      });
    }

    if (!file) {
      return NextResponse.json(
        { error: "No image file or URL provided" },
        { status: 400 }
      );
    }

    // Cloudinary upload logic if credentials exist
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (cloudName && uploadPreset) {
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append("file", file);
      cloudinaryFormData.append("upload_preset", uploadPreset);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: "POST",
          body: cloudinaryFormData,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error?.message || "Cloudinary upload failed");
      }

      const data = await res.json();
      return NextResponse.json({
        success: true,
        imageUrl: data.secure_url,
      });
    }

    // Fallback: convert file to Base64 Data URL if Cloudinary env vars are missing
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || "image/jpeg";
    const base64Data = `data:${mimeType};base64,${buffer.toString("base64")}`;

    return NextResponse.json({
      success: true,
      imageUrl: base64Data,
    });
  } catch (error: any) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}
