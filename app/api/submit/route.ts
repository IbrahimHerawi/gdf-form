import { NextResponse } from "next/server";
import { validateLead } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real users never fill this hidden field, bots usually do.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const { data, errors } = validateLead(body);
  if (!data) {
    return NextResponse.json({ ok: false, errors }, { status: 422 });
  }

  // Both values come from the Vercel project's Environment Variables.
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  const secret = process.env.GOOGLE_SCRIPT_SECRET;
  if (!scriptUrl || !secret) {
    console.error("GOOGLE_SCRIPT_URL and GOOGLE_SCRIPT_SECRET must both be set.");
    return NextResponse.json(
      { ok: false, error: "The form is not configured yet. Please try again later." },
      { status: 500 },
    );
  }

  try {
    // Apps Script answers POST with a redirect to the result; fetch follows it.
    const res = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, secret }),
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    const result = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;

    if (!res.ok || !result?.ok) {
      console.error("Google Sheet write failed:", res.status, result?.error ?? "non-JSON response");
      throw new Error("Sheet write failed");
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { ok: false, error: "We couldn't save your details. Please try again." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
