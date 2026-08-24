"use client";

import { useCallback } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Youtube from "@tiptap/extension-youtube";
import {
  Bold, Code, Heading1, Heading2, Heading3, Image as ImageIcon, Italic,
  Link2, List, ListOrdered, Quote, Redo, Strikethrough, Table as TableIcon,
  Underline as UnderlineIcon, Undo, Youtube as YoutubeIcon,
} from "lucide-react";
import { validateUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

export function Editor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
      Underline,
      Image.configure({ HTMLAttributes: { class: "rounded-lg" } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Placeholder.configure({ placeholder: "Start writing…" }),
      Table.configure({ resizable: true }),
      TableRow, TableHeader, TableCell,
      Youtube.configure({ width: 720, height: 405, nocookie: true }),
    ],
    content: value,
    editorProps: {
      attributes: { class: "prose prose-manvi dark:prose-invert max-w-none focus:outline-none" },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  /* Images are hosted elsewhere (see the Media page) and inserted by link,
     because Cloud Storage would require a billing account. */
  const insertImage = useCallback(() => {
    const raw = window.prompt("Paste the image link (from Cloudinary, ImgBB, etc.)");
    if (raw === null) return;
    const result = validateUrl(raw);
    if (!result.ok) {
      window.alert(result.reason);
      return;
    }
    editor?.chain().focus().setImage({ src: result.url }).run();
  }, [editor]);

  if (!editor) return <div className="h-[420px] animate-pulse rounded-lg bg-surface-sub dark:bg-white/5" />;

  const Btn = ({
    onClick, active, label, children,
  }: { onClick: () => void; active?: boolean; label: string; children: React.ReactNode }) => (
    <button
      type="button" onClick={onClick} title={label} aria-label={label} aria-pressed={active}
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-md transition-colors duration-150",
        active ? "bg-primary text-white" : "text-ink-muted hover:bg-surface-sub hover:text-ink dark:hover:bg-white/10",
      )}
    >
      {children}
    </button>
  );

  const Divider = () => <span className="mx-1 h-5 w-px bg-line dark:bg-white/10" aria-hidden />;

  return (
    <div className="overflow-hidden rounded-lg border border-line dark:border-white/10">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-line bg-surface-sub p-2 dark:border-white/10 dark:bg-white/[0.03]">
        <Btn label="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 className="h-4 w-4" /></Btn>
        <Btn label="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></Btn>
        <Btn label="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4" /></Btn>
        <Divider />
        <Btn label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></Btn>
        <Btn label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></Btn>
        <Btn label="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon className="h-4 w-4" /></Btn>
        <Btn label="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></Btn>
        <Divider />
        <Btn label="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" /></Btn>
        <Btn label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></Btn>
        <Btn label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="h-4 w-4" /></Btn>
        <Btn label="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code className="h-4 w-4" /></Btn>
        <Divider />
        <Btn label="Insert link" active={editor.isActive("link")} onClick={() => {
          const previous = editor.getAttributes("link").href as string | undefined;
          const url = window.prompt("Link URL", previous ?? "https://");
          if (url === null) return;
          if (url === "") { editor.chain().focus().unsetLink().run(); return; }
          editor.chain().focus().setLink({ href: url }).run();
        }}><Link2 className="h-4 w-4" /></Btn>
        <Btn label="Insert image by link" onClick={insertImage}><ImageIcon className="h-4 w-4" /></Btn>
        <Btn label="Embed YouTube" onClick={() => {
          const url = window.prompt("YouTube URL");
          if (url) editor.commands.setYoutubeVideo({ src: url });
        }}><YoutubeIcon className="h-4 w-4" /></Btn>
        <Btn label="Insert table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><TableIcon className="h-4 w-4" /></Btn>
        <Divider />
        <Btn label="Undo" onClick={() => editor.chain().focus().undo().run()}><Undo className="h-4 w-4" /></Btn>
        <Btn label="Redo" onClick={() => editor.chain().focus().redo().run()}><Redo className="h-4 w-4" /></Btn>
      </div>

      <div className="bg-surface p-6 dark:bg-transparent">
        <EditorContent editor={editor} className="tiptap" />
      </div>

      <p className="border-t border-line px-6 py-2.5 text-xs text-ink-muted dark:border-white/10">
        Images are added by link. Upload yours to Cloudinary or ImgBB first, then paste the link
        here or save it on the Media page to reuse later.
      </p>
    </div>
  );
}
