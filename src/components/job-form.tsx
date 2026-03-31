import { Job } from "@/db/schema";
import { createJob, updateJob } from "@/actions/jobs";
import { JobStatusType } from "@/actions/jobs";
import Input from "./form/input";
import Textarea from "./form/textarea";
import Select from "./form/select";

interface JobFormProps {
  job?: Job | null;
  initialStatus?: JobStatusType;
}

export function JobForm({ job, initialStatus }: JobFormProps) {
  const statusValue = initialStatus || job?.status;

  return (
    <div className="">
      <form action={job ? updateJob : createJob} className="flex flex-col gap-4 max-w-md">
        {job && <input type="hidden" name="id" value={job.id} />}
        <Input
          label="Company Name"
          name="companyName"
          defaultValue={job?.companyName}
          placeholder="Company Name"
          required
        />
        <Input
          label="Position"
          name="jobTitle"
          defaultValue={job?.jobTitle}
          placeholder="Position"
          className="border p-2 rounded"
          required
        />
        <Select
          label="Status"
          name="status"
          defaultValue={statusValue}
          options={[
            { label: "Wishlist", value: "WISHLIST" },
            { label: "Applied", value: "APPLIED" },
            { label: "Interviewing", value: "INTERVIEWING" },
            { label: "Offer", value: "OFFER" },
            { label: "Rejected", value: "REJECTED" },
          ]}
        />
        <Input
          label="Salary Range"
          name="salaryRange"
          defaultValue={job?.salaryRange || ""}
          placeholder="Salary Range"
        />
        <Textarea label="Notes" name="notes" defaultValue={job?.notes || ""} placeholder="Notes" />

        <div className="flex">
          <button type="submit" className="button-primary w-full">
            {job ? "Update Job" : "Add Job"}
          </button>
        </div>
      </form>
    </div>
  );
}
