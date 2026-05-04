import { z } from "zod";

/**
 * Wire shape from JSearch / RapidAPI (partial, snake_case). Unknown keys are preserved via looseObject.
 */
export const jSearchJobHighlightsDtoSchema = z
  .looseObject({
    Qualifications: z.array(z.string()).optional(),
    Responsibilities: z.array(z.string()).optional(),
  })
  .partial()
  .nullable()
  .optional();

/** One job row from the provider (all fields optional; extra keys allowed). */
export const jSearchJobDtoSchema = z.looseObject({
  job_id: z.string().optional(),
  job_title: z.string().optional(),
  employer_name: z.string().optional(),
  employer_logo: z.union([z.string(), z.null()]).optional(),
  job_publisher: z.string().optional(),
  job_employment_type: z.string().optional(),
  job_employment_types: z.array(z.string()).optional(),
  job_apply_link: z.string().optional(),
  job_description: z.string().optional(),
  job_min_salary: z.number().nullable().optional(),
  job_max_salary: z.number().nullable().optional(),
  job_salary_currency: z.string().nullable().optional(),
  job_salary_period: z.string().nullable().optional(),
  job_is_remote: z.boolean().optional(),
  employer_company_type: z.string().nullable().optional(),
  job_naics_name: z.string().nullable().optional(),
  job_city: z.string().nullable().optional(),
  job_state: z.string().nullable().optional(),
  job_country: z.string().nullable().optional(),
  job_required_skills: z.array(z.string()).nullable().optional(),
  job_highlights: jSearchJobHighlightsDtoSchema,
});

export type JSearchJobDto = z.infer<typeof jSearchJobDtoSchema>;

export const jSearchSearchResponseDtoSchema = z.looseObject({
  data: z.union([z.array(z.unknown()), z.null()]).optional(),
});

export type JSearchSearchResponseDto = z.infer<typeof jSearchSearchResponseDtoSchema>;

export function parseJSearchSearchResponseDto(raw: unknown) {
  return jSearchSearchResponseDtoSchema.safeParse(raw);
}

/** Best-effort parse of a single row so one malformed item does not fail the whole page. */
export function parseJSearchJobDto(raw: unknown): JSearchJobDto {
  const parsed = jSearchJobDtoSchema.safeParse(raw);
  return parsed.success ? parsed.data : ({} as JSearchJobDto);
}
