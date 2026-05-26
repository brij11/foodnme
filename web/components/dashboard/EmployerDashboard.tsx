"use client";

import { DashboardShell, DashboardHeader, type DashboardTab } from "./DashboardShell";
import { EmptyState } from "@/components/listing/EmptyState";
import { Button } from "@/components/ui/Button";

// Employer dashboard shell (story-auth-07). Posting + applicant content lands in story-jobs-04.
export function EmployerDashboard({ fullName }: { fullName: string }) {
  const tabs: DashboardTab[] = [
    {
      id: "overview",
      label: "Overview",
      icon: "trending",
      render: ({ goToTab }) => (
        <>
          <DashboardHeader
            title="Employer dashboard"
            subtitle="Manage your job postings and review applicants."
          />
          <EmptyState
            title="Post your first job"
            message="Your listings and applicants will appear here once you post a role."
            action={
              <Button onClick={() => goToTab("post")} size="md">
                Post a job
              </Button>
            }
          />
        </>
      ),
    },
    {
      id: "posted",
      label: "Posted jobs",
      icon: "briefcase",
      render: ({ goToTab }) => (
        <EmptyState
          title="No postings yet"
          message="Jobs you post go through a short admin review, then appear here."
          action={
            <Button onClick={() => goToTab("post")} size="md">
              Post a job
            </Button>
          }
        />
      ),
    },
    {
      id: "applicants",
      label: "Applicants",
      icon: "user",
      render: () => (
        <EmptyState
          title="No applicants yet"
          message="When candidates apply to your roles, they show up here for review."
          action={{ label: "Browse the job board", href: "/jobs" }}
        />
      ),
    },
    {
      id: "post",
      label: "Post new job",
      icon: "plus",
      render: () => (
        <EmptyState
          title="Post a job"
          message="The job posting form opens here. Posts go through a short admin review before going live."
          action={{ label: "Browse current jobs", href: "/jobs" }}
        />
      ),
    },
  ];

  return <DashboardShell role="employer" fullName={fullName} tabs={tabs} />;
}
