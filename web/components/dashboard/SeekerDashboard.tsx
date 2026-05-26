"use client";

import { DashboardShell, DashboardHeader, type DashboardTab } from "./DashboardShell";
import { EmptyState } from "@/components/listing/EmptyState";

// Job-seeker dashboard shell (story-auth-07). Application/saved-job content lands in story-jobs-07.
export function SeekerDashboard({ fullName }: { fullName: string }) {
  const firstName = fullName.trim().split(/\s+/)[0] || "there";

  const tabs: DashboardTab[] = [
    {
      id: "overview",
      label: "Overview",
      icon: "trending",
      render: () => (
        <>
          <DashboardHeader
            title={`Welcome back, ${firstName}.`}
            subtitle="Here's a snapshot of your job search."
          />
          <EmptyState
            title="Start your job search"
            message="Roles you apply to and jobs you save will show up here once you get going."
            action={{ label: "Browse jobs", href: "/jobs" }}
          />
        </>
      ),
    },
    {
      id: "applications",
      label: "Applications",
      icon: "briefcase",
      render: () => (
        <EmptyState
          title="No applications yet"
          message="When you apply to a role, it appears here so you can track its status."
          action={{ label: "Browse jobs", href: "/jobs" }}
        />
      ),
    },
    {
      id: "saved",
      label: "Saved jobs",
      icon: "bookmark",
      render: () => (
        <EmptyState
          title="No saved jobs"
          message="Save roles you're interested in to revisit them later."
          action={{ label: "Browse jobs", href: "/jobs" }}
        />
      ),
    },
    {
      id: "profile",
      label: "Profile",
      icon: "user",
      render: () => (
        <EmptyState
          title="Your profile"
          message="Build out your profile so employers can find you. Editing arrives soon."
          action={{ label: "Browse jobs", href: "/jobs" }}
        />
      ),
    },
  ];

  return <DashboardShell role="seeker" fullName={fullName} tabs={tabs} />;
}
