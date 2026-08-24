"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Linkedin, Mail, MapPin, Send } from "lucide-react";
import { SiteShell } from "@/components/site/SiteShell";
import { SectionLabel } from "@/components/site/SectionLabel";
import { submitContact } from "@/lib/contacts";
import { profile } from "@/lib/content";

const schema = z.object({
  name: z.string().min(2, "Enter your full name.").max(120),
  email: z.string().email("Enter a valid email address."),
  organization: z.string().max(160).optional(),
  subject: z.string().min(3, "Add a short subject line.").max(200),
  message: z.string().min(20, "Tell me a little more — at least 20 characters.").max(5000),
  // Honeypot: bots fill hidden fields, humans never see this one.
  website: z.string().max(0).optional(),
});

type FormValues = z.infer<typeof schema>;

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState(false);

  const {
    register, handleSubmit, reset, formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    if (values.website) return; // Honeypot tripped — silently drop.
    setFailed(false);
    try {
      await submitContact({
        name: values.name,
        email: values.email,
        organization: values.organization ?? "",
        subject: values.subject,
        message: values.message,
      });
      setSent(true);
      reset();
    } catch {
      setFailed(true);
    }
  }

  return (
    <SiteShell>
      <section className="py-section">
        <div className="shell grid gap-16 lg:grid-cols-12 lg:gap-24">
          <div className="lg:col-span-5">
            <SectionLabel>Contact</SectionLabel>
            <h1 className="font-display text-section font-semibold">Let&rsquo;s talk.</h1>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-ink-muted">
              Open to consulting projects, internships, research collaboration, and conversations about
              healthcare operations. I reply to most messages within two working days.
            </p>

            <div className="mt-14 space-y-7">
              <div>
                <div className="measure mb-3">Email</div>
                <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-3 text-[1.0625rem] transition-colors hover:text-primary">
                  <Mail className="h-4 w-4 text-ink-muted" /> {profile.email}
                </a>
              </div>
              <div>
                <div className="measure mb-3">LinkedIn</div>
                <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 text-[1.0625rem] transition-colors hover:text-primary">
                  <Linkedin className="h-4 w-4 text-ink-muted" /> Manvi Gurjar
                </a>
              </div>
              <div>
                <div className="measure mb-3">Location</div>
                <div className="inline-flex items-center gap-3 text-[1.0625rem]">
                  <MapPin className="h-4 w-4 text-ink-muted" /> {profile.location}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            {sent ? (
              <div className="rounded-xl border border-line bg-surface-sub p-12 text-center dark:border-white/10 dark:bg-white/[0.03]">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-positive/10">
                  <Check className="h-6 w-6 text-positive" />
                </div>
                <h2 className="mt-6 font-display text-2xl font-semibold">Message sent</h2>
                <p className="mt-3 text-ink-muted">
                  Thanks for reaching out. I&rsquo;ll reply to the address you gave within two working days.
                </p>
                <button onClick={() => setSent(false)} className="btn-ghost mt-8">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                <input type="text" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" {...register("website")} />

                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Name" error={errors.name?.message} required>
                    <input {...register("name")} className="field" placeholder="Your full name" autoComplete="name" />
                  </Field>
                  <Field label="Email" error={errors.email?.message} required>
                    <input {...register("email")} type="email" className="field" placeholder="you@organisation.com" autoComplete="email" />
                  </Field>
                </div>

                <Field label="Organisation" error={errors.organization?.message}>
                  <input {...register("organization")} className="field" placeholder="Hospital, firm, or institution" autoComplete="organization" />
                </Field>

                <Field label="Subject" error={errors.subject?.message} required>
                  <input {...register("subject")} className="field" placeholder="What is this about?" />
                </Field>

                <Field label="Message" error={errors.message?.message} required>
                  <textarea {...register("message")} rows={7} className="field resize-y" placeholder="Give me some context on what you're working on." />
                </Field>

                {failed && (
                  <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                    The message didn&rsquo;t send. Check your connection and try again, or email {profile.email} directly.
                  </p>
                )}

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto">
                  {isSubmitting ? "Sending…" : <>Send message <Send className="h-4 w-4" /></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}

function Field({
  label, error, required, children,
}: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium">
        {label} {required && <span className="text-ink-faint">*</span>}
      </span>
      {children}
      {error && <span role="alert" className="mt-1.5 block text-sm text-red-600 dark:text-red-400">{error}</span>}
    </label>
  );
}
