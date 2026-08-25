import { NextResponse } from "next/server";
import { serverStore } from "@/lib/services/serverStore";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const list = serverStore.getCaseStudies();
    return NextResponse.json(
      { success: true, caseStudies: list },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load case studies.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const saved = serverStore.saveCaseStudy(body);

    addDoc(collection(db, "case-studies"), {
      ...body,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    }).catch((e) => console.warn("[API/CaseStudies] Firestore sync warning:", e));

    return NextResponse.json(
      { success: true, id: saved.id, caseStudy: saved },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create case study.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
