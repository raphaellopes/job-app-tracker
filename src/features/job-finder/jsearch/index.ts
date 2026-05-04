/**
 * JSearch (RapidAPI) integration: wire JSON (DTO) → validated parse → `JobFinderItem` domain rows.
 * Import from `@/features/job-finder/jsearch` in API routes; keep UI/data hooks on `../api` and `../types`.
 */
export type { JSearchJobDto, JSearchSearchResponseDto } from "./dto";
export {
  jSearchJobDtoSchema,
  jSearchJobHighlightsDtoSchema,
  jSearchSearchResponseDtoSchema,
  parseJSearchJobDto,
  parseJSearchSearchResponseDto,
} from "./dto";
export {
  mapJSearchJobDtoToJobFinderItem,
  mapJSearchResponseToJobFinderSearch,
} from "./map-to-job-finder";
