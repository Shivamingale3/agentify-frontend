import { z } from 'zod';
import { IncidentStatus, IncidentSeverity } from '../constants/incident.constants.js';

export const getIncidentsByFilterValidationSchema = z.object({
  searchQuery: z.string().optional(),
  status: z
    .enum(IncidentStatus, 'Status can only be : OPEN, INVESTIGATING, IN_PROGRESS, RESOLVED, CLOSED')
    .optional()
    .nullish(),
  severity: z
    .enum(IncidentSeverity, 'Severity can only be : LOW, MEDIUM, HIGH, CRITICAL')
    .optional()
    .nullish(),
  pageSize: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .refine(
      (val) => !Number.isNaN(val) && val >= 1 && val <= 100,
      'Page size must be a number at least 1 and at most 100',
    )
    .default(10)
    .transform(Number),
  pageNo: z
    .string()
    .transform((val) => Number.parseInt(val, 10))
    .refine((val) => !Number.isNaN(val) && val >= 1, 'Page number must be a number at least 1')
    .default(1)
    .transform(Number),
});
