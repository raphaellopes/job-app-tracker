import classNames from "classnames";

import AIInterviewPrep from "@/components/ai-interview-prep/ai-interview-prep";
import JobNotesForm from "@/components/job/job-notes-form";
import TagChipList from "@/components/tag/tag-chip-list";
import Tabs from "@/components/tabs";

import { Job } from "@/db/schema";

import type { InterviewPrepResult } from "@/actions/gemini";

interface JobViewProps {
  job: Job;
  initialInterviewPrep?: InterviewPrepResult | null;
}

interface SectionProps {
  title: string;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => {
  return (
    <section className="space-y-1">
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
      <div>{children}</div>
    </section>
  );
};

const SectionContent: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  className,
  children,
}) => <p className={classNames("text-sm text-gray-600", className)}>{children}</p>;

const JobView: React.FC<JobViewProps> = ({ job, initialInterviewPrep = null }) => {
  const jobInformationContent = (
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
        <JobNotesForm jobId={job.id} initialNotes={job.notes} />
      </Section>
    </div>
  );

  return (
    <div className="w-full sm:min-w-[36rem]">
      <Tabs
        defaultTabId="job-information"
        items={[
          {
            id: "job-information",
            label: "Job information",
            content: jobInformationContent,
          },
          {
            id: "ai-interview-prep",
            label: "AI interview prep",
            content: <AIInterviewPrep job={job} initialSavedResult={initialInterviewPrep} />,
          },
        ]}
      />
    </div>
  );
};

export default JobView;
