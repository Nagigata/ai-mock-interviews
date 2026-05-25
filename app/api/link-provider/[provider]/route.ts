import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "") ||
  "http://localhost:3001";

const SUPPORTED = new Set(["google", "github"]);

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params;
  const normalized = provider?.toLowerCase();

  const origin = new URL(request.url).origin;
  const settingsUrl = new URL(`${origin}/settings`);
  settingsUrl.searchParams.set("tab", "account");

  if (!normalized || !SUPPORTED.has(normalized)) {
    settingsUrl.searchParams.set("linked", "error");
    settingsUrl.searchParams.set("msg", "Unsupported provider");
    return NextResponse.redirect(settingsUrl);
  }

  const token = (await cookies()).get("token")?.value;
  if (!token) {
    settingsUrl.searchParams.set("linked", "error");
    settingsUrl.searchParams.set(
      "msg",
      "You must be signed in to link a provider.",
    );
    return NextResponse.redirect(settingsUrl);
  }

  const backendLink = new URL(`${BACKEND_URL}/api/auth/link/${normalized}`);
  backendLink.searchParams.set("t", token);

  return NextResponse.redirect(backendLink);
}
