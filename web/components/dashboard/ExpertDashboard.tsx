"use client";

import { DashboardShell, DashboardHeader, type DashboardTab } from "./DashboardShell";
import { EmptyState } from "@/components/listing/EmptyState";

// Expert dashboard shell (story-auth-07). Profile editor / availability / inquiries content lands
// in story-experts-04, -05, -06.
export function ExpertDashboard({ fullName }: { fullName: string }) {
  const tabs: DashboardTab[] = [
    {
      id: "overview",
      label: "Overview",
      icon: "trending",
      render: ({ goToTab }) => (
        <>
          <DashboardHeader
            title="Expert dashboard"
            subtitle="Keep your profile fresh, manage inquiries, and toggle availability."
          />
          <EmptyState
            title="Complete your expert profile"
            message="A complete profile gets surfaced in the experts directory. Inquiries from businesses will appear here."
            action={
              <button
                type="button"
                onClick={() => goToTab("profile")}
                className="inline-flex items-center justify-center rounded-md bg-primary px-[22px] py-3 font-heading text-[0.82rem] font-bold text-white transition hover:bg-primary-deep"
              >
                Edit profile
              </button>
            }
          />
        </>
      ),
    },
    {
      id: "profile",
      label: "Profile",
      icon: "user",
      render: () => (
        <EmptyState
          title="Profile editor"
          message="Your photo, title, bio, specializations, and rate live here. The editor arrives next."
          action={{ label: "View the experts directory", href: "/experts" }}
        />
      ),
    },
    {
      id: "inquiries",
      label: "Inquiries",
      icon: "mail",
      render: () => (
        <EmptyState
          title="No inquiries yet"
          message="When a business contacts you through your profile, the message appears here."
          action={{ label: "View the experts directory", href: "/experts" }}
        />
      ),
    },
    {
      id: "availability",
      label: "Availability",
      icon: "settings",
      render: () => (
        <EmptyState
          title="Availability"
          message="Toggle whether you're open to new engagements. The control arrives with your profile editor."
          action={{ label: "View the experts directory", href: "/experts" }}
        />
      ),
    },
  ];

  return <DashboardShell role="expert" fullName={fullName} tabs={tabs} />;
}
