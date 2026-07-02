import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, verifyPassword, createAdminSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await createAdminSession(admin.id);
    return NextResponse.json({ success: true, name: admin.name });
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

export async function DELETE() {
  const { clearAdminSession } = await import("@/lib/auth");
  await clearAdminSession();
  return NextResponse.json({ success: true });
}

export async function GET() {
  const adminId = await getAdminSession();
  if (!adminId) return NextResponse.json({ authenticated: false });

  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json({ authenticated: !!admin, admin });
}
