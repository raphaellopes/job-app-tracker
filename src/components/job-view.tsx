import { Job } from "@/db/schema";
import TagChipList from "@/components/tag-chip-list";
import JobNotesForm from "@/components/job-notes-form";
import { AIInterviewPrep } from "@/components/ai-interview-prep";

interface JobViewProps {
  job: Job;
}

const JobView: React.FC<JobViewProps> = ({ job }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-[36rem]">
      <div className="space-y-5">
        <section>
          <h3 className="text-sm font-semibold text-gray-700">Tags</h3>
          <TagChipList tags={job.tags} className="mt-2" />
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-700">Description</h3>
          <p className="mt-2 text-sm text-gray-600 whitespace-pre-wrap">
            {job.description || "No description added yet."}
          </p>
        </section>

        <section>
          <h3 className="text-sm font-semibold text-gray-700">Notes</h3>
          <div className="mt-2">
            <JobNotesForm jobId={job.id} initialNotes={job.notes} />
          </div>
        </section>
      </div>

      <div>
        <AIInterviewPrep job={job} />
      </div>
    </div>
  );
};

export default JobView;
