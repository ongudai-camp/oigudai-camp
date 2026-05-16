import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/adminAccess";
import { decryptIdentityData } from "@/lib/crypto";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = parseInt(params.id);

    const documents = await prisma.identityDocument.findMany({
      where: { userId },
      orderBy: { uploadedAt: "desc" },
    });

    const contracts = await prisma.contract.findMany({
      where: { userId },
      include: {
        booking: {
          select: {
            id: true,
            status: true,
            totalPrice: true,
            checkIn: true,
            checkOut: true,
            post: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: { signedAt: "desc" },
    });

    // Decrypt data for admin view
    const decryptedDocs = documents.map((doc) => {
      try {
        const decrypted = decryptIdentityData(doc.encryptedData, userId);
        return { ...doc, decryptedData: decrypted };
      } catch (e) {
        return { ...doc, decryptedData: null, decryptError: true };
      }
    });

    return NextResponse.json({ 
      documents: decryptedDocs, 
      contracts 
    });
  } catch (error: unknown) {
    console.error("Admin user documents error:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { docId, status, statusNote } = body;

    if (!docId || !status) {
      return NextResponse.json({ error: "Missing docId or status" }, { status: 400 });
    }

    const doc = await prisma.identityDocument.update({
      where: { id: parseInt(docId) },
      data: { 
        status, 
        statusNote,
        reviewedAt: new Date(),
        reviewedBy: parseInt(session.user.id)
      },
    });

    // If verified, also update user identityVerified field
    if (status === "verified") {
      await prisma.user.update({
        where: { id: parseInt(params.id) },
        data: { 
          identityVerified: true,
          identityVerifiedAt: new Date()
        },
      });
    }

    return NextResponse.json(doc);
  } catch (error: unknown) {
    console.error("Admin user document update error:", error);
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 });
  }
}
