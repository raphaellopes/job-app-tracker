"use client";

import { useState } from "react";
import classNames from "classnames";

import Tabs from "@/components/tabs";
import TagChipList from "@/components/tag/tag-chip-list";

import { LazyAIInterviewPrep } from "@/features/ai-interview-prep";
import JobNotesForm from "@/features/jobs/components/job-notes-form";
import type { Job, JobsBoardFilters } from "@/features/jobs/types";

interface JobViewProps {
  job: Job;
  filters?: JobsBoardFilters;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <section className="space-y-1">
    <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
    <div>{children}</div>
  </section>
);

const SectionContent: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
}) => <p className={classNames("text-sm text-gray-600", className)}>{children}</p>;

const JobView: React.FC<JobViewProps> = ({ job, filters = {} }) => {
  const [hasOpenedInterviewPrepTab, setHasOpenedInterviewPrepTab] = useState(false);

  const renderJobContent = (
    <div className="space-y-5">
      <Section title="Job publisher">
        <SectionContent>{job.jobPublisher ?? "Not provided"}</SectionContent>
      </Section>
      <Section title="Tags">
        {job.tags.length > 0 ? (
          <TagChipList tags={job.tags} />
        ) : (
          <SectionContent>No tags added yet.</SectionContent>
        )}
      </Section>
      <Section title="Link to apply">
        {job.externalApplyLink ? (
          <a
            href={job.externalApplyLink}
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 underline"
          >
            Open job post
          </a>
        ) : (
          <SectionContent>No link to apply added yet.</SectionContent>
        )}
      </Section>
      <Section title="Description">
        <SectionContent className="whitespace-pre-wrap">
          {job.description || "No description added yet."}
        </SectionContent>
      </Section>
      <Section title="Notes">
        <JobNotesForm jobId={job.id} initialNotes={job.notes} filters={filters} />
      </Section>
    </div>
  );

  return (
    <div className="w-full sm:min-w-[36rem]">
      <Tabs
        defaultTabId="job-information"
        tabsListClassName="sticky top-12 bg-white"
        onTabChange={(tabId) => {
          if (tabId === "ai-interview-prep") {
            setHasOpenedInterviewPrepTab(true);
          }
        }}
        items={[
          { id: "job-information", label: "Job information", content: renderJobContent },
          {
            id: "ai-interview-prep",
            label: "AI interview prep",
            content: (
              <div className="min-h-[70vh]">
                {hasOpenedInterviewPrepTab ? <LazyAIInterviewPrep job={job} /> : null}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default JobView;
