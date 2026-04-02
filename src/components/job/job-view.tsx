import { Job } from "@/db/schema";
import type { InterviewPrepResult } from "@/actions/gemini";
import TagChipList from "@/components/tag-chip-list";
import JobNotesForm from "@/components/job/job-notes-form";
import AIInterviewPrep from "@/components/ai-interview-prep/ai-interview-prep";

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

const JobView: React.FC<JobViewProps> = ({ job, initialInterviewPrep = null }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-[36rem]">
      <div className="space-y-5">
        <Section title="Tags">
          {job.tags.length > 0 ? (
            <TagChipList tags={job.tags} />
          ) : (
            <p className="text-sm text-gray-600">No tags added yet.</p>
          )}
        </Section>

        <Section title="Description">
          <p className="text-sm text-gray-600 whitespace-pre-wrap">
            {job.description || "No description added yet."}
          </p>
        </Section>

        <Section title="Notes">
          <JobNotesForm jobId={job.id} initialNotes={job.notes} />
        </Section>
      </div>

      <div>
        <AIInterviewPrep job={job} initialSavedResult={initialInterviewPrep} />
      </div>
    </div>
  );
};

export default JobView;
