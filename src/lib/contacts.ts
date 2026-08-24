import {
  addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import type { ContactLead, ContactStatus } from "@/types";

const COL = "contacts";

export async function submitContact(input: {
  name: string; email: string; organization?: string; subject: string; message: string;
}) {
  await addDoc(collection(db, COL), {
    ...input,
    organization: input.organization ?? "",
    status: "new" as ContactStatus,
    createdAt: Date.now(),
  });
}

export async function getLeads(): Promise<ContactLead[]> {
  const snap = await getDocs(query(collection(db, COL), orderBy("createdAt", "desc")));
  return snap.docs.map((s) => {
    const d = s.data();
    return {
      id: s.id,
      name: d.name ?? "",
      email: d.email ?? "",
      organization: d.organization ?? "",
      subject: d.subject ?? "",
      message: d.message ?? "",
      status: (d.status as ContactStatus) ?? "new",
      createdAt: d.createdAt ?? Date.now(),
    };
  });
}

export async function setLeadStatus(id: string, status: ContactStatus) {
  await updateDoc(doc(db, COL, id), { status });
}

export async function deleteLead(id: string) {
  await deleteDoc(doc(db, COL, id));
}
