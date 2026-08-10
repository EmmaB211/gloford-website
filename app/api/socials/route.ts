import { NextResponse } from "next/server";
import { getSocialsFeed } from "@/lib/services/socials";

export async function GET() {
  try {
    const data = await getSocialsFeed();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}
