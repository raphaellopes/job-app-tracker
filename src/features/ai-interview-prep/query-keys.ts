export const aiInterviewPrepKeys = {
  all: ["aiInterviewPrep"] as const,
  byJobId: (jobId: number) => [...aiInterviewPrepKeys.all, "byJobId", jobId] as const,
};
