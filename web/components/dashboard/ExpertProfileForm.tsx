"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Textarea } from "@/components/ui/form";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { SPECIALIZATIONS } from "@/lib/experts";
import { expertProfileSchema } from "@/lib/schemas/expert-profile";
import { cn } from "@/lib/utils/cn";
import { AvatarUpload } from "./AvatarUpload";

export type ExpertProfileInitial = {
  id: string | null;
  full_name: string;
  title: string;
  bio: string;
  specializations: string[];
  experience_years: number;
  hourly_rate: number | null;
  certifications: string[];
  location: string;
  contact_email: string;
  avatar_url: string | null;
};

type FieldKey =
  | "full_name"
  | "title"
  | "bio"
  | "specializations"
  | "experience_years"
  | "hourly_rate"
  | "certifications"
  | "location"
  | "contact_email";

type Errors = Partial<Record<FieldKey, string>>;

/**
 * Expert profile create/edit form (story-experts-04). Create → POST /api/experts (status=pending);
 * edit → PATCH /api/experts/:id (material change re-bounces to pending). On save it refreshes the
 * server data so the pending banner + pre-fill reflect the new state.
 */
export function ExpertProfileForm({ initial }: { initial: ExpertProfileInitial }) {
  const router = useRouter();
  const isEdit = initial.id != null;

  const [fullName, setFullName] = useState(initial.full_name);
  const [title, setTitle] = useState(initial.title);
  const [location, setLocation] = useState(initial.location);
  const [experience, setExperience] = useState(String(initial.experience_years || ""));
  const [rate, setRate] = useState(initial.hourly_rate != null ? String(initial.hourly_rate) : "");
  const [contactEmail, setContactEmail] = useState(initial.contact_email);
  const [bio, setBio] = useState(initial.bio);
  const [specs, setSpecs] = useState<string[]>(initial.specializations);
  const [certsText, setCertsText] = useState(initial.certifications.join(", "));
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initial.avatar_url);

  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [formError, setFormError] = useState<string | null>(null);

  // Union of the canonical list + any custom specializations already on the profile.
  const specOptions = Array.from(new Set([...SPECIALIZATIONS, ...specs]));

  function toggleSpec(s: string) {
    setSpecs((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
    if (errors.specializations) setErrors((e) => ({ ...e, specializations: undefined }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "saving") return;
    setFormError(null);

    const payload = {
      full_name: fullName,
      title,
      bio,
      specializations: specs,
      experience_years: experience,
      hourly_rate: rate === "" ? null : rate,
      certifications: certsText
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      location,
      contact_email: contactEmail,
      avatar_url: avatarUrl,
    };

    const parsed = expertProfileSchema.safeParse(payload);
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors;
      setErrors({
        full_name: f.full_name?.[0],
        title: f.title?.[0],
        bio: f.bio?.[0],
        specializations: f.specializations?.[0],
        experience_years: f.experience_years?.[0],
        hourly_rate: f.hourly_rate?.[0],
        location: f.location?.[0],
        contact_email: f.contact_email?.[0],
      });
      return;
    }
    setErrors({});
    setStatus("saving");
    try {
      const res = await fetch(isEdit ? `/api/experts/${initial.id}` : "/api/experts", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const body = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (res.ok && body?.ok) {
        setStatus("saved");
        router.refresh();
      } else {
        setStatus("idle");
        setFormError("We couldn't save your profile. Please check the fields and try again.");
      }
    } catch {
      setStatus("idle");
      setFormError("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      {status === "saved" ? (
        <Alert tone="success">
          Profile saved. {isEdit ? "Material edits are re-reviewed before going live." : "It's now awaiting founder approval."}
        </Alert>
      ) : null}
      {formError ? <Alert tone="error">{formError}</Alert> : null}

      <AvatarUpload fullName={fullName} value={avatarUrl} onChange={setAvatarUrl} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Display name" name="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} error={errors.full_name} />
        <Input label="Title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} />
        <Input label="Location" name="location" value={location} onChange={(e) => setLocation(e.target.value)} error={errors.location} />
        <Input label="Years experience" name="experience_years" type="number" value={experience} onChange={(e) => setExperience(e.target.value)} error={errors.experience_years} />
        <Input label="Hourly rate (₹)" name="hourly_rate" type="number" value={rate} onChange={(e) => setRate(e.target.value)} error={errors.hourly_rate} hint="Leave blank for 'Rate on request'." />
        <Input label="Contact email" name="contact_email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} error={errors.contact_email} hint="Private — visitors never see this." />
      </div>

      <Textarea label="Bio" name="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} error={errors.bio} />

      <div>
        <span className="mb-2 block font-heading text-[0.72rem] font-semibold uppercase tracking-[0.04em] text-text">
          Specializations
        </span>
        <div className="flex flex-wrap gap-2">
          {specOptions.map((s) => {
            const on = specs.includes(s);
            return (
              <button
                key={s}
                type="button"
                aria-pressed={on}
                onClick={() => toggleSpec(s)}
                className={cn(
                  "rounded-full border-[1.5px] px-3 py-1.5 font-heading text-[0.7rem] font-bold uppercase tracking-[0.05em] transition",
                  on ? "border-secondary bg-tag-safe-bg text-tag-safe-text" : "border-border bg-card-bg text-muted hover:border-primary",
                )}
              >
                {s}
              </button>
            );
          })}
        </div>
        {errors.specializations ? (
          <p className="mt-1.5 font-body text-[0.78rem] text-error">{errors.specializations}</p>
        ) : null}
      </div>

      <Input
        label="Certifications"
        name="certifications"
        value={certsText}
        onChange={(e) => setCertsText(e.target.value)}
        hint="Comma-separated, e.g. FSSAI Auditor, FSSC 22000 Lead Auditor"
      />

      <div className="flex justify-end">
        <Button type="submit" size="lg" disabled={status === "saving"}>
          {status === "saving" ? "Saving…" : isEdit ? "Save changes" : "Submit for approval"}
        </Button>
      </div>
    </form>
  );
}
