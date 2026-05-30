"use client";

import { DashboardShell, DashboardHeader, type DashboardTab } from "./DashboardShell";
import { EmptyState } from "@/components/listing/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { Icon, type IconName } from "@/components/ui/Icon";
import { ExpertProfileForm, type ExpertProfileInitial } from "./ExpertProfileForm";
import { AvailabilityToggle } from "./AvailabilityToggle";
import { InquiriesInbox } from "./InquiriesInbox";

export type ExpertRow = {
  id: string;
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
  status: string;
  is_available: boolean;
  rating: number | null;
  review_count: number;
  response_time: string | null;
};

export type ExpertInquiry = {
  id: string;
  sender_name: string;
  sender_email: string;
  company_name: string | null;
  engagement_type: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
};

function StatCard({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card-bg p-5">
      <div className="flex items-center gap-2 font-body text-[0.78rem] text-muted">
        <Icon name={icon} size={14} stroke={1.8} />
        {label}
      </div>
      <div className="mt-2 font-heading text-[1.6rem] font-bold text-text">{value}</div>
    </div>
  );
}

// Expert dashboard (story-experts-04 profile, story-experts-06 availability, story-experts-11 stats + inbox).
export function ExpertDashboard({
  fullName,
  expert,
  inquiries,
  profileDefaults,
}: {
  fullName: string;
  expert: ExpertRow | null;
  inquiries: ExpertInquiry[];
  profileDefaults: { full_name: string; email: string };
}) {
  const isPending = expert?.status === "pending";

  const initial: ExpertProfileInitial = expert
    ? {
        id: expert.id,
        full_name: expert.full_name,
        title: expert.title,
        bio: expert.bio,
        specializations: expert.specializations,
        experience_years: expert.experience_years,
        hourly_rate: expert.hourly_rate,
        certifications: expert.certifications,
        location: expert.location,
        contact_email: expert.contact_email,
        avatar_url: expert.avatar_url,
      }
    : {
        id: null,
        full_name: profileDefaults.full_name,
        title: "",
        bio: "",
        specializations: [],
        experience_years: 0,
        hourly_rate: null,
        certifications: [],
        location: "",
        contact_email: profileDefaults.email,
        avatar_url: null,
      };

  const pendingBanner = isPending ? (
    <Alert tone="warning" className="mb-6">
      Your profile is awaiting founder approval — you&apos;ll receive an email when it goes live.
    </Alert>
  ) : null;

  const tabs: DashboardTab[] = [
    {
      id: "overview",
      label: "Overview",
      icon: "trending",
      render: ({ goToTab }) => (
        <>
          {pendingBanner}
          <DashboardHeader
            title="Expert dashboard"
            subtitle="Keep your profile fresh, manage inquiries, and toggle availability."
          />
          {expert ? (
            // 4-card stats grid (story-experts-11). No fabricated metrics — profile views /
            // active engagements aren't tracked, so they're omitted entirely.
            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4" data-testid="expert-stats">
              <StatCard icon="mail" label="Inquiries" value={String(inquiries.length)} />
              <StatCard
                icon="star"
                label="Avg rating"
                value={expert.review_count > 0 && expert.rating != null ? expert.rating.toFixed(1) : "—"}
              />
              <StatCard
                icon="clock"
                label="Response time"
                value={expert.response_time || "—"}
              />
              <StatCard
                icon="verified"
                label="Availability"
                value={expert.is_available ? "Available" : "Unavailable"}
              />
            </div>
          ) : null}
          {expert ? (
            <div className="rounded-lg border border-border bg-card-bg p-6">
              <p className="font-heading text-[1.05rem] font-bold text-text">{expert.title}</p>
              <p className="mt-1 font-body text-[0.88rem] text-muted">{expert.location}</p>
              <p className="mt-3 font-body text-[0.85rem] text-muted">
                Status:{" "}
                <span className="font-semibold text-text">
                  {expert.status === "active" ? "Live in the directory" : "Pending approval"}
                </span>
              </p>
              <button
                type="button"
                onClick={() => goToTab("profile")}
                className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-[22px] py-2.5 font-heading text-[0.82rem] font-bold text-white transition hover:bg-primary-deep"
              >
                Edit profile
              </button>
            </div>
          ) : (
            <EmptyState
              title="Complete your expert profile"
              message="A complete profile gets surfaced in the experts directory. Submit it for a quick founder review."
              action={
                <button
                  type="button"
                  onClick={() => goToTab("profile")}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-[22px] py-3 font-heading text-[0.82rem] font-bold text-white transition hover:bg-primary-deep"
                >
                  Create profile
                </button>
              }
            />
          )}
        </>
      ),
    },
    {
      id: "profile",
      label: "Profile",
      icon: "user",
      render: () => (
        <>
          {pendingBanner}
          <DashboardHeader
            title={expert ? "Edit your profile" : "Create your profile"}
            subtitle="Visitors see this in the experts directory once approved."
          />
          <ExpertProfileForm initial={initial} />
        </>
      ),
    },
    {
      id: "availability",
      label: "Availability",
      icon: "settings",
      render: () =>
        expert ? (
          <>
            <DashboardHeader
              title="Availability"
              subtitle="Toggle whether you're open to new engagements. Updates the directory immediately."
            />
            <AvailabilityToggle expertId={expert.id} initial={expert.is_available} />
          </>
        ) : (
          <EmptyState
            title="Availability"
            message="Create your profile first — then you can toggle availability here."
            action={{ label: "View the experts directory", href: "/experts" }}
          />
        ),
    },
    {
      id: "inquiries",
      label: "Inquiries",
      icon: "mail",
      render: () => (
        <>
          <DashboardHeader
            title="Inquiries"
            subtitle="Businesses who reached out through your profile. Unread inquiries are marked."
          />
          <InquiriesInbox initial={inquiries} />
        </>
      ),
    },
  ];

  return <DashboardShell role="expert" fullName={fullName} tabs={tabs} />;
}
