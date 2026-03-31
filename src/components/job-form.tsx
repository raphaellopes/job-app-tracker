"use client";

import { useFormik } from "formik";
import * as Yup from "yup";

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

const schema = Yup.object().shape({
  companyName: Yup.string().required("Company name is required"),
  jobTitle: Yup.string().required("Position is required"),
  status: Yup.string().required("Status is required"),
  // @TODO: convert this to a number range later
  salaryRange: Yup.string().optional(),
  notes: Yup.string().optional(),
});

export function JobForm({ job, initialStatus }: JobFormProps) {
  const statusValue = initialStatus || job?.status || "WISHLIST";
  const formik = useFormik({
    initialValues: {
      companyName: job?.companyName || "",
      jobTitle: job?.jobTitle || "",
      status: statusValue || "",
      salaryRange: job?.salaryRange || "",
      notes: job?.notes || "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      const data = new FormData();
      data.append("companyName", values.companyName);
      data.append("jobTitle", values.jobTitle);
      data.append("status", values.status);
      data.append("salaryRange", values.salaryRange);
      data.append("notes", values.notes);

      if (job) {
        data.append("id", job.id.toString());
        await updateJob(data);
      } else {
        await createJob(data);
      }
    },
  });
  const { errors, touched, getFieldProps } = formik;

  const getError = (field: string) => {
    return errors[field as keyof typeof errors] && touched[field as keyof typeof touched]
      ? errors[field as keyof typeof errors]
      : null;
  };

  return (
    <div className="">
      <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4 max-w-md">
        <Input
          id="companyName"
          label="Company Name"
          placeholder="Company Name"
          error={getError("companyName")}
          {...getFieldProps("companyName")}
        />
        <Input
          id="jobTitle"
          label="Position"
          placeholder="Position"
          error={getError("jobTitle")}
          {...getFieldProps("jobTitle")}
        />
        <Select
          id="status"
          label="Status"
          options={[
            { label: "Wishlist", value: "WISHLIST" },
            { label: "Applied", value: "APPLIED" },
            { label: "Interviewing", value: "INTERVIEWING" },
            { label: "Offer", value: "OFFER" },
            { label: "Rejected", value: "REJECTED" },
          ]}
          error={getError("status")}
          {...getFieldProps("status")}
        />
        <Input
          id="salaryRange"
          label="Salary Range"
          placeholder="Salary Range"
          error={getError("salaryRange")}
          {...getFieldProps("salaryRange")}
        />
        <Textarea
          id="notes"
          label="Notes"
          placeholder="Notes"
          error={getError("notes")}
          {...getFieldProps("notes")}
        />

        <div className="flex">
          <button type="submit" className="button-primary w-full">
            {job ? "Update Job" : "Add Job"}
          </button>
        </div>
      </form>
    </div>
  );
}
