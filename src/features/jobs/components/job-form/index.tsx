"use client";

import { unstable_rethrow, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { toast } from "sonner";
import * as Yup from "yup";

import Button from "@/components/buttons/button";
import Input from "@/components/form/input";
import Select from "@/components/form/select";
import Textarea from "@/components/form/textarea";

import { createJob, updateJob } from "@/actions/jobs";

import { jobsKeys } from "@/features/jobs/query-keys";
import type { Job, JobStatusType } from "@/features/jobs/types";

interface JobFormProps {
  job?: Job | null;
  initialStatus?: JobStatusType;
}

const schema = Yup.object().shape({
  companyName: Yup.string().required("Company name is required"),
  jobTitle: Yup.string().required("Position is required"),
  status: Yup.string().required("Status is required"),
  salaryRange: Yup.string().optional(),
  description: Yup.string().optional(),
  tags: Yup.string().optional(),
});

export function JobForm({ job, initialStatus }: JobFormProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
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
      if (job) {
        data.append("id", job.id.toString());
      }

      const returnSearchParams = new URLSearchParams(searchParams.toString());
      returnSearchParams.delete("add");
      returnSearchParams.delete("edit");
      returnSearchParams.delete("status");
      const returnPath = returnSearchParams.toString()
        ? `${pathname}?${returnSearchParams.toString()}`
        : pathname;

      try {
        const result = job ? await updateJob(data) : await createJob(data);
        if ("success" in result && result.success) {
          await queryClient.invalidateQueries({ queryKey: jobsKeys.all });
          toast.success(job ? "Job updated successfully." : "Job added successfully.");
          router.replace(returnPath);
          router.refresh();
        }
      } catch (error) {
        unstable_rethrow(error);
        console.error("Error submitting form:", error);
      }
    },
  });
  const { errors, touched, getFieldProps } = formik;

  const getError = (field: string) =>
    errors[field as keyof typeof errors] && touched[field as keyof typeof touched]
      ? errors[field as keyof typeof errors]
      : null;

  return (
    <div>
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
          <Button type="submit" className="w-full">
            {job ? "Update Job" : "Add Job"}
          </Button>
        </div>
      </form>
    </div>
  );
}
