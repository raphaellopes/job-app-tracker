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
  description: Yup.string().optional(),
  tags: Yup.string().optional(),
});

export function JobForm({ job, initialStatus }: JobFormProps) {
  const statusValue = initialStatus || job?.status || "WISHLIST";
  const formik = useFormik({
    initialValues: {
      companyName: job?.companyName || "",
      jobTitle: job?.jobTitle || "",
      status: statusValue || "",
      salaryRange: job?.salaryRange || "",
      description: job?.description || "",
      tags: job?.tags?.join(", ") || "",
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      const data = new FormData();
      data.append("companyName", values.companyName);
      data.append("jobTitle", values.jobTitle);
      data.append("status", values.status);
      data.append("salaryRange", values.salaryRange);
      data.append("description", values.description);
      data.append("tags", values.tags);

      try {
        if (job) {
          data.append("id", job.id.toString());
          await updateJob(data);
        } else {
          await createJob(data);
        }
      } catch (error) {
        // @TODO: apply some logger here to trace the error
        console.error("Error submitting form:", error);
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
          placeholder="e.g. Google, Apple, Facebook"
          error={getError("companyName")}
          {...getFieldProps("companyName")}
        />
        <Input
          id="jobTitle"
          label="Position"
          placeholder="e.g. Software Engineer, Product Manager, etc."
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
        <Input
          id="tags"
          label="Tags"
          placeholder="Front-end, Remote, React, etc."
          error={getError("tags")}
          {...getFieldProps("tags")}
        />
        <Textarea
          id="description"
          label="Description"
          placeholder="Paste the job description for AI analysis later..."
          error={getError("description")}
          rows={6}
          {...getFieldProps("description")}
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
