import { NextResponse } from "next/server";
import { serverStore } from "@/lib/services/serverStore";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const list = serverStore.getCaseStudies();
    const item = list.find((cs) => cs.id === id);
    if (!item) {
      return NextResponse.json({ error: "Case study not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true, caseStudy: item });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch case study.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = serverStore.saveCaseStudy({ ...body, id });

    if (!id.startsWith("static-")) {
      updateDoc(doc(db, "case-studies", id), { ...body, updatedAt: Date.now() }).catch((e) =>
        console.warn("[API/CaseStudies/[id]] Firestore update sync warning:", e)
      );
    }

    return NextResponse.json({ success: true, caseStudy: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update case study.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    serverStore.deleteCaseStudy(id);

    if (!id.startsWith("static-")) {
      deleteDoc(doc(db, "case-studies", id)).catch((e) =>
        console.warn("[API/CaseStudies/[id]] Firestore delete sync warning:", e)
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete case study.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
